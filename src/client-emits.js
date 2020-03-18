module.exports = socket => {
  socket.on("welcome", data => {
    console.log(data);
  });
};
