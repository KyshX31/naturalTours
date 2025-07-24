const {catchAsync} = require("../utils/catchAsync");
const Tour = require("../models/tourModel");


exports.getOverview = catchAsync(async (req, res) => {
    const tours = await Tour.find()

    console.log("Get overview page is being served");
    res.status(200).render('base.pug', {
        tours: tours,
    });
});

exports.getTour = catchAsync(async (req, res) => {
    const tour = await Tour.findById(req.params.id);
    console.log("Get tour page is being served");
    res.status(200).render('overview.pug', {
        title: tour.name,
        message: tour.description
    });
});

 