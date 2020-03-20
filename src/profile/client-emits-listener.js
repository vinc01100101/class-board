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
    document.getElementById("room-content-hide-at-first").style.display =
      "block";
  });
  socket.on("error", error => {
    console.log("SOCKET ERROR: " + error);
  });
};
