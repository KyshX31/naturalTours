const factory = require("./handlerFactory");
const User = require("./../models/userModel");

// exports.getAllUsers = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'Checking if my middleware stacks work fine!'
//   });
// };
exports.getAllUsers = factory.getAll(User);
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; //req.user is set by the protect middleware.
  next();
};
// exports.createUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };
//
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

exports.getUser = factory.getOne(User); //Populate does not exist here  may be.
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User); //Do not update the user passwords with this.
exports.createUser = factory.createOne(User);
