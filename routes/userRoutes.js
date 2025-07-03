const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router();

// Auth routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes
router.use(authController.protect); // Protect all routes after this middleware

router.patch('/updateMyPassword', authController.updatePassword);


// Admin routes
router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);




module.exports = router;
