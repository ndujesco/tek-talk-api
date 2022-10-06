const { param, validationResult, query } = require("express-validator");
const jwt = require("jsonwebtoken");
const API_KEYS = [process.env.api1, process.env.api2, process.env.api3];

exports.maybeAuthenticated = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.userId = null;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    req.userId = null;
    return next();
  }
  if (!decodedToken) {
    req.userId = null;
    return next();
  }
  req.userId = decodedToken.userId;
  next();
};
