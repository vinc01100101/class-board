module.exports = () => {
  const React = require("react");
  const Room = require("./profile/room")();
  require("./client-socket")();

  const userProfile = JSON.parse(
    document.getElementById("userProfile").textContent
  );

  return class Profile extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        tabContents: {
          c1: "block",
          c2: "none",
          c3: "none"
        }
      };

      this.__handleTabNamesClick = this.__handleTabNamesClick.bind(this);
    }
    __handleTabNamesClick(e) {
      //switch
      const sw = {
        c1: "none",
        c2: "none",
        c3: "none"
      };
      sw[e.target.id] = "block";

      this.setState({ tabContents: sw });
    }
    componentDidMount() {
      const tabNames = document.getElementsByClassName("profile-tab");
      for (const props in tabNames) {
        !isNaN(parseInt(props)) &&
          tabNames[props].addEventListener("click", this.__handleTabNamesClick);
      }
    }
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
          <TabsContainer tabContents={this.state.tabContents} />
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
  function TabsContainer(props) {
    return (
      <div id="tabs-container">
        <div className="tab-names">
          <div className="profile-tab tab-name" id="c1">
            ROOM
          </div>
          <div className="profile-tab tab-name" id="c2">
            MY RECORDS
          </div>
          <div className="profile-tab tab-name" id="c3">
            MY SCHEDULES
          </div>
        </div>
        <div id="tab-content-container">
          <div
            className="tab-content"
            id="content-room"
            style={{ display: props.tabContents.c1 }}
          >
            Room Content
            <Room />
          </div>
          <div
            className="tab-content"
            id="content-my-records"
            style={{ display: props.tabContents.c2 }}
          >
            Records Content
          </div>
          <div
            className="tab-content"
            id="content-my-schedules"
            style={{ display: props.tabContents.c3 }}
          >
            Schedules Content
          </div>
        </div>
      </div>
    );
  }
};
