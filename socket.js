const { clientIsAuthenticated } = require("./middleware/is-auth-socket");

let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer);
    io.use(clientIsAuthenticated);

    io.on("connection", (socket) => {
      console.log(`User with id ${socket.data.userId} has connected`);
    });
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
