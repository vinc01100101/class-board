const React = require("react");

module.exports = () => {
  const schoolPageLayout = JSON.parse(
    document.getElementById("schoolPageLayout").textContent
  );
  console.log("SCHHHHHHHH: " + schoolPageLayout.schoolUrl);
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        isOn: false
      };
      this._onSubmitEmail = this._onSubmitEmail.bind(this);
      this._onSubmitTicket = this._onSubmitTicket.bind(this);
      this._checkBoxOnChange = this._checkBoxOnChange.bind(this);
    }
    _onSubmitEmail(e) {
      const domUsr = document.getElementById("username");
      const domEmail = document.getElementById("email");
      domUsr.value = domEmail.value + "." + schoolPageLayout.schoolUrl;
    }
    _onSubmitTicket(e) {
      const domSchTk = document.getElementById("school-ticket");
      const domTicket = document.getElementById("ticket");
      domSchTk.value = domTicket.value + "." + schoolPageLayout.schoolUrl;
    }
    _checkBoxOnChange() {
      this.setState(currState => {
        return {
          isOn: !currState.isOn
        };
      });
    }
    render() {
      const errorDom = document.getElementById("errorDom").textContent;
      return (
        <div>
          <h1>YOUR SCHOOL HOME PAGE</h1>
          <h2>Welcome to {schoolPageLayout.schoolName}</h2>
          <input
            type="checkbox"
            id="is-ticket"
            onChange={this._checkBoxOnChange}
          />
          <label htmlFor="is-ticket">Insert ticket code <span style={{color: 'green'}}>(for new admin accounts only)</span></label>
          
          <p style={{ color: "red" }}>{errorDom}</p>
          {!this.state.isOn ? (
            <Login _onSubmitEmail={this._onSubmitEmail} />
          ) : (
            <Ticket _onSubmitTicket={this._onSubmitTicket} />
          )}

          <a href="/">Back</a>
          <br />
          <br />
          <h4>Like this school? Smash that like button!</h4>
          <div
            class="fb-like"
            data-href={
              "https://vince-class-board.glitch.me/" +
              schoolPageLayout.schoolUrl
            }
            data-width="30"
            data-layout="box_count"
            data-action="like"
            data-size="large"
            data-share="true"
          />
        </div>
      );
    }
  };

  function Login(props) {
    return (
      <form
        action="/login"
        method="POST"
        id="form_id"
        onSubmit={props._onSubmitEmail}
      >
        <div>
          <input
            type="text"
            id="username"
            name="username"
            style={{ display: "none" }}
          />
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email Address"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" required />
        </div>

        <button type="submit">Login</button>
      </form>
    );
  }

  function Ticket(props) {
    return (
      <div>
        <form action="/ticket" method="POST" onSubmit={props._onSubmitTicket}>
          <input
            type="text"
            id="school-ticket"
            name="school-ticket"
            style={{ display: "none" }}
          />
          <div>
            <label htmlFor="ticket">Ticket Code</label>
            <input type="text" id="ticket" name="ticket" />
          </div>
          <button type="submit">Validate</button>
        </form>
      </div>
    );
  }
};
