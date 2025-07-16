const express = require('express');
const morgan = require('morgan');
const pug = require('pug');
const path = require("path");

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require("./routes/reviewRoutes");
const viewRouter = require('./routes/viewRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.set('view-engine', 'pug');
// app.set('views', `${__dirname}/views`);
app.set('views', path.join(__dirname, 'views')); //This is the path to the views folder, where we have our pug files.



// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const catchAsync = fn =>{
//   return async (req, res,next) =>{
//     fn(req, res).catch(err=>next(err))
//   }
// }

app.use(express.json());
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public'))); //This is the path to the public folder, where we have our static files like css, js, images, etc
app.use(express.urlencoded({ extended: true })); //This is for parsing the body of the request, so that we can access the data in req.body


app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/views', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.use('*', function(req, res, next) {
  // const err = new Error(`Could not find ${req.originalUrl} on the server.`);
  // err.statusCode = err.statusCode;
  // err.status = 'fail';
  // next(err);
  next(new AppError(`Cannot find ${req.originalUrl} on the server.`, 404));
});

app.use(globalErrorHandler);
// a quick note we made a global error route and then made an error up in there and then we used
//app.use downwards and then  assigned the status code and status there. Finally, we responsed
//with status: fail and error message there.  This is a use of global error handling middleware,

module.exports = app;
