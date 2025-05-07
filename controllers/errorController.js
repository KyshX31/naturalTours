const AppError = require('../utils/AppError');

const handleCastError = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const message = `Duplicated Entries to already used. Please go for an another. ${
    err.blablabla
  }`;
  return new AppError(message, 400);
};

const handleValidationError = () => {
  const message = `Valiation Error has occured`;
  return new AppError(message, 400);
};

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
      status: 'failed to deliver mesage',
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
    let error = { ...err };

    if (error.name === 'CastError') {
      error = handleCastError(error);
    }

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    if (err.name === 'ValidationError') {
      handleValidationError(error);
    }
    sendErrorProd(error, res);
  }
};
// this is global error handling middleware.
