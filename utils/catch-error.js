exports.catchError = (error, res) => {
  console.log(error.message);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message, status });
};
