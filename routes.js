const bcrypt = require("bcryptjs");
// const { v4: uuidv4 } = require("uuid");
const flash = require("connect-flash");
const fs = require("file-system");

const ROUTER_logger = require("./routes/logger"),
  ROUTER_registerMaster = require("./routes/register-master"),
  ROUTER_registerAdmin = require("./routes/register-admin");

const hierarchy = {
  President: 5,
  "Vice President": 4,
  Dean: 3,
  Faculty: 2,
  Accountant: 2
};
Object.freeze(hierarchy);

const renderPage = (res, props) => {
  res.render(__dirname + "/dist/index.pug", props);
};

const getListOfAdmins = officials => {
  return officials.map(x => {
    return {
      id: x.id,
      name: x.firstName + " " + x.lastName,
      position: x.position,
      email: x.username,
      permissions: x.permissions,
      pending: x.password.split("-")[0] == "ticket"
    };
  });
};
module.exports = (app, passport, modelSchool, db) => {
  app.use(flash());

  function dbSearchSchool(res, sch, done) {
    modelSchool.findOne({ schoolUrl: sch }, (err, doc) => {
      if (err) {
        console.log("Database Search Error: " + err);
        res.send("Database Search Error: " + err);
      } else if (!doc) {
        console.log("School not found");
        res.send("School not found");
      } else {
        done(doc);
      }
    });
  }

  app.use((req, res, next) => {
    /UCBrowser/.test(req.headers["user-agent"])
      ? res.send(
          "Sorry, UC Browser is not supported with this project. Please use another browser."
        )
      : next();
  });

  app.use("/", ROUTER_logger);
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
        img: req.user.img,
        member: member,
        position: req.user.position,
        schoolName: req.user.schoolName,
        permissions: req.user.permissions,
        schoolUrl: req.user.schoolUrl
      });
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
              renderPage(res, {
                currentPage: "homepage",
                schools: JSON.stringify(doc.map(x => x.layout.schoolName))
              });
            });
        }

        break;

      case "profile":
        if (req.isAuthenticated()) {
          dbSearchSchool(res, req.user.schoolUrl, doc => {
            renderPage(res, {
              currentPage: "profile",
              userProfile: uPToSend,
              courseList: JSON.stringify(doc.coursesYearSection)
            });
          });
        } else {
          res.redirect("/");
        }
        break;

      case "register":
        if (req.isAuthenticated()) {
          res.redirect("/?page=profile");
        } else {
          renderPage(res, {
            currentPage: "register"
          });
        }
        break;

      case "control-panel":
        if (req.isAuthenticated()) {
          if (isOfficial) {
            renderPage(res, {
              currentPage: "control-panel",
              userProfile: uPToSend
            });
          } else {
            res.redirect("/");
          }
        } else {
          res.redirect("/");
        }
        break;

      case "create-admin":
        if (req.isAuthenticated()) {
          if (req.user.position == ("President" || "Vice-President")) {
            renderPage(res, {
              currentPage: "create-admin",
              userProfile: uPToSend
            });
          } else {
            res.redirect("/");
          }
        } else {
          res.redirect("/");
        }
        break;

      case "manage-schedules":
        if (req.isAuthenticated()) {
          if (req.user.permissions.manageSchedule) {
            renderPage(res, {
              currentPage: "manage-schedules",
              userProfile: uPToSend
            });
          } else {
            res.redirect("/");
          }
        } else {
          res.redirect("/");
        }
        break;

      case "manage-students-payment":
        if (req.isAuthenticated()) {
          if (req.user.permissions.manageStudentsPayment) {
            renderPage(res, {
              currentPage: "manage-students-payment",
              userProfile: uPToSend
            });
          } else {
            res.redirect("/");
          }
        } else {
          res.redirect("/");
        }
        break;

      case "welcome-new-admin":
        dbSearchSchool(res, req.query["school-url"], doc => {
          const usr = doc.people.officials.filter(x => {
            return (
              x.username == req.query.user &&
              x.password == req.query.chocolate &&
              x.id == req.query.vanilla
            );
          })[0];

          if (!usr) {
            res.redirect("/");
          } else {
            renderPage(res, {
              currentPage: "welcome-new-admin",
              userProfile: JSON.stringify({
                username: req.query.user,
                id: req.query.vanilla,
                schoolUrl: req.query["school-url"],
                chocolate: req.query.chocolate
              })
            });
          }
        });
        break;

      case "view-and-manage-admins":
        if (req.isAuthenticated()) {
          dbSearchSchool(res, req.user.schoolUrl, doc => {
            renderPage(res, {
              currentPage: "view-and-manage-admins",
              listOfAdmins: JSON.stringify(
                getListOfAdmins(doc.people.officials)
              ),
              userProfile: uPToSend,
              successDom: (() => {
                if (req.query.success) {
                  if (bcrypt.compareSync("true", req.query.success))
                    return "Update Successful";
                  if (bcrypt.compareSync("delete", req.query.success))
                    return "Account Deletion Successful";
                }
              })(),
              errorDom:
                req.query.error &&
                bcrypt.compareSync("true", req.query.error) &&
                "Hey bro don't edit the source code :D"
            });
          });
        } else {
          res.redirect("/");
        }
        break;

      default:
        res.send("Page Not Found.");
    }
  });

  app.get("/logout", (req, res, next) => {
    console.log("LOGGING OUT " + JSON.stringify(req.user));
    const sch = req.user ? req.user.schoolUrl : null;
    req.logout();
    console.log("ISAUTH???????: " + req.isAuthenticated());
    res.redirect(sch ? "/" + sch : "/");
  });

  app.get("/api/drop-collection", (req, res) => {
    db.collection("schools").drop((err, delOK) => {
      if (err) {
        console.log("Deletion failed: " + err);
        return res.status(500).send("No collection to delete");
      }
      if (delOK) console.log("Collection Deleted.");
      const dir = "./dist/img/users";
      try {
        fs.rmdirSync(dir);
      } catch (e) {
        console.log("Failed to remove directory " + dir);
      }

      res.redirect("/");
    });
  });

  //for School URL Params
  app.get("/:schparams", (req, res) => {
    if (req.isAuthenticated()) {
      res.redirect("/?page=profile");
    } else {
      req.params.schparams != "favicon.ico" &&
        dbSearchSchool(res, req.params.schparams, doc => {
          renderPage(res, {
            currentPage: "schoolhomepage",
            schoolPageLayout: JSON.stringify(doc.layout),
            errorDom: req.flash("error")
          });
        });
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
    dbSearchSchool(res, sch, doc => {
      const usr = doc.people.officials.filter(x => x.password == ticket)[0];
      if (!usr) {
        renderPage(res, {
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
    });
  });
  app.post("/update-password", (req, res) => {
    const member = req.body.id.split("-")[0];
    const isATicket = req.body["o-password"].split("-")[0] == "ticket";
    const schurl = req.body["school-url"];
    dbSearchSchool(res, schurl, doc => {
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
      });

      if (ind >= 0) {
        doc.people[member][ind].password = bcrypt.hashSync(
          req.body["n-password"],
          12
        );
        doc.markModified("people." + member);
        doc.save((err, result) => {
          if (err) {
            console.log("Database error");
            res.send("Server Database Error");
          } else if (!result) {
            res.send("Failed To Change Password");
          } else {
            res.send("Change Password Successful <br><a href='/'>Back</a>");
          }
        });
      } else {
        res.send("Change Password Failed");
      }
    });
  });

  //Update Account (ADMIN ACCOUNTS ONLY)
  app.post("/update-account", (req, res) => {
    dbSearchSchool(res, req.user.schoolUrl, doc => {
      let ind = -1;
      const toUpdate = doc.people.officials.filter((x, i) => {
        if (
          x.firstName + " " + x.lastName == req.body["nameofaccount-to-edit"] &&
          x.id == req.body["idofaccount-to-edit"]
        ) {
          ind = i;
          return true;
        }
        return false;
      })[0];

      if (!toUpdate) {
        console.log("Account to edit was not found");
        res.send("Account to edit was not found");
      } else if (
        //Server verification | Data protection
        !req.user.permissions.manageAdminAccounts ||
        hierarchy[req.user.position] <= hierarchy[toUpdate.position] ||
        hierarchy[req.user.position] <= hierarchy[req.body.position]
      ) {
        console.log("No permission to edit account");
        const hash = bcrypt.hashSync("true", 1);
        res.redirect("/?page=view-and-manage-admins&error=" + hash);
      } else {
        toUpdate.permissions.manageSchedule = !!req.body.sched;
        toUpdate.permissions.manageStudentsPayment = !!req.body.payment;
        toUpdate.permissions.manageAdminAccounts = !!req.body["admin-accounts"];
        toUpdate.position = req.body.position;
        doc.people.officials[ind] = toUpdate;
        doc.markModified("people.officials");
        doc.save((err, result) => {
          if (err) {
            console.log("Update error: " + err);
            res.send("Server Update Error");
          } else if (!result) {
            console.log("Update Failed");
            res.send("Server Update Failed");
          } else {
            const hash = bcrypt.hashSync("true", 1);
            res.redirect("/?page=view-and-manage-admins&success=" + hash);
          }
        });
      }
    });
  });
  app.post("/delete-account", (req, res) => {
    dbSearchSchool(res, req.user.schoolUrl, doc => {
      let ind = -1;
      const toUpdate = doc.people.officials.filter((x, i) => {
        if (
          x.firstName + " " + x.lastName ==
            req.body["nameofaccount-to-delete"] &&
          x.id == req.body["idofaccount-to-delete"]
        ) {
          ind = i;
          return true;
        }
        return false;
      })[0];

      if (!toUpdate) {
        console.log("Account to delete was not found");
        res.send("Account to delete was not found");
      } else if (
        //Server verification | Data protection
        !req.user.permissions.manageAdminAccounts ||
        hierarchy[req.user.position] <= hierarchy[toUpdate.position]
      ) {
        console.log("No permission to edit account");
        const hash = bcrypt.hashSync("true", 1);
        res.redirect("/?page=view-and-manage-admins&error=" + hash);
      } else {
        doc.people.officials.splice(ind, 1);
        doc.markModified("people.officials");
        doc.save((err, result) => {
          if (err) {
            console.log("Delete error: " + err);
            res.send("Server Database Error");
          } else if (!result) {
            console.log("Delete Failed");
            res.send("Server Database Failed");
          } else {
            const dir =
              "./dist/img/users/" +
              req.user.schoolUrl +
              "/" +
              req.body["idofaccount-to-delete"] +
              ".jpg";

            try {
              fs.unlinkSync(dir);
            } catch (e) {
              console.log("Failed to delete file: " + dir);
            }

            const hash = bcrypt.hashSync("delete", 1);
            res.redirect("/?page=view-and-manage-admins&success=" + hash);
          }
        });
      }
    });
  });

  app.post("/schoolfromselect", (req, res) => {
    res.redirect(
      "/" + req.body["school-name"].toLowerCase().replace(/\s/g, "_")
    );
  });

  app.use(
    "/register-master",
    (req, res, next) => {
      req.modelSchool = modelSchool;
      req.renderPage = renderPage;
      next();
    },
    ROUTER_registerMaster
  );

  app.use(
    "/register-admin",
    (req, res, next) => {
      req.modelSchool = modelSchool;
      req.renderPage = renderPage;
      next();
    },
    ROUTER_registerAdmin
  );

  // Uploading DP

  app.post("/api/change-dp", function(req, res) {
    console.log(req.files);
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let newDp = req.files.newDp;

    const dir = "./dist/img/users/" + req.user.schoolUrl;

    fs.mkdirSync(dir);

    // Use the mv() method to place the file somewhere on your server
    newDp.mv(
      "./dist/img/users/" + req.user.schoolUrl + "/" + req.user.id + ".jpg",
      function(err) {
        if (err) return res.status(500).send(err);
        console.log("File uploaded, updating database...");
        dbSearchSchool(res, req.user.schoolUrl, doc => {
          const member = req.user && req.user.id.split("-")[0];
          let ind = -1;
          const toUpdate = doc.people[member].filter((x, i) => {
            if (x.id == req.user.id) {
              ind = i;
              return true;
            }
            return false;
          })[0];

          if (!toUpdate) {
            return res.status(400).send("User is not valid.");
          } else {
            toUpdate.img =
              "/img/users/" + req.user.schoolUrl + "/" + req.user.id + ".jpg";

            doc.people[member][ind] = toUpdate;
            doc.markModified("people." + member);
            doc.save((err, result) => {
              if (err)
                return res
                  .status(500)
                  .send("File saved but wasnt able to update DB");

              res.redirect("/?page=profile");
            });
          }
        });
      }
    );
  });
};
