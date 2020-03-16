const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const flash = require("connect-flash");

const hierarchy = {
  President: 5,
  "Vice President": 4,
  Dean: 3,
  Faculty: 2,
  Accountant: 2
};

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
  app.use((req, res, next) => {
    console.log(
      "_____________________" +
        "\nMETHOD: " +
        req.method +
        "\nPATH: " +
        req.path +
        "\nIP: " +
        (req.ip || req.connection.remoteAddress) +
        "\nBrowser: " +
        req.headers["user-agent"]
    );
    next();
  });

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
        permissions: req.user.permissions,
        schoolUrl: req.user.schoolUrl
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
              successDom:
                req.query.success &&
                bcrypt.compareSync("true", req.query.success) &&
                "Update Successful",
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
    try{
      db.collection("schools").drop((err, delOK) => {
      if (err) console.log(err);
      if (delOK) console.log("Collection Deleted.");

      res.redirect("/");
    });
    }catch(e){
      console.log("Collection deletion failed")
    }
   
  });

  //for School URL Params
  app.get("/:schparams", (req, res) => {
    if (req.isAuthenticated()) {
      console.log("PARAAAAAMS: " + req.params.schparams);
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
              res.send("Change Password Successful <br><a href='/'>Back</a>");
            }
          }
        );
      } else {
        res.send("Change Password Failed");
      }
    });
  });
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
        modelSchool.findOneAndUpdate(
          { schoolUrl: req.user.schoolUrl },
          doc,
          (err, result) => {
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
          }
        );
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
        res.redirect(
          "/?page=view-and-manage-admins&error=Hey bro don't edit the source code :D"
        );
      } else {
        doc.people.officials.splice(ind, 1);
        modelSchool.findOneAndUpdate(
          { schoolUrl: req.user.schoolUrl },
          doc,
          (err, result) => {
            if (err) {
              console.log("Delete error: " + err);
              res.send("Server Database Error");
            } else if (!result) {
              console.log("Delete Failed");
              res.send("Server Database Failed");
            } else {
              res.redirect(
                "/?page=view-and-manage-admins&success=Account Deletion Successful"
              );
            }
          }
        );
      }
    });
  });

  app.post("/schoolfromselect", (req, res) => {
    res.redirect(
      "/" + req.body["school-name"].toLowerCase().replace(/\s/g, "_")
    );
  });

  app.post("/register-master", (req, res) => {
    const schurl = req.body["school-name"].toLowerCase().replace(/\s/g, "_");
    modelSchool.findOne({ schoolUrl: schurl }, (err, doc) => {
      if (err) {
        console.log("Db 'findOne' Error: " + err);
        res.status("500").send("Server error 500");
      } else if (doc) {
        renderPage(res, {
          currentPage: "register",
          errorDom: `School name "${req.body["school-name"]}" already exist`
        });
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        const uuid = uuidv4();
        const schurl = req.body["school-name"]
          .toLowerCase()
          .replace(/\s/g, "_");

        //DATA STRUCTURE
        //CHANGES SHOULD BE IN ACCORDANCE WITH SCHEMA AT SERVER.JS
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
                  manageStudentsPayment: true,
                  manageAdminAccounts: true
                }
              }
            ],
            students: {
              BSCpE: {
                I: {
                  "Section-A": [
                    {
                      id: "",
                      firstName: "Vincent",
                      lastName: "Toledo",
                      username: "",
                      password: "",
                      schoolUrl: "",
                      schoolName: "",
                      subjects: []
                    },
                    {
                      id: "",
                      firstName: "Ally",
                      lastName: "Mae",
                      username: "",
                      password: "",
                      schoolUrl: "",
                      schoolName: "",
                      subjects: []
                    }
                  ],
                  "Section-B": [
                    {
                      id: "",
                      firstName: "Ben",
                      lastName: "Yow",
                      username: "",
                      password: "",
                      schoolUrl: "",
                      schoolName: "",
                      subjects: []
                    },
                    {
                      id: "",
                      firstName: "Danny",
                      lastName: "Dan",
                      username: "",
                      password: "",
                      schoolUrl: "",
                      schoolName: "",
                      subjects: []
                    }
                  ]
                }
              }
            }
          },
          //FOR MAPPING PURPOSE ONLY
          coursesYearSection: [
            [
              "BSCpE",
              ["Section-A", "Section-B", "Section-C"],
              ["Section-A", "Section-B", "Section-C"],
              ["Section-A", "Section-B", "Section-C", "Section-D"],
              ["Section-A", "Section-B", "Section-C"],
              ["Section-A", "Section-B", "Section-C"]
            ],
            [
              "BSEcE",
              ["Section-A", "Section-B", "Section-C", "Section-D"],
              ["Section-A", "Section-B", "Section-C"],
              ["Section-A", "Section-B", "Section-C", "Section-D"],
              ["Section-A", "Section-B", "Section-C"],
              ["Section-A", "Section-B", "Section-C", "Section-D"]
            ]
          ], //change everything to this. getter function
          curriculum: {
            Algebra: [2, ["BSCpE", "I"], ["BSEcE", "I"]],
            Geometry: [3, ["BSCpE", "I"], ["BSEcE", "I"]],
            Trigonometry: [1, ["BSCpE", "II"], ["BSEcE", "II"]]
          },
          schedule: {},
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
            renderPage(res, {
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
            renderPage(res, {
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
                manageStudentsPayment: !!req.body.payment,
                manageAdminAccounts: !!req.body["admin-accounts"]
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
                    "</h4><a href='/'>Back</a>";

                  res.send(ticketString);
                }
              }
            );
          }
        }
      });
  });
};
