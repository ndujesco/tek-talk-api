exports.catchError = (error, res) => {
  console.log("An error has been caught");
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message, status });
};
