const User = require('./../controllers/userController');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../controllers/errorController');

exports.signUp = catchAsync(async (req, res, next) => {
  //
  const newUser = await User.createUser(req.body);
});
