const { clientIsAuthenticated } = require("./middleware/is-auth-socket");

let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer);
    io.use(clientIsAuthenticated);

    io.on("connection", (socket) => {
      console.log(
        `User with id ${socket.data.userId} and socket id ${socket.id} has connected`
      );

      const uniquifiedRoomName = `${socket.data.userId} ${socket.data.receiverId}`
        .split(" ")
        .sort((a, b) => (a > b ? 1 : -1))
        .join("-and-");

      socket.join(uniquifiedRoomName);
  
    });
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
