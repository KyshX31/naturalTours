const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const User = require('./../models/userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
// const { useImperativeHandle } = require('react');
// const AppError = require('../utils/AppError');

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

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

  if (!userExists) {
    return next(new AppError('User does not exist', 400));
  }

  const userPasswordMatch = await bcrypt.compare(password, userExists.password);

  if (!userPasswordMatch) {
    return next(new AppError('Either email or password is incorrect', 400));
  }

  const token = jwt.sign({ id: userExists._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

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
