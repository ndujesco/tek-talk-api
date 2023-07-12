require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

const { catchError } = require("./utils/help-functions");
const authRoutes = require("./routes/auth");
const crudRoutes = require("./routes/crud");
const passwordRoutes = require("./routes/password-reset");

const {
  isAuthorized,
  isAuthenticated,
  checkApi,
} = require("./middleware/is-auth");

if (!fs.existsSync("./images")) {
  fs.mkdirSync("./images");
}

const MONGODB_PRACTICE_URI = "mongodb://localhost:27017/tektalkDB";
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.83uvt.mongodb.net/tektalkDB?retryWrites=true&w=majority`;
const app = express();
const main = async () => {
  mongoose.set("strictQuery", false);
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now().toString() + "-" + file.originalname);
  },
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage }).fields([
    { name: "display" },
    { name: "backdrop" },
    { name: "image" },
  ])
);
app.use("/images", express.static(path.join(__dirname, "images")));
 //create the "/images path if it does not exist alraedy"

app.use(checkApi, isAuthorized);  // checks if API is valid.

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
    console.log("E deh rush!🚿");
  })
  .catch((err) => {
    console.log(err);
  });
