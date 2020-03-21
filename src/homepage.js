module.exports = () => {
  const React = require("react");
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showFeatures: false
      };
    }
    render() {
      const domSchoolsTxt = JSON.parse(
        document.getElementById("schools").textContent
      );

      return (
        <div id="homepage">
          <h1>Welcome to ClassBoard!</h1>

          <p>All registered campuses will have their own customizable page.</p>
          <p>Navigate to your school url using this format: </p>
          <p>
            <span style={{ color: "purple" }}>
              https://vince-class-board.glitch.me/
            </span>
            <span style={{ color: "red" }}>school_name</span>
          </p>
          <br />
          <form action="/schoolfromselect" method="POST">
            <p>Or you can just select here :P </p>
            <select name="school-name" id="school-name">
              {domSchoolsTxt.map((x, i) => (
                <option key={i} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <button type="submit" disabled={domSchoolsTxt.length == 0}>
              Enter School Page
            </button>
          </form>
          <br />
          <p>
            Your school isn't registered yet? Join us!{" "}
            <a href="/?page=register">Here's How.</a>
          </p>
          <div
            className="fb-like"
            data-href="https://vince-class-board.glitch.me/"
            data-width="30"
            data-layout="box_count"
            data-action="like"
            data-size="large"
            data-share="true"
          />
          <br />
          <br />
          {/*---------DEVELOPMENT-----------*/}
          <div
            style={{
              color: "lightgreen",
              border: "lightgreen solid 3px",
              width: "300px"
            }}
          >
            This project is still under development Please click
            <br />
            <button
              onClick={() => {
                this.setState(c => {
                  return { showFeatures: !c.showFeatures };
                });
              }}
            >
              here
            </button>
            <br />
            to view the list of currently working features.
            {this.state.showFeatures && (
              <FeaturesAndUpdates
                onC={() => {
                  this.setState(c => {
                    return { showFeatures: !c.showFeatures };
                  });
                }}
              />
            )}
            <br />
            <br />
            <a href="/api/drop-collection">
              <span style={{ color: "rgb(209, 71, 53)" }}>
                Delete Collections From Database(Development Mode Only)
              </span>
            </a>
          </div>

          {/*---------------------------------------*/}
        </div>
      );
    }
  };
  function FeaturesAndUpdates(props) {
    const listFeatures = [
      `Register a school. (register a school together with the Owner/President's
    account/email)`,
      `Control-Panel button.(Only visible to admins)`,
      `Create new admin account.`,
      `Log in an admin account or use a ticket of the newly created admin
    account.`,
      `Manage admin accounts (hover mouse on ID's to edit accounts).`,
      `Upload profile picture.`,
      `Navigate to a room in Profile page -> Blog post with user's detail.`
    ];

    const listUpdates = [
      `Chat functionality.`,
      `Class document upload`,
      `School home page customization`,
      `Students account registration.`,
      `Students performance tracker/record`,
      `Manage students' payment.`,
      `Manage schedule.`,
      `Manage course/curriculum.`,
      `Assign subjects.`,
      `School news feed.`
    ];
    return (
      <div className="popup-background">
        <div className="popup-content" id="features">
          <h4>Currently Working Features:</h4>
          <ol id="currently-working">
            {listFeatures.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>

          <h4>Future implementations:</h4>
          <ol id="future-updates">
            {listUpdates.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>
        </div>
        <button onClick={props.onC}>CLOSE</button>
      </div>
    );
  }
};
