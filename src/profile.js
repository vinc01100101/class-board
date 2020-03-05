const React = require("react");

module.exports = class Profile extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h1>HEY PROFILE</h1>

        <a href="/api/logout">Logout</a>
      </div>
    );
  }
};
