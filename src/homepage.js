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

          <p>Every registered school will have their own customizable page.</p>
          <p>Navigate to your school using this url format: </p>
          <p>
            <span style={{ color: "purple" }}>
              https://vince-class-board.glitch.me/
            </span>
            <span style={{ color: "red" }}>school_name</span>
          </p>
          <br />
          <form action="/schoolfromselect" method="POST">
            <p>Or select here: </p>
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
            // data-href={process.env.TUNNEL}
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
              color: "green",
              border: "green solid 3px",
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
              <span style={{ color: "red" }}>
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
      `Log in an Admin Account or use a ticket of the newly created admin
    account.`,
      `Control Panel button.`,
      `Create Admin Account.`,
      `Manage Admin Accounts (hover mouse on ID's to edit accounts).`
    ];

    const listUpdates = [];
    return (
      <div id="features-main-container">
        <div id="secondary">
          <h4>Currently Working Features:</h4>
          <ol id="currently-working">
            {listFeatures.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ol>
        </div>
        <button onClick={props.onC}>CLOSE</button>
      </div>
    );
  }
};
