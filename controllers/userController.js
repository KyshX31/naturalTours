const factory = require("./handlerFactory");
const User = require("./../models/userModel");

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Checking if my middleware stacks work fine!'
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
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

exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User); //Do not update the user passwords with this.
exports.createUser = factory.createOne(User);
