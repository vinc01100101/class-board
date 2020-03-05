const React = require("react");

module.exports = class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const errorDom = document.getElementById("errorDom").textContent;
    return (
      <div>
        <h1>HEY PROFILE</h1>
        <p style={{ color: "red" }}>{errorDom}</p>
        <a href="/api/logout">Logout</a>
      </div>
    );
  }
};
