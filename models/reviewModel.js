const mongoose = require("mongoose");
const validator = require("validator");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, "Review can not be empty."]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: "Tour",
        required: [true, "Review Must belong to a tour"]
    },

    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User must be there for any review to take a place."]
    }


},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


reviewSchema.index({ user: 1, tour: 1 }, { unique: true }); //This will make sure that a user can only review a tour once.

reviewSchema.pre(/^find/, function () {
    //
    this.populate({
        path: "tour",
        select: "name -_id",
    }).populate({
        path: "user",
        select: "name photo"
    })
});

// reviewSchema.statics.calcAverage = async function (tourId) {
//     //
//     const stats = await this.aggregate([
//         {
//             $match: {
//                 tour: tourId
//             }
//         },
//         {
//             $group: {
//                 _id: "$tour",
//                 nRating: { $sum: 1 },
//                 avgRating: { $avg: "$rating" }
//             }
//         }
//     ])
//     console.log(stats);
//     //After we will calculate the statistics by aggregation, we will update the tour.
//     Tour.findByIdAndUpdate(tourId, {
//         ratingsQuantity: stats[0].nRating,
//         ratingsAverage: stats[0].avgRating
//     }, {
//         new: true, //This will return the updated document.
//         runValidators: true //This will run the validators on the updated document.
//     })
// }
//
//
reviewSchema.statics.calcAverage = async function (tourId) {
    const stats = await this.aggregate([
        { $match: { tour: tourId } },
        {
            $group: {
                _id: "$tour",
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }
            }
        }
    ]);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        // No reviews left, reset to defaults
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 1,
        });
    }
}




reviewSchema.post("save", function () {

    // Review.calcAverage(this.tour); // This is not working because the this keyword is not available in static methods.
    this.constructor.calcAverage(this.tour); // This is working because the this keyword is available
    //This.connstructor still points to the Document constructor, which is the Review model.
    //So, we can use this.constructor to call the static method calcAverage.
    //Since Review is a variable defined in the same file, we can user this.constructor to call the static method calcAverage.
    //We do not call next because we are using a post save hook, which means that the next middleware will be called automatically after this middleware is executed.
});

//
//


reviewSchema.pre(/^findOneAnd/, async function (next) {
    //we can not use post middleware  here, because query would not be available then after execution.
    this.r = await this.findOne();
    next();

});


reviewSchema.post(/^findOneAnd/, async function (next) {
    await this.r.constructor.calcAverage(this.r.tour);
});


const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
