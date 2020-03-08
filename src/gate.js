const Register = require("./register");
const HomePage = require("./homepage");
const SchoolHomePage = require("./schoolhomepage");
const Profile = require("./profile");
const ControlPanel = require("./admin-control-panel");
const CreateAdminAccount = require("./cp/create-admin");
const ManageSchedules = require("./cp/manage-schedules");
const ManageStudentsPayment = require("./cp/manage-students-payment");
const WelcomeNewAdmin = require("./cp/welcome-new-admin");

const ReactDOM = require("react-dom");
const React = require("react");

const currPage = document.getElementById("currentPage");
const root = document.getElementById("root");

let ToRender;
switch (currPage.textContent) {
  case "register":
    ToRender = Register();
    break;
  case "homepage":
    ToRender = HomePage();
    break;
  case "schoolhomepage":
    ToRender = SchoolHomePage();
    break;
  case "profile":
    ToRender = Profile();
    break;
  //Control Panel Section --------------------
  case "control-panel":
    ToRender = ControlPanel();
    break;

  case "create-admin":
    ToRender = CreateAdminAccount();
    break;

  case "manage-schedules":
    ToRender = ManageSchedules();
    break;

  case "manage-students-payments":
    ToRender = ManageStudentsPayment();
    break;

  case "welcome-new-admin":
    ToRender = WelcomeNewAdmin();
    break;
  //------------------------------------------
  default:
    root.textContent = "No Page Were Set In This Query :(";
}
ToRender && ReactDOM.render(<ToRender />, root);
