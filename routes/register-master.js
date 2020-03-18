const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

router.post("/", (req, res) => {
  const schurl = req.body["school-name"].toLowerCase().replace(/\s/g, "_");
  req.modelSchool.findOne({ schoolUrl: schurl }, (err, doc) => {
    if (err) {
      console.log("Db 'findOne' Error: " + err);
      res.status("500").send("Server error 500");
    } else if (doc) {
      req.renderPage(res, {
        currentPage: "register",
        errorDom: `School name "${req.body["school-name"]}" already exist`
      });
    } else {
      const hash = bcrypt.hashSync(req.body.password, 12);
      const uuid = uuidv4();
      const schurl = req.body["school-name"].toLowerCase().replace(/\s/g, "_");

      //DATA STRUCTURE
      //CHANGES SHOULD BE IN ACCORDANCE WITH SCHEMA AT SERVER.JS
      const documentSchool = new req.modelSchool({
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
          req.renderPage(res, {
            currentPage: "register",
            successDom: "Success!"
          });
        }
      });
    }
  });
});

module.exports = router;
