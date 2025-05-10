const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    validate: {
      validator: function(el) {
        return el === this.password;
      }
    },
    message: 'Passwords must be the same.'
  },
  passwordChangedAt: Date,
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  }
});

userSchema.pre('save', async function(next) {
  //
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedAfter = function(JWTTimeStamp) {
  //
  if (this.passwordChangedAt) {
    console.log('this.password changed at❌❌', this.passwordChangedAt);
    console.log('sent jwt iat✔️✔️', JWTTimeStamp);

    const passwordChangedAt = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimeStamp < passwordChangedAt;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
