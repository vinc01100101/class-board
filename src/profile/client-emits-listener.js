module.exports = (socket, setState) => {
  socket.on("log", data => {
    console.log(data);
  });

  socket.on("render posts", posts => {
    console.log(posts);
    setState(posts);
  });
  socket.on("error", error => {
    console.log("SOCKET ERROR: " + error);
  });
};
