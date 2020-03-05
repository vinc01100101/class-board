const Register = require("./register");
const HomePage = require("./homepage");
const SchoolHomePage = require("./schoolhomepage");
const ReactDOM = require("react-dom");
const React = require("react");

const currPage = document.getElementById("currentPage");
const root = document.getElementById("root");

let ToRender;
switch (currPage.textContent) {
  case "register":
    ToRender = Register;
    break;
  case "homepage":
    ToRender = HomePage;
    break;
  case "schoolhomepage":
    ToRender = SchoolHomePage;
    break;
  default:
    root.textContent = "No Page Were Set In This Query :(";
}
ToRender && ReactDOM.render(<ToRender />, root);
