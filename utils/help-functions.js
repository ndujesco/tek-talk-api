exports.catchError = (error, res) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message, status });
};

for (key in { name: "Ugo", age: 1 }) {
  console.log(key);
}
