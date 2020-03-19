module.exports = () => {
  const React = require("react");
  const Room = require("./profile/room")();

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
        },
        showChangeDp: false
      };
      //this._newDpOnchange = this._newDpOnchange.bind(this);
      this._showChangeDp = this._showChangeDp.bind(this);
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
    _showChangeDp() {
      this.setState(currState => {
        return {
          showChangeDp: !currState.showChangeDp
        };
      });
    }
    //Preview profile pic that is to be uploaded
    _newDpOnchange(e) {
      document.getElementById("dp-preview").src = URL.createObjectURL(
        e.target.files[0]
      );
      // Other method
      // let reader = new FileReader();
      // reader.onload = () => {
      //   console.log("READER LOADED");
      //   document.getElementById("dp-preview").src = reader.result;
      // };
      // reader.readAsDataURL(e.target.files[0]);
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

          <BasicInfo
            _showChangeDp={this._showChangeDp}
            showChangeDp={this.state.showChangeDp}
            _newDpOnchange={this._newDpOnchange}
          />
          {isOfficial && <a href="/?page=control-panel">Control Panel</a>}
          <br />
          <TabsContainer tabContents={this.state.tabContents} />
          <a href="/logout">LOGOUT</a>
        </div>
      );
    }
  };

  function BasicInfo(props) {
    const imgPath =
      window.location.href.replace(/\/\?.+/, "") + userProfile.img;
    return (
      <div>
        <h1>Welcome to {userProfile.schoolName}</h1>
        <img id="profile-picture" className="dp" src={imgPath}></img>
        <div>
          <button onClick={props._showChangeDp} style={{ width: "100px" }}>
            Change picture
          </button>
          {props.showChangeDp && (
            <div className="popup-background">
              <form
                className="popup-content"
                method="POST"
                action="/api/change-dp"
                encType="multipart/form-data"
              >
                <input
                  type="file"
                  name="newDp"
                  accept="image/*"
                  onChange={props._newDpOnchange}
                />

                <img src="#" id="dp-preview" className="dp" />
                <button type="submit">Upload</button>
                <button onClick={props._showChangeDp}>Cancel</button>
              </form>
            </div>
          )}
        </div>

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
