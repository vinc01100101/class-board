const React = require("react");

module.exports = () => {
  const domUserProfile = JSON.parse(
    document.getElementById("userProfile").textContent
  );
  return class extends React.Component {
    constructor(props) {
      super(props);
      this._onSubmit = this._onSubmit.bind(this);
    }
    _onSubmit(e) {
      const domNP = document.getElementById("n-password");
      const domCP = document.getElementById("c-password").value;
      const domId = document.getElementById("id");
      const domOP = document.getElementById("o-password");
      const domSch = document.getElementById("school-url");
      const domUname = document.getElementById("username");
      if (domNP.value != domCP) {
        e.preventDefault();
        alert("Passwords don't match");
        domNP.focus();
      } else {
        domId.value = domUserProfile.id;
        domOP.value = domUserProfile.chocolate;
        domSch.value = domUserProfile.schoolUrl;
        domUname.value = domUserProfile.username;
      }
    }
    render() {
      return (
        <div>
          <h3>Welcome to our new admin! :D</h3>
          <h4>Please enter your new password.</h4>

          <form
            action="/update-password"
            method="POST"
            onSubmit={this._onSubmit}
          >
            <input type="text" id="id" name="id" style={{ display: "none" }} />
            <input
              type="text"
              id="username"
              name="username"
              style={{ display: "none" }}
            />
            <input
              type="text"
              id="o-password"
              name="o-password"
              style={{ display: "none" }}
            />
            <input
              type="text"
              id="school-url"
              name="school-url"
              style={{ display: "none" }}
            />

            <div>
              <label htmlFor="n-password">New Password: </label>
              <input type="password" name="n-password" id="n-password" />
            </div>
            <div>
              <label htmlFor="c-password">Confirm Password: </label>
              <input type="password" name="c-password" id="c-password" />
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>
      );
    }
  };
};
