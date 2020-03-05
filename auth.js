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

  passport.serializeUser((user, done) =>
    done(null, { id: user.id, school: user.schoolUrl })
  );

  passport.deserializeUser((obj, done) => {
    console.log("DESERIALIZING: " + JSON.stringify(obj));
    modelSchool
      .findOne(obj.school)
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
          if (!user) {
            console.log("No Cookie For Doc");
            done(null, false);
          } else {
            done(null, user);
          }
        }
      });
  });
  passport.use(
    new LocalStrategy((username, password, done) => {
      console.log("LOCAL STRAT");
      console.log(username);
      const sch = username.split(".");
      const usr = [...sch];
      usr.splice(sch.length - 1, sch.length);
      usr.join("");
      console.log("USER: " + usr);
      modelSchool
        .findOne({ schoolUrl: sch[sch.length - 1] })
        .select("people")
        .exec((err, doc) => {
          if (doc) {
            console.log(doc);
            const user =
              doc.people.officials.filter(x => x.username == usr) ||
              doc.people.students.filter(x => x.username == usr);

            if (user[0]) {
              if (bcrypt.compareSync(password, user[0].password)) {
                done(null, user);
              } else {
                console.log("Wrong password");
                done(null, false);
              }
            } else {
              console.log("Username does not exist");
              return done(null, false);
            }
          } else {
            console.log("No School Found As Linked To The Email");
          }
        });
    })
  );
};
