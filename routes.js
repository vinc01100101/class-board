const indexPug = __dirname + "/dist/index.pug";
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

module.exports = (app, passport, modelSchool) => {
  app.get("/f", (req, res, next) => {
    res.send("FAILED");
  });

  app.get("/s", (req, res, next) => {
    res.send("SUCCESS");
  });
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
    console.log(req.query.page);
    switch (req.query.page) {
      case "homepage":
      case undefined:
        if (req.isAuthenticated()) {
          res.redirect("/?page=profile");
        } else {
          console.log("Getting homepage");
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
            currentPage: "profile"
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
    }
  });

  app.post(
    "/login",
    passport.authenticate("local", {
      failureRedirect: "/f"
    }),
    (req, res) => {
      console.log("success");
      res.redirect("/?page=profile");
    }
  );

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
            schoolPageLayout: JSON.stringify(doc.layout)
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
    dbSearchSchool(req.body["school-name"], (err, doc) => {
      if (err) {
        console.log("Db 'findOne' Error: " + err);
        res.status("500").send("Server error 500");
      } else if (doc) {
        res.render(indexPug, {
          currentPage: "register",
          errorDom: "School Name already exist."
        });
      } else {
        const hash = bcrypt.hashSync(req.body.password, 12);
        const uuid = uuidv4().toString();
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
                schoolUrl: schurl
              }
            ],
            students: []
          },
          courses: [],
          layout: {
            schoolName: req.body["school-name"]
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

  app.get("/api/logout", (req, res, next) => {
    console.log("LOGGING OUT " + JSON.stringify(req.user));
    const sch = req.user.schoolUrl;
    req.logout();
    res.redirect(sch ? "/" + sch : "/");
  });
};
