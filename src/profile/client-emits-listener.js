module.exports = (socket, setState) => {
  socket.on("log", data => {
    console.log(data);
  });

  socket.on("render posts", posts => {
    setState(posts);
    const actualPostsContainer = document.getElementById(
      "actual-posts-container"
    );
    actualPostsContainer.scrollTop = actualPostsContainer.scrollHeight;
  });
  socket.on("error", error => {
    console.log("SOCKET ERROR: " + error);
  });
};
