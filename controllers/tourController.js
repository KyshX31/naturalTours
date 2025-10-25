const Tour = require('./../models/tourModel');
const Review = require("./../models/reviewModel");
const APIFeatures = require('./../utils/apiFeatures');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const factory = require("./handlerFactory");

const multer = require("multer");
const  multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {
  console.log("🔍 Multer Filter - File received:", { 
    fieldname: file.fieldname, 
    originalname: file.originalname,
    mimetype: file.mimetype, 
    size: file.size 
  }); 

  if (file.mimetype.startsWith('image')) {
    console.log("✅ File accepted - it's an image");
    cb(null, true)
  } else {
    console.log("❌ File rejected - not an image");
    cb(new AppError("It is not an image! Please upload an image only.", 400), false)
  }
}
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})
 
exports.uploadTourImages = upload.fields([
  {name: 'imageCover', maxCount: 1},
  {name: 'images', maxCount: 3}
])

exports.resizeTourImages = (req, res, next)=>{
  console.log("showing request.file uploaded from the multer and saved in RAM. --tourController");
  console.log(req.files);
}


exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// });

exports.getAllTours = factory.getAll(Tour); //getAll handler of the factory will handle

// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   console.log(JSON.stringify(tour, null, 2));
//   // .
//   // populate({
//   //   path: "guides",
//   //   select: "-_v -passwordChangedAt"
//   // })

//   // Tour.findOne({ _id: req.params.id })

//   if (!tour) {
//     return next(new AppError('Tour was not found', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });
// changed as below:

exports.getTour = factory.getOne(Tour, { path: "reviews" }); //getOne handler of the factory will handle
//fetching data from DB and populate and return.



// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newTour = new Tour({})
//   // newTour.save()

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// });
// updated as below:
exports.createTour = factory.createOne(Tour);

// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true
//   });

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// });
// changed to below:

exports.updateTour = factory.updateOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   await Tour.findByIdAndDelete(req.params.id);

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// });
// changed as below.

exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { _id: { $ne: 'EASY' } }
    // }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

exports.getToursWithin = catchAsync(async function (req, res, next) {
  const { distance, latLng, unit } = req.params;
  //all these will come from req.params.

  const [lat, lng] = latLng.split(','); //assigning the lat and lng into their own variables.

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //converting the distance to radians, if the unit is miles, we divide by 3963.2, if it is kilometers, we divide by 6378.1.


  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng in the format lat,lng', 400));
  }

  console.log(distance, lat, lng, unit);

  const tours = await Tour.find({
    startLocation: {
      //we need to add an index to the start location.

      $geoWithin: {

        $centerSphere: [[lng, lat], radius]

      }
    }
  })


  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
  // res.status(200).json({
  //   data: {
  //     distance,  // res.status(200).json({
  //   data: {
  //     distance,
  //     lat,
  //     lng,
  //     unit
  //   }
  // })
  //     lat,
  //     lng,
  //     unit
  //   }
  // })

});


exports.getDistances = catchAsync(async function (req, res, next) {
  //
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng in the format lat,lng', 400));
  }
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001; //if the unit is miles, we multiply by 0.000621371, if it is kilometers, we multiply by 0.001. 

  const distances = await Tour.aggregate([


    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1] //This is my location, we are multiplying by 1 to convert the string to number.
        },
        distanceField: 'distancie', //this is the field where we will store the distance.
        spherical: true, //this is for the earth like sphere, where all our data are located.
        //BY DEFAULT, THE DISTANCE IS IN METERS, SO WE NEED TO CONVERT IT TO KILOMETERS OR MILES.
        //if the unit is miles, we multiply by 0.000621371, if it is kilometers, we multiply by 0.001.
        distanceMultiplier: multiplier //this is for the unit conversion, if it is miles, we multiply by 0.000621371, if it is kilometers, we multiply by 0.001.
      }
    },

    {
      //project stage now. We will project the fields we want to return.
      $project: {
        distancie: 1,
        name: 1, //name of  tour data
        slug: 1
      }
    }
  ]);



  res.status(200).json({
    status: 'success',
    data: {
      distances
    }
  })
});

