const passport = require("passport");
const session = require("express-session");

module.exports = (app, modelSchool) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false
    })
  );
  app.use(passport.session);
  app.use(passport.initialize);

  passport.serializeUser();
};
