const jwt = require("jsonwebtoken");

exports.clientIsAuthenticated = (socket, next) => {
  const { Authorization } = socket.handshake.auth;
  const { receiverId } = socket.handshake.query;

  if (!Authorization) {
    const error = new Error("Add Authorization Header");
    error.statusCode = 401;
    return next(error);
  }

  const token = Authorization.split(" ")[1];
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
  socket.data.receiverId = receiverId
  next();
};
