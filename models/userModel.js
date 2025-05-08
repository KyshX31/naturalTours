const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name']
  },

  email: {
    type: String,
    required: [true, 'A user must provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please Provide A Valid Email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8
  }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
