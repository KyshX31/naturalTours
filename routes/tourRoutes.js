const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('../controllers/authController');
const reviewController = require("../controllers/reviewController");
const reviewRouter = require('../routes/reviewRoutes');


const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);


router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo("admin",'lead-guide'),
    tourController.uploadTourImages, 
    tourController.resizeTourImages, 
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour
  );

router.route('/:tourId/reviews').post(
  authController.protect,
  authController.restrictTo("user"),
  reviewController.createReview
);



router.route('/tours-within/:distance/center/:latLng/unit/:unit').get(tourController.getToursWithin);

router.route('/distance/:latlng/unit/:unit').get(tourController.getDistances);


module.exports = router;