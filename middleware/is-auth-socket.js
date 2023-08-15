const jwt = require("jsonwebtoken");

exports.clientIsAuthenticated = (socket, next) => {
  const { authorization } = socket.handshake.headers;

  if (!authorization) {
    const error = new Error("Add Authorization Header");
    error.statusCode = 401;
    throw error; // it'll catch it prolly because of next()
  }

  const token = authorization.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    err.statusCode = 500;
    err.message = "Unable to verify token";
    return next(err);
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;
    return next(err);
  }

  socket.data.userId = decodedToken.userId;
  next();
};
