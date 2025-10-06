const {catchAsync} = require("../utils/catchAsync");
const Tour = require("../models/tourModel");

//This controller basically shows all the tours in the database.
exports.getOverview = catchAsync(async (req, res, next) => {
    const tours = await Tour.find()

    console.log("Get overview page is being served with tours", tours);

    res.status(200).render('overview.pug', {
        title: "All Tours",
        tours: tours,
    });
});

exports.getTour = catchAsync(async (req, res) => {
    console.log("Get tour page is being served with slug,😂😂😂😂😂😂😂😂😂😂😂😂", req.params.slug);
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    console.log("Get tour page is being served with tour,", tour);
    
    res.status(200).render('_tour.pug', {
       tour: tour
    });
});

 
exports.getLoginForm = (req,res) => {
    //designing the login form. . . 
    res.status(200).render('login.pug')
    
}