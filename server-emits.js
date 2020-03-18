module.exports = io => {
  let connectedSockets = [];

  io.on("connection", socket => {
    console.log(socket.request.user.firstName + " has connected");
    io.emit("welcome", "Hello from server");
    socket.on("disconnect", () => {
      console.log("User " + socket.request.user.firstName + " disconnected");
    });
  });
};
