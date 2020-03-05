const React = require("react");
const Login = require("./login");

module.exports = class SchoolHomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const schoolPageLayout = JSON.parse(
      document.getElementById("schoolPageLayout").textContent
    );

    return (
      <div>
        <h1>YOUR SCHOOL HOME PAGE</h1>
        <h2>Welcome to {schoolPageLayout.schoolName}</h2>
        <Login />
      </div>
    );
  }
};
