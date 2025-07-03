const {catchAsync} = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const { model } = require('mongoose');

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
    const doc = await Tour.create(req.body);

    if(!doc) return next(new AppError("No document was created right away", 500));

    res.status(201).json({
        status: 'success',
        data: {
            tour: doc
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
        if(popOptions) query = query.populate(popOptions);
        
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

