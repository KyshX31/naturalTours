function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: 'fail',
    message: err.message,
    stack: err.stack,
    error: err
  });
}

function sendErrorProd(err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message
    });
  } else {
    // 1- Log the error message to the console.
    //2- Send the generic error message to the client.
    res.status(500).json({
      status: 'Fail',
      message: 'Fatal Error Occured Babu.'
    });
  }
}

module.exports = (err, req, res, next) => {
  //
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
// this is global error handling middleware.
