const React = require("react");

module.exports = () => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this._onSubmit = this._onSubmit.bind(this);
    }
    _onSubmit(e) {
      const domP = document.getElementById("password").value;
      const domCP = document.getElementById("c-password").value;

      if (domP != domCP) {
        e.preventDefault();
        alert("Passwords don't match");
        domP.focus();
      }
    }
    render() {
      return (
        <div>
          <h3>Welcome to our new admin!</h3>
          <h4>Please enter your new password.</h4>

          <form
            action="/update-password"
            method="POST"
            onSubmit={this._onSubmit}
          >
            <div>
              <label htmlFor="password">New Password: </label>
              <input type="password" name="password" id="password" />
            </div>
            <div>
              <label htmlFor="c-password">Confirm Password: </label>
              <input type="password" name="c-password" id="c-password" />
            </div>
          </form>
        </div>
      );
    }
  };
};
