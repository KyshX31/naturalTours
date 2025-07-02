const { resource } = require("../app");
const Review = require("../models/reviewModel");
const {catchAsync} = require("../utils/catchAsync");
const mongoose = require("mongoose")

exports.getAllReviews =  catchAsync(async function(req,res,next){
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    //
    const reviews = await Review.find(filter);

res.status(200).json({
    status: "Success",
    results: reviews.length,
    data: {
        reviews
    }
})
});

exports.createReview = catchAsync(
    // Allow the nested routes. . . 
    async function(req,res,next){
        //
        if (req.params.tourId) {
            req.body.tour = mongoose.Types.ObjectId(req.params.tourId);
        }
        if (!req.body.user) {
            req.body.user = req.user.id;
        }
        const newReview = await Review.create(req.body);
        //
        res.status(201).json({
            status: "success",
            data:{
                review: newReview
            }
        })
    }
);

