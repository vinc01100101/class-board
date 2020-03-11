const React = require("react");

module.exports = () => {
  const userProfile = JSON.parse(
    document.getElementById("userProfile").textContent
  );
  return class ControlPanel extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return (
        <div>
          {userProfile.position == ("President" || "Vice President") && (
            <button
              onClick={() => {
                window.location.href = "/?page=create-admin";
              }}
            >
              Create Admin Account
            </button>
          )}
          <br />
          {userProfile.permissions.manageSchedule && (
            <button
              onClick={() => {
                window.location.href = "/?page=manage-schedules";
              }}
            >
              Manage Schedules
            </button>
          )}
          <br />
          {userProfile.permissions.manageStudentsPayment && (
            <button
              onClick={() => {
                window.location.href = "/?page=manage-students-payment";
              }}
            >
              Manage Students Payment
            </button>
          )}
          <br />
          <button
            onClick={() => {
              window.location.href = "/?page=view-and-manage-admins";
            }}
          >
            View And Manage Admins
          </button>
          <br />
          <a href={"/" + userProfile.schoolUrl}>Back</a>
        </div>
      );
    }
  };
};
