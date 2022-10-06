const { param, validationResult, query } = require("express-validator");
const jwt = require("jsonwebtoken");
const API_KEYS = [process.env.api1, process.env.api2, process.env.api3];

exports.maybeAuthenticated = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    return (req.userId = null);
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    return (req.userId = null);
  }
  if (!decodedToken) {
    return (req.userId = null);
  }
  req.userId = decodedToken.userId;
  next();
};
