module.exports = (modelSchool, io) => {
  let connectedSockets = [];

  io.on("connection", socket => {
    console.log(socket.request.user.firstName + " has connected");

    socket.on("connect to room", roomDetail => {
      socket.emit("log", "connecting to room");
      const course = roomDetail.course,
        yr = roomDetail.yr,
        section = roomDetail.section;
      modelSchool
        .findOne({ schoolUrl: socket.request.user.schoolUrl })
        .select("coursesYearSection posts")
        .exec((err, doc) => {
          if (err) {
            console.log("Find-Error: " + err);
            socket.emit("failed", "Database Error");
          } else if (!doc) {
            console.log("School not found");
            socket.emit("failed", "School not found");
          } else {
            const isValid =
              doc.coursesYearSection
                .filter(x => x[0] == course)[0]
                [yr].indexOf(section) != -1;
            if (isValid) {
              const room =
                socket.request.user.schoolUrl +
                "/" +
                course +
                "/" +
                yr +
                "/" +
                section;
              const rooms = Object.keys(socket.rooms);

              if (rooms.indexOf(room) < 0) {
                for (const props in socket.rooms) {
                  if (rooms.indexOf(props) > 0) {
                    io.in(props).emit(
                      "log",
                      socket.request.user.firstName +
                        " has left the room " +
                        props
                    );
                    socket.leave(props);
                  }
                }
                socket.join(room);
                io.in(room).emit(
                  "log",
                  socket.request.user.firstName +
                    " has entered the room " +
                    room
                );
                console.log(socket.id);
                socket.emit("render posts", doc.posts[room] || [""]);
              }
            } else {
              console.log("Room not found");
              socket.emit("failed", "Room not found");
            }
          }
        });
    });

    socket.on("post", post => {
      const room = Object.keys(socket.rooms)[1];
      modelSchool
        .findOne({ schoolUrl: socket.request.user.schoolUrl })
        .select("posts")
        .exec((err, doc) => {
          doc.posts[room]
            ? doc.posts[room].push(post)
            : (doc.posts[room] = [post]);
          doc.markModified("posts." + room);
          doc.save((err, result) => {
            if (err) {
              console.log("Error: " + err);
              socket.emit("log", err);
            } else {
              io.in(room).emit("render posts", result.posts[room]);
            }
          });
        });
    });

    socket.on("disconnect", () => {
      console.log("User " + socket.request.user.firstName + " disconnected");
    });
  });
};
