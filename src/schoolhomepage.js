const React = require("react");
const Login = require("./login");

module.exports = class SchoolHomePage extends React.Component {
  constructor(props) {
    super(props);
    this._onSubmit = this._onSubmit.bind(this);
  }
  _onSubmit(e) {
    const schUrl = window.location.href.split("/");
    const sch = schUrl[schUrl.length - 1];
    const domUsr = document.getElementById("username");
    const domEmail = document.getElementById("email");
    domUsr.value = domEmail.value + "." + sch;
  }
  render() {
    const schoolPageLayout = JSON.parse(
      document.getElementById("schoolPageLayout").textContent
    );
    const errorDom = document.getElementById("errorDom").textContent;
    return (
      <div>
        <h1>YOUR SCHOOL HOME PAGE</h1>
        <h2>Welcome to {schoolPageLayout.schoolName}</h2>
        <p style={{ color: "red" }}>{errorDom}</p>
        <Login _onSubmit={this._onSubmit} />

        <a href="/">Back</a>
      </div>
    );
  }
};
