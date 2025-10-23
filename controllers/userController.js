const factory = require("./handlerFactory");
const User = require("./../models/userModel");
const pathForFileStorage = 'public/img/users';
const multer = require('multer'); //multer --> multer storage --> multer filter --> multer config.
const AppError = require("../utils/AppError");
const { catchAsync } = require("../utils/catchAsync");
const sharp = require("sharp");
const fs = require('fs');
const path = require('path');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("📁 Saving file to:", pathForFileStorage);
//     cb(null, pathForFileStorage)
//   },
//   filename:(req,file, cb)=>{
//     const ext = file.mimetype.split('/')[1];
//     const filename = `user-${req.user._id}-${Date.now()}.${ext}`;
//     console.log("📝 Generated filename:", filename);
//     cb(null, filename)
//   }
// });

const multerStorage = multer.memoryStorage(); //it saves file in: req.file.buffer//

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




exports.uploadUserPhoto = upload.single('photo'); //Return the middleware function now for uploading files.

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log("🔥 RESIZE MIDDLEWARE STARTED 🔥");
  console.log("req.file:", req.file);
  console.log("This is the request dot file. This is the middleware that should run. 🪔🪔🪔🪔🪔🪔🪔🪔🪔🪔🪔🪔");
  
  if (!req.file) {
    console.log("No file found in request, skipping resize middleware");
    return next();
  }

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // Ensure directory exists
  const uploadDir = 'public/img/users';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`${uploadDir}/${req.file.filename}`);
  
  console.log(`✅ Image resized and saved as: ${req.file.filename}`);
  next();
})




const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


// exports.getAllUsers = (req, res) => {
//   res.status(500).json({

//     status: 'error',
//     message: 'Checking if my middleware stacks work fine!'
//   });
// };
exports.getAllUsers = factory.getAll(User);
// exports.getUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'This route is not yet defined!'
//   });
// };

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id; //req.user is set  by the protect middleware.
  next();
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

exports.getUser = factory.getOne(User); //Populate does not exist here  may be.
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User); //Do not update the user passwords with this.




exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  console.log(
    "update me handler is being used up in here.  .  . . .👹👹👹👹👹👹👹👹👹👹👹👹👹👹"
  );
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  if (req.file) filteredBody.photo = req.file.filename;
  else { console.log("There is no file in the request 🤡🤡🤡🤡🤡🤡🤡🤡") };

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


exports.createUser = factory.createOne(User);
