const {catchAsync} = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const { model } = require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model=> catchAsync(async (req, res, next) => {
const doc = await Model.findByIdAndDelete(req.params.id);
if(!doc){
    return next(new AppError('No document was found with that ID', 404)); 
}

    res.status(204).json({
        status: 'success', 
        data: null
    });
});
  

exports.updateOne = Model =>   catchAsync(async (req, res, next) => {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });

      if(!doc) return next(new AppError('Updating User Was Impossible for some reason. Please try again later.'));
      
    
      res.status(200).json({
        status: 'success',
        data: {
          doc
        }
      });
    });
 

exports.createOne = Model => catchAsync(async (req, res, next) => {

//********REVIEWS CREATION LEFT TO BE YET IMPLEMENTED */
    const doc = await Model.create(req.body);

    if(!doc) return next(new AppError("No document was created right away", 500));

    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    });
      });


// Implementing the getOne router handler.
//Instead for us for having just getting a data, we sometimes have a populate options.
//
exports.getOne = (Model, popOptions) => {
    //
 return   catchAsync(async(req,res,next)=>{
        //
        let query = Model.findById(req.params.id);

     if (popOptions) query = query.populate(popOptions); 
        
        const doc = await query;

        if(!doc){
            //
            return next(new AppError('No Document was found with that Id', 404));
        }

        res.status(200).json({
            status:"success",
            data:{
                data:doc
            }
        })
    })
}

exports.getAll = Model => catchAsync(async (req, res, next) => {
    // if it is to find a review, then tour route handler will have tourID, 
    //we will filter the reviews by that tourID.
    const filter = {};
    if (req.params.tourId) filter.tour = req.params.tourId;
    // EXECUTE QUERY
    const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query.explain();

    // SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            doc
        }
    });
});