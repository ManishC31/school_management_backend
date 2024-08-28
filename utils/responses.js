exports.ApiResponse = (res, code = 200, message, data) => {
  return res.status(code).json({
    success: true,
    message: message,
    data: data,
  });
};

exports.ApiError = (res, code = 400, message) => {
  return res.status(code).json({
    success: false,
    message: message,
  });
};

exports.InternalError = (res, message) => {
  return res.status(500).json({
    successL: false,
    message: message,
  });
};
