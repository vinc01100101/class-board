module.exports = () => {
  const React = require("react");
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showReg: false
      };
      this._handleOnSubmit = this._handleOnSubmit.bind(this);
      this._handleChangeCheckbox = this._handleChangeCheckbox.bind(this);
    }
    _handleOnSubmit(e) {
      const domPw = document.getElementById("password");
      const domCPw = document.getElementById("confirm-password");
      const domSch = document.getElementById("school-name").value;
      if (domPw.value != domCPw.value) {
        e.preventDefault();
        alert("Passwords don't match.");
        domPw.focus();
      } else {
        const conf = confirm("Proceed with this school name? \n" + domSch);
        !conf && e.preventDefault();
      }
    }
    _handleChangeCheckbox(e) {
      this.setState(currState => {
        return {
          showReg: !currState.showReg
        };
      });
    }
    render() {
      const errorDom = document.getElementById("errorDom");
      const successDom = document.getElementById("successDom");
      return (
        <div>
          <h3>End-User License Agreement</h3>
          <p>Agreement agreement lorem ipsum blah blah...</p>
          <p>etc.. etc.. blah blahh agreement agreement</p>
          <p>blah blah wow you're still reading this</p>
          <label htmlFor="agree">
            <span style={{ fontWeight: "bold", fontSize: 24 }}>
              Agree and register
            </span>
          </label>
          <input
            id="agree"
            type="checkbox"
            onChange={this._handleChangeCheckbox}
          />
          <p style={{ color: "red" }}>{errorDom.textContent}</p>
          <p style={{ color: "green" }}>{successDom.textContent}</p>
          {this.state.showReg && (
            <RegistrationForm onSub={this._handleOnSubmit} />
          )}
          <p>
            Back to <a href="/">Home Page.</a>
          </p>
        </div>
      );
    }
  };
  function RegistrationForm(props) {
    return (
      <form action="/register-master" method="POST" onSubmit={props.onSub}>
        <div>
          <label htmlFor="first-name">First name: </label>
          <input
            type="text"
            id="first-name"
            name="first-name"
            placeholder="First Name"
            required
          />
        </div>
        <div>
          <label htmlFor="last-name">Last name: </label>
          <input
            type="text"
            id="last-name"
            name="last-name"
            placeholder="Last Name"
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email address : </label>
          <input
            type="email"
            id="email"
            name="username"
            placeholder="sample@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input type="password" id="password" name="password" required />
        </div>
        <div>
          <label htmlFor="confirm-password">Confirm password: </label>
          <input type="password" id="confirm-password" required />
        </div>
        <div>
          <label htmlFor="school-name">School name: </label>
          <input
            type="text"
            id="school-name"
            name="school-name"
            placeholder="School Name"
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    );
  }
};
