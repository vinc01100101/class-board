const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const connEvents = require("./connection-listeners");
const ObjectID = require("mongodb").ObjectID;
const colors = require("colors");
const routes = require("./routes");

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
        schoolName: { type: String, required: true },
        officials: [],
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

      routes(app, modelSchool);

      const port = process.env.PORT;

      app.listen(port, () => {
        console.log(colors.cyan("listening to port: " + port));
      });
    }
  }
);
