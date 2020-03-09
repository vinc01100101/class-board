const indexPug = __dirname + "/dist/index.pug";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const flash = require("connect-flash");

module.exports = (app, passport, modelSchool, db) => {
  app.use(flash());

  function dbSearchSchool(sch, done) {
    modelSchool.findOne({ schoolUrl: sch }, (err, doc) => {
      if (err) {
        done(err);
      } else {
        done(null, doc);
      }
    });
  }

  //for Query Url
  app.get("/", (req, res) => {
    console.log("QUERY URL: " + req.query.page);
    const isOfficial = req.user && req.user.id.split("-")[0] == "officials";
    const member = req.user && req.user.id.split("-")[0];
    const uPToSend =
      req.user &&
      JSON.stringify({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        member: member,
        position: req.user.position,
        schoolName: req.user.schoolName,
        permissions: req.user.permissions
      });
    console.log(member);
    switch (req.query.page) {
      case "homepage":
      case undefined:
        if (req.isAuthenticated()) {
          res.redirect("/?page=profile");
        } else {
          modelSchool
            .find({ schoolUrl: /./ })
            .select("layout")
            .exec((err, doc) => {
              res.render(indexPug, {
                currentPage: "homepage",
                schools: JSON.stringify(doc.map(x => x.layout.schoolName))
              });
            });
        }

        break;

      case "profile":
        if (req.isAuthenticated()) {
          res.render(indexPug, {
            currentPage: "profile",
            userProfile: uPToSend
          });
        } else {
          res.redirect("/");
        }
        break;

      case "register":
        if (req.isAuthenticated()) {
          res.redirect("/?page=profile");
        } else {
          res.render(indexPug, {
            currentPage: "register"
          });
        }
        break;

      case "control-panel":
        if (req.isAuthenticated()) {
          if (isOfficial) {
            res.render(indexPug, {
              currentPage: "control-panel",
              userProfile: uPToSend
            });
          } else {
            res.send("Students cannot access this page :D");
          }
        } else {
          res.send("You must log in first as an administrator");
        }
        break;

      case "create-admin":
        if (req.isAuthenticated()) {
          if (req.user.position == ("President" || "Vice-President")) {
            res.render(indexPug, {
              currentPage: "create-admin",
              userProfile: uPToSend
            });
          } else {
            res.send("No permission to access this page");
          }
        } else {
          res.send("You must log in first as an administrator");
        }
        break;

      case "manage-schedules":
        if (req.isAuthenticated()) {
          if (req.user.permissions.manageSchedule) {
            res.render(indexPug, {
              currentPage: "manage-schedules",
              userProfile: uPToSend
            });
          } else {
            res.send("No permission to access this page");
          }
        } else {
          res.send("You must log in first as an administrator");
        }
        break;

      case "manage-students-payment":
        if (req.isAuthenticated()) {
          if (req.user.permissions.manageStudentsPayment) {
            res.render(indexPug, {
              currentPage: "manage-students-payment",
              userProfile: uPToSend
            });
          } else {
            res.send("No permission to access this page");
          }
        } else {
          res.send("You must log in first as an administrator");
        }
        break;

      case "welcome-new-admin":
        modelSchool.findOne(
          { schoolUrl: req.query["school-url"] },
          (err, doc) => {
            if (err) {
              console.log("Database error upon accessing welcome-new-admin");
              res.send("Database Error");
            } else if (!doc) {
              console.log("School url does not exist");
              res.send("No Permission to access this page: err-sch-!exst");
            } else {
              let ind = -1;
              const usr = doc.people.officials.filter(x => {
                return (
                  x.username == req.query.user &&
                  x.password == req.query.chocolate &&
                  x.id == req.query.vanilla
                );
              })[0];

              if (!usr) {
                res.send("No Permission to access this page: err-usr-!exst");
              } else {
                res.render(indexPug, {
                  currentPage: "welcome-new-admin",
                  userProfile: JSON.stringify({
                    username: req.query.user,
                    id: req.query.vanilla,
                    schoolUrl: req.query["school-url"],
                    chocolate: req.query.chocolate
                  })
                });
              }
            }
          }
        );

        break;

      default:
        res.send("Page Not Found.");
    }
  });

  app.post(
    "/login",
    (req, res, next) => {
      const sch = req.body.username.split(".");
      passport.authenticate("local", {
        failureRedirect: "/" + sch[sch.length - 1],
        failureFlash: true
      })(req, res, next);
    },
    (req, res) => {
      res.redirect("/?page=profile");
    }
  );
  app.post("/ticket", (req, res) => {
    let input = req.body["school-ticket"].split(".");
    const sch = input.splice(-1)[0];
    const ticket = input.join(".");
    modelSchool.findOne({ schoolUrl: sch }, (err, doc) => {
      if (err) {
        console.log("Database Error");
        res.send("Server Database Error");
      } else if (!doc) {
        console.log("Unexpected error: School url not found in the database");
        res.send("Unexpected error: School not found");
      } else {
        const usr = doc.people.officials.filter(x => x.password == ticket)[0];

        if (!usr) {
          res.render(indexPug, {
            currentPage: "schoolhomepage",
            schoolPageLayout: JSON.stringify(doc.layout),
            errorDom: "Invalid Ticket"
          });
        } else {
          res.redirect(
            "/?page=welcome-new-admin&user=" +
              usr.username +
              "&school-url=" +
              usr.schoolUrl +
              "&chocolate=" +
              ticket +
              "&vanilla=" +
              usr.id
          );
        }
      }
    });
  });
  app.post("/update-password", (req, res) => {
    const member = req.body.id.split("-")[0];
    const isATicket = req.body["o-password"].split("-")[0] == "ticket";
    const schurl = req.body["school-url"];
    modelSchool.findOne({ schoolUrl: schurl }, (err, doc) => {
      if (err) {
        console.log("route /update-password: find-error");
        res.send("Server Database Error");
      } else if (!doc) {
        console.log("route /update-password: School not found");
        res.send("Unexpected error: err-sch-!exst");
      } else {
        let ind = -1;
        doc.people[member].filter((x, i) => {
          if (x.id == req.body.id && x.username == req.body.username) {
            if (isATicket) {
              if (x.password == req.body["o-password"]) {
                ind = i;
                return true;
              }
            } else {
              if (bcrypt.compareSync(req.body["o-password"], x.password)) {
                ind = i;
                return true;
              }
            }
          }
          return false;
        })[0];

        if (ind >= 0) {
          doc.people[member][ind].password = bcrypt.hashSync(
            req.body["n-password"],
            12
          );
          modelSchool.findOneAndUpdate(
            { schoolUrl: schurl },
            doc,
            (err, result) => {
              if (err) {
                console.log("findOneAndUpdate error");
                res.send("Server Database Error");
              } else if (!result) {
                res.send("Failed To Change Password");
              } else {
                res.send("Change Password Successful");
              }
            }
          );
        } else {
          res.send("Change Password Failed");
        }
      }
    });
  });
  //for School URL Params
  app.get("/:schparams", (req, res) => {
    if (req.isAuthenticated()) {
      res.render(indexPug, {
        currentPage: "profile"
      });
    } else {
      dbSearchSchool(req.params.schparams, (err, doc) => {
        if (err) {
          console.log("Search error.");
          res.status("500").send("Database Error: " + err);
        } else if (!doc) {
          res.send("School not registered.");
        } else {
          res.render(indexPug, {
            currentPage: "schoolhomepage",
            schoolPageLayout: JSON.stringify(doc.layout),
            errorDom: req.flash("error")
          });
        }
      });
    }
  });

  app.post("/schoolfromselect", (req, res) => {
    res.redirect(
      "/" + req.body["school-name"].toLowerCase().replace(/\s/g, "_")
    );
  });

  app.post("/register-master", (req, res) => {
    const schurl = req.body["school-name"].toLowerCase().replace(/\s/g, "_");
    dbSearchSchool(schurl, (err, doc) => {
      if (err) {
        console.log("Db 'findOne' Error: " + err);
        res.status("500").send("Server error 500");
      } else if (doc) {
        res.render(indexPug, {
          currentPage: "register",
          errorDom: `School name "${req.body["school-name"]}" already exist`
        });
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        const uuid = uuidv4();
        const schurl = req.body["school-name"]
          .toLowerCase()
          .replace(/\s/g, "_");
        const documentSchool = new modelSchool({
          username: req.body.username,
          password: hash,
          schoolUrl: schurl,
          ownerFirstName: req.body["first-name"],
          ownerLastName: req.body["last-name"],
          people: {
            officials: [
              {
                id: "officials-" + uuid,
                firstName: req.body["first-name"],
                lastName: req.body["last-name"],
                position: "President",
                username: req.body.username,
                password: hash,
                schoolUrl: schurl,
                schoolName: req.body["school-name"],
                permissions: {
                  manageSchedule: true,
                  manageStudentsPayment: true
                }
              }
            ],
            students: []
          },
          courses: [],
          layout: {
            schoolName: req.body["school-name"],
            schoolUrl: schurl
          }
        });
        documentSchool.save((err, doc) => {
          if (err) {
            console.log("Registration Error: " + err);
            res.status("500").send("Database Error");
          } else {
            console.log("Registration Successful.");
            res.render(indexPug, {
              currentPage: "register",
              successDom: "Success!"
            });
          }
        });
      }
    });
  });

  app.post("/register-admin", (req, res) => {
    const uuid = uuidv4();
    modelSchool
      .findOne({ schoolUrl: req.user.schoolUrl })
      .select("people")
      .exec((err, doc) => {
        if (err) {
          console.log("Database Error: " + err);
          res.send("DATABASE ERROR");
        } else if (!doc) {
          console.log("Unexpected error: School name doesn't exist");
          res.send("Server error");
        } else {
          const isExisting = doc.people.officials.filter(
            x => x.username == req.body.username
          )[0];
          console.log("IS EXISTING?: " + isExisting);
          if (isExisting) {
            console.log("Email already exists.");
            res.render(indexPug, {
              currentPage: "create-admin",
              errorDom: "Email already exists."
            });
          } else {
            const ticket = "ticket-" + uuidv4();
            doc.people.officials.push({
              id: "officials-" + uuid,
              firstName: req.body["first-name"],
              lastName: req.body["last-name"],
              position: req.body.position,
              username: req.body.username,
              password: ticket,
              schoolUrl: req.user.schoolUrl,
              schoolName: req.user.schoolName,
              permissions: {
                manageSchedule: !!req.body.sched,
                manageStudentsPayment: !!req.body.payment
              }
            });
            modelSchool.findOneAndUpdate(
              { schoolUrl: req.user.schoolUrl },
              doc,
              (err, done) => {
                if (err) {
                  console.log("Error on findOneAndUpdate: " + err);
                  res.send("Server Database Error");
                } else {
                  console.log(done);
                  const ticketString =
                    "<h4>Ticket code for " +
                    req.body["first-name"] +
                    " " +
                    req.body["last-name"] +
                    " has been generated" +
                    "<br>Please keep this somewhere safe." +
                    "<br>This can only be used once.<br><br>" +
                    req.body.username +
                    "|" +
                    req.body.position +
                    "<br>" +
                    ticket +
                    "</h4>";

                  res.send(ticketString);
                }
              }
            );
          }
        }
      });
  });
  app.get("/api/logout", (req, res, next) => {
    console.log("LOGGING OUT " + JSON.stringify(req.user));
    const sch = req.user ? req.user.schoolUrl : null;
    req.logout();
    res.redirect(sch ? "/" + sch : "/");
  });

  app.get("/api/drop-collection", (req, res) => {
    db.collectionNames("schools", (err, name) => {
      console.log(names);
    });
    db.collection("schools").drop((err, delOK) => {
      if (err) console.log(err);
      if (delOK) console.log("Collection Deleted.");

      res.redirect("/");
    });
  });
};
