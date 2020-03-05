const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const passport = require("passport");
const ObjectID = require("mongodb").ObjectID;

const connEvents = require("./connection-listeners");

const colors = require("colors");
const routes = require("./routes");
const auth = require("./auth");

connEvents(mongoose, colors);

const dburi = process.env.DB;

mongoose.connect(
  dburi,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, db) => {
    if (err) {
      console.log("DATABASE ERROR: " + err);
      res.status("500").send("Server Db Error.");
    } else {
      //-------------------------------

      const Schema = mongoose.Schema;

      var schemaSchool = new Schema({
        ownerFirstName: { type: String, required: true },
        ownerLastName: { type: String, required: true },
        username: { type: String, required: true },
        password: { type: String, required: true },
        schoolUrl: { type: String, required: true },
        people: {
          officials: [],
          students: []
        },
        courses: [],
        layout: {}
      });

      var modelSchool = mongoose.model("school", schemaSchool);

      //-------------------------------
      app.use((req, res, next) => {
        console.log(
          "METHOD: " +
            req.method +
            "\nPATH: " +
            req.path +
            "\nIP: " +
            (req.ip || req.connection.remoteAddress)
        );
        next();
      });
      app.set("view engine", "pug");
      app.use(express.static(__dirname + "/dist"));
      app.use(express.urlencoded({ extended: false }));

      auth(app, passport, modelSchool);
      routes(app, passport, modelSchool);

      const port = process.env.PORT;

      app.listen(port, () => {
        console.log(colors.cyan("listening to port: " + port));
      });
    }
  }
);
