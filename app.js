require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");

const { catchError } = require("./utils/catch-error");
const authRoutes = require("./routes/auth");
const crudRoutes = require("./routes/crud");
const passwordRoutes = require("./routes/password-reset");
const {
  isAuthorized,
  isAuthenticated,
  checkApi,
} = require("./middleware/is-auth");

// console.log(process.env.MONGO_USERNAME, process.env.MONGO_PASSWORD);
const MONGODB_PRACTICE_URI = "mongodb://localhost:27017/tektalkDB";
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.83uvt.mongodb.net/tektalkDB?retryWrites=true&w=majority`;
const app = express();
const main = async () => {
  await mongoose.connect(MONGODB_URI);
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(bodyParser.json());
app.use(checkApi, isAuthorized);

app.use("/auth", authRoutes);
app.use(crudRoutes);
app.use(passwordRoutes);

app.use((error, req, res, next) => {
  catchError(error, res);
});

app.use((req, res) => {
  res.status(404).json({ status: 404, message: "Endpoint doesn't exist" });
});

main()
  .then((connected) => {
    app.listen(process.env.PORT || 8080);
  })
  .catch((err) => {
    console.log(err);
  });
