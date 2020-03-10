const React = require("react");

module.exports = () => {
  return class extends React.Component {
    constructor(props) {
      super(props);

      this._handleOnSubmit = this._handleOnSubmit.bind(this);
    }
    _handleOnSubmit(e) {
      const domFirst = document.getElementById("first-name").value;
      const domLast = document.getElementById("last-name").value;
      const domEmail = document.getElementById("email").value;
      const conf = confirm(
        domFirst +
          " " +
          domLast +
          "\n" +
          domEmail +
          "\n" +
          "Issue this ticket? A ticket code will be provided upon confirmation."
      );

      !conf && e.preventDefault();
    }
    render() {
      const errorDom = document.getElementById("errorDom").textContent;
      return (
        <div>
          <h1>Create Admin Account</h1>
          <p style={{ color: "red" }}>{errorDom}</p>
          <FormCreateAdmin _onSubmit={this._handleOnSubmit} />
        </div>
      );
    }
  };

  function FormCreateAdmin(props) {
    return (
      <div>
        <form onSubmit={props._onSubmit} action="/register-admin" method="POST">
          <div>
            <label htmlFor="first-name">First name: </label>
            <input type="text" id="first-name" name="first-name" />
          </div>
          <div>
            <label htmlFor="last-name">Last name: </label>
            <input type="text" id="last-name" name="last-name" />
          </div>
          <div>
            <label htmlFor="email">Email: </label>
            <input type="email" id="email" name="username" />
          </div>
          <div>
            <label htmlFor="position">Position: </label>
            <select id="position" name="position">
              <option value="Vice President">Vice President</option>
              <option value="Dean">Dean</option>
              <option value="Faculty">Faculty</option>
            </select>
          </div>
          <div>
            <p>Permissions: </p>
            <div>
              <label htmlFor="sched">Manage Schedules</label>
              <input type="checkbox" name="sched" id="sched" />
            </div>
            <div>
              <label htmlFor="payment">Manage Students Payment</label>
              <input type="checkbox" name="payment" id="payment" />
            </div>
            <div>
              <label htmlFor="admin-accounts">Manage Admin Accounts</label>
              <input
                type="checkbox"
                name="admin-accounts"
                id="admin-accounts"
              />
            </div>
          </div>
          <button type="submit">Issue this ticket</button>
        </form>
      </div>
    );
  }
};
