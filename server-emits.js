module.exports = (modelSchool, io) => {
  let connectedSockets = [];

  const getPostStructure = (doc, room) => {
    //get id of everyone who posted, removes duplicate id
    const idList = doc.posts[room].reduce((x, y) => {
      x[0] && x.indexOf(y.id) == -1 && x.push(y.id);
      !x[0] && x.push(y.id);
      return x;
    }, []);
    //store here the data found from doc.people
    let postIdReference = {};
    //map on each id on idList, search on doc.people each id, found data will then be stored to postIdReference
    idList.map(x => {
      const member = x.split("-")[0];
      const docPath = doc.people[member];
      const docLength = docPath.length;
      for (let i = 0; i < docLength; i++) {
        if (docPath[i].id == x) {
          return (postIdReference[x] = {
            name: docPath[i].firstName + " " + docPath[i].lastName,
            position: docPath[i].position,
            email: docPath[i].username
          });
        }
        //warning: this will trigger when no such id found on database
        if (i == docLength - 1) {
          console.log("server-emits.js: Reached last, last id not found");
          return (postIdReference[x] = {
            name: "Deleted Account",
            position: " ",
            email: " "
          });
        }
      }
    });

    return {
      posts: doc.posts[room],
      reference: postIdReference
    };
  };
  io.on("connection", socket => {
    console.log(socket.request.user.firstName + " has connected");

    socket.on("connect to room", roomDetail => {
      socket.emit("log", "connecting to room");
      const course = roomDetail.course,
        yr = roomDetail.yr,
        section = roomDetail.section;
      modelSchool
        .findOne({ schoolUrl: socket.request.user.schoolUrl })
        .select("coursesYearSection posts people")
        .exec((err, doc) => {
          if (err) {
            console.log("Find-Error: " + err);
            socket.emit("failed", "Database Error");
          } else if (!doc) {
            console.log("School not found");
            socket.emit("failed", "School not found");
          } else {
            //check if room section is valid from database coursesYearSection
            //with this awesome code lol
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

              //if not yet entered this room
              if (rooms.indexOf(room) == -1) {
                //if has current rooms, leave
                if (rooms.length > 0) {
                  for (let i = 1; i < rooms.length; i++) {
                    io.in(rooms[i]).emit(
                      "log",
                      socket.request.user.firstName +
                        " has left the room " +
                        rooms[i]
                    );
                    socket.leave(rooms[i]);
                  }
                }

                //join this room
                socket.join(room);
                io.in(room).emit(
                  "log",
                  socket.request.user.firstName +
                    " has entered the room " +
                    room
                );
                const postStructure = doc.posts[room]
                  ? getPostStructure(doc, room)
                  : "";
                socket.emit("render posts", postStructure);
              }
            } else {
              console.log("Room not found");
              socket.emit("failed", "Room not found");
            }
          }
        });
    });
    //On User post to room
    socket.on("post", post => {
      const room = Object.keys(socket.rooms)[1];
      //locate the posts property in db
      modelSchool
        .findOne({ schoolUrl: socket.request.user.schoolUrl })
        .select("posts people")
        .exec((err, doc) => {
          if (err) socket.emit("log", err);
          const user = socket.request.user;
          const postInfo = {
            id: user.id,
            // name: user.firstName + " " + user.lastName,
            post: post,
            date: new Date().getTime()
          };
          //if posts.room exists, (push). if not, (create)
          doc.posts[room]
            ? doc.posts[room].push(postInfo)
            : (doc.posts[room] = [postInfo]);
          /*mongoose doesnt have track to this room,
            tell it that this is modified*/
          doc.markModified("posts." + room);
          //save the new modified doc
          doc.save((err, result) => {
            if (err) {
              console.log("Error: " + err);
              socket.emit("log", err);
            } else {
              const postStructure = getPostStructure(result, room);
              //re-render posts window to everyone in that room
              io.in(room).emit("render posts", postStructure);
            }
          });
        });
    });

    socket.on("disconnect", () => {
      console.log("User " + socket.request.user.firstName + " disconnected");
    });
  });
};
