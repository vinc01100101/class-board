const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const fs = require("file-system");

router.post("/", (req, res) => {
  const uuid = uuidv4();
  req.modelSchool
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
        if (isExisting) {
          console.log("Email already exists.");
          req.renderPage(res, {
            currentPage: "create-admin",
            errorDom: "Email already exists."
          });
        } else {
          const ticket = "ticket-" + uuidv4();
          doc.people.officials.push({
            id: "officials-" + uuid,
            img:
              "/img/users/" +
              req.user.schoolUrl +
              "/" +
              "officials-" +
              uuid +
              ".jpg",
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
          req.modelSchool.findOneAndUpdate(
            { schoolUrl: req.user.schoolUrl },
            doc,
            (err, done) => {
              if (err) {
                console.log("Error on findOneAndUpdate: " + err);
                res.send("Server Database Error");
              } else {
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

                fs.copyFile(
                  "./dist/img/default.jpg",
                  "./dist/img/users/" +
                    req.user.schoolUrl +
                    "/" +
                    "officials-" +
                    uuid +
                    ".jpg"
                );
                res.send(ticketString);
              }
            }
          );
        }
      }
    });
});

module.exports = router;
