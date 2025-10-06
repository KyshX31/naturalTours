const express = require("express");
const viewsController = require("../controllers/viewsController");
const authController = require("../controllers/authController")
const router = express.Router();


// authControlller.isLoggedIn could be used here as router.use();

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/login', authController.isLoggedIn,  viewsController.getLoginForm);

// router.get('/tour', viewsController.getOverview);

router.get('/tours/:slug',authController.isLoggedIn,   viewsController.getTour); 


module.exports  = router;
 