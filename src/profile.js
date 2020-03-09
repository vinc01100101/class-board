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
          <h1>HEY PROFILE</h1>
          <p style={{ color: "red" }}>{errorDom}</p>
          <p style={{ color: "green" }}>{successDom}</p>

          <BasicInfo />
          {isOfficial && <a href="/?page=control-panel">Control Panel</a>}
          <a href="/api/logout">Logout</a>
        </div>
      );
    }
  };

  function BasicInfo(props) {
    return (
      <div>
        <h1>{userProfile.schoolName}</h1>
        <p>{userProfile.firstName + " " + userProfile.lastName}</p>
        <p>{userProfile.position}</p>
      </div>
    );
  }
};
