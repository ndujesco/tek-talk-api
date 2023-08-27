const jwt = require("jsonwebtoken");

exports.clientIsAuthenticated = (socket, next) => {
  const { token } = socket.handshake.headers;
  const { receiverId } = socket.handshake.query;
  if (!token) {
    const error = new Error("Invalid connection");
    error.statusCode = 401;
    return next(error);
  }

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
  socket.data.receiverId = receiverId;
  next();
};
