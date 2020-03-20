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
<<<<<<< HEAD
=======
    document.getElementById('room-content-hide-at-first').style.display='block';
>>>>>>> bcdf86b1670ddbc2ce09c3bb6f03cec925600dc8
  });
  socket.on("error", error => {
    console.log("SOCKET ERROR: " + error);
  });
};
