const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

// const bcrypt = require('bcryptjs');

const User = require('./../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const sendEmail = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt
  });

  // const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN
  // });
  const token = signToken(newUser._id);

  res.status(201).json({
    token,
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  //1- Check if email and password are existent in req.body
  //Check if user exists and password is correct
  //If everything is a yes, generate and send a jwt.

  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and password both must be existent first'));
  }

  const userExists = await User.findOne({ email }).select('+password');

  if (
    !userExists ||
    !(await userExists.correctPassword(password, userExists.password))
  ) {
    return next(
      new AppError('Either password or email is incorrect babe', 400)
    );
  }

  // const userPasswordMatch = await bcrypt.compare(password, userExists.password);

  // if (!userPasswordMatch) {
  //   return next(new AppError('Either email or password is incorrect', 400));
  // }

  // const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
  //   expiresIn: process.env.JWT_EXPIRES_IN
  // });

  const token = signToken(userExists._id);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production'
  });

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1- Check if token exists
  //2- Chck if the token is valid
  //3-Check if the user exists for that decoded valid token
  //4-Check if user changed his password after the token was issued to him/her.
  //5-log user in if all above steps are valid.

  console.log('req headers', req.headers);

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('token is', token);
  } else {
    return next(new AppError('User is not logged in. Please Log In', 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log('decoded is🍝🍝🍝🍝🍝', decoded);

  const userExists = await User.findById(decoded.id);
  console.log('🏳️🏳️🏳️', userExists);
  if (!userExists) {
    return next(
      new Error(
        'User is non existent. cannot give any resources on that user.',
        400
      )
    );
  }
  // console.log('decoded');
  // console.log(decoded);

  if (userExists.changedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed the password. Re login Again', 400)
    );
  }

  req.user = userExists;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have Permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //
  const { email } = req.body;
  const userFound = await User.findOne({ email });
  if (!userFound) {
    return next('User was not found', 404);
  }

  try {
    const resetToken = userFound.createPasswordResetToken(); //unhashed

    await userFound.save({ validateBeforeSave: false });

    const resetTokenURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/resetPassword/${resetToken}`;

    const message = `Forgot Your Password? Please reset it by submitting a patch request on the below URI.
  ${resetTokenURL}. Kindly ignore if you have not requested for a password change.`;
    //
    //
    const emailResponse = await sendEmail({
      email,
      subject: `Your password reset token is just valid for 10 minutes`,
      message
    });
    console.log('email response after reset mail trap: ', emailResponse);

    res.status(200).json({
      status: 'success',
      message: 'Password reset token has been sent successfully.'
    });
  } catch (err) {
    //do db operation: change the password reset token and password reset expiry
    userFound.createPasswordResetToken = undefined;
    userFound.passwordResetExpires = undefined;
    await userFound.save({ validateBeforeSave: false });
    return next(new AppError('Something went wrong🫣. Please Try Again', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({ passwordResetToken: hashedToken });
  console.log('The user found😨😨', user);
  if (!user) {
    return next(
      new AppError('Invalid User or Tokenor Token Expired. Please try again ')
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.createPasswordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token
  });
});
