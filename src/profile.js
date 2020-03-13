const React = require("react");
module.exports = () => {
  const userProfile = JSON.parse(
    document.getElementById("userProfile").textContent
  );

  return class Profile extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: true
      };

      this._showStdPayments = this._showStdPayments.bind(this);
    }
    _showStdPayments() {}
    render() {
      const errorDom = document.getElementById("errorDom").textContent;
      const successDom = document.getElementById("successDom").textContent;

      const isOfficial = userProfile.member == "officials";
      return (
        <div>
          <h1>Profile Page</h1>
          <p style={{ color: "red" }}>{errorDom}</p>
          <p style={{ color: "green" }}>{successDom}</p>

          <BasicInfo />
          {isOfficial && <a href="/?page=control-panel">Control Panel</a>}
          <br />
          <a href="/logout">LOGOUT</a>
        </div>
      );
    }
  };

  function BasicInfo(props) {
    return (
      <div>
        <h1>Welcome to {userProfile.schoolName}</h1>
        <p>Name: {userProfile.firstName + " " + userProfile.lastName}</p>
        <p>Position: {userProfile.position}</p>
      </div>
    );
  }
};
