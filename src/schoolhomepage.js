const React = require("react");
const Login = require("./login");

module.exports = class SchoolHomePage extends React.Component {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  }
  _onSubmit(e) {
    const schUrl = window.location.href.split("/");
    const sch = schUrl[schUrl.length - 1];
    const domUsr = document.getElementById("username");
    const domEmail = document.getElementById("email");
    domUsr.value = domEmail.value + "." + sch;
  }
  _onClick() {
    console.log("CLICKED");
  }
  render() {
    const schoolPageLayout = JSON.parse(
      document.getElementById("schoolPageLayout").textContent
    );

    return (
      <div>
        <h1>YOUR SCHOOL HOME PAGE</h1>
        <h2>Welcome to {schoolPageLayout.schoolName}</h2>
        <Login _onSubmit={this._onSubmit} _onClick={this._onClick} />
      </div>
    );
  }
};
