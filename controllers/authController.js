const jwt = require('jsonwebtoken');
const { promisify } = require('util');

// const bcrypt = require('bcryptjs');

const User = require('./../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { appendFile } = require('fs');
// const { appendFile } = require('fs');
// const { useImperativeHandle } = require('react');
// const AppError = require('../utils/AppError');

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
