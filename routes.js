const indexPug = __dirname + "/dist/index.pug";
const bcrypt = require("bcryptjs");

module.exports = (app, modelSchool) => {
  app.get("/", (req, res) => {
    req.query.page && req.query.page != "homepage"
      ? res.render(indexPug, {
          currentPage: req.query.page
        })
      : (() => {
          modelSchool
            .find({ schoolName: /./ })
            .select("schoolName")
            .exec((err, doc) => {
              res.render(indexPug, {
                currentPage: "homepage",
                schools: JSON.stringify(doc.map(x => x.schoolName))
              });
            });
        })();
  });
  function dbSearchSchool(sch, done) {
    modelSchool.findOne({ schoolName: sch }, (err, doc) => {
      if (err) {
        done(err);
      } else {
        done(null, doc);
      }
    });
  }
  app.get("/:schparams", (req, res) => {
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
  });
  app.post("/schoolfromselect", (req, res) => {
    dbSearchSchool(req.body["school-name"], (err, doc) => {
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
  });
  app.post("/register-master", (req, res) => {
    modelSchool.findOne({ schoolName: req.body["school-name"] }, (err, doc) => {
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
        const documentSchool = new modelSchool({
          username: req.body.username,
          password: hash,
          schoolName: req.body["school-name"],
          ownerFirstName: req.body["first-name"],
          ownerLastName: req.body["last-name"],
          officials: [],
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
};
