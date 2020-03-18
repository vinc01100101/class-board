const express = require("express");
const app = express();
const http = require("http").Server(app);

const io = require("socket.io")(http),
  emits = require("./server-emits");

require("dotenv").config();
const mongoose = require("mongoose");
const passport = require("passport");

const colors = require("colors");
const routes = require("./routes"),
  auth = require("./auth"),
  connEvents = require("./connection-listeners");

connEvents(mongoose, colors); //connection listeners

const dburi = process.env.DB;

mongoose.connect(
  dburi,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  },
  (err, db) => {
    if (err) {
      console.log("DATABASE ERROR: " + err);
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
          students: {}
        },
        coursesYearSection: [],
        curriculum: {},
        schedule: {},
        layout: {}
      });

      var modelSchool = mongoose.model("school", schemaSchool);

      //-------------------------------

      app.set("view engine", "pug");
      app.use(express.static(__dirname + "/dist"));
      app.use(express.urlencoded({ extended: false }));
      app.use(express.json());

      emits(io);
      auth(app, passport, modelSchool, io);
      routes(app, passport, modelSchool, db);

      const port = process.env.PORT;

      http.listen(port, () => {
        console.log(colors.cyan("listening to port: " + port));
      });
    }
  }
);
