module.exports = io => {
  io.on("connection", socket => {
    console.log(socket.request.user.firstName + " has connected");
    io.emit("myemit", "Hello from server");
    socket.on("disconnect", () => {
      console.log("User " + socket.request.user.firstName + " disconnected");
    });
  });

  const news = io.of("/news").on("connection", socket => {
    news.emit("say", "HELLO FROM NEWS");
    socket.emit("cb", "Ally Mae", "Hi!!", data => {
      console.log(data);
    });
  });
};
