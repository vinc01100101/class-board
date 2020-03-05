const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");

module.exports = (app, passport, modelSchool) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    console.log("SERIALIZING: " + JSON.stringify(user));
    done(null, { id: user.id, school: user.schoolUrl });
  });

  passport.deserializeUser((obj, done) => {
    console.log("DESERIALIZING: " + JSON.stringify(obj) + "__");
    modelSchool
      .findOne({ schoolUrl: obj.school })
      .select("people")
      .exec((err, doc) => {
        if (err) {
          console.log("Database Error");
          done(err);
        } else if (!doc) {
          console.log("No Cookie For School");
          done(null, false);
        } else {
          const user =
            doc.people.officials.filter(x => x.id == obj.id) ||
            doc.people.students.filter(x => x.id == obj.id);
          if (!user[0]) {
            console.log("No Cookie For Doc");
            done(null, false);
          } else {
            done(null, user[0]);
          }
        }
      });
  });
  passport.use(
    new LocalStrategy((username, password, done) => {
      console.log("LOCAL STRATEGY");
      const sch = username.split(".");
      const usr = [...sch];
      usr.splice(sch.length - 1, sch.length);
      usr.join("");
      modelSchool
        .findOne({ schoolUrl: sch[sch.length - 1] })
        .select("people")
        .exec((err, doc) => {
          if (doc) {
            const user =
              doc.people.officials.filter(x => x.username == usr) ||
              doc.people.students.filter(x => x.username == usr);

            if (user[0]) {
              if (bcrypt.compareSync(password, user[0].password)) {
                done(null, user[0]);
              } else {
                console.log("Wrong password");
                done(null, false, { message: "Wrong password" });
              }
            } else {
              console.log("Username does not exist");
              return done(null, false, { message: "Username does not exist" });
            }
          } else {
            console.log("No School Found As Linked To The Email");
          }
        });
    })
  );
};
