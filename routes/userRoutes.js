const express = require('express');
// const multer = require('multer'); //MULTER  IMPORT
const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');


const router = express.Router(); 
// const upload = multer({dest: 'public/img/users'});

// Auth routes
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protected routes
router.use(authController.protect); 

router.patch('/updateMyPassword', authController.updatePassword);


// Admin routes
router
  .route('/')
  .get(authController.restrictTo('user'), userController.getAllUsers)
  .post(userController.createUser);

router.route('/me').get(userController.getMe, userController.getUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch( userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
  .delete( authController.restrictTo('admin'), userController.deleteUser);

  //This router stack is to be watched again. 



module.exports = router;
