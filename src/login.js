const React = require("react");
module.exports = function Login(props) {
  return (
    <form action="/login" method="POST" id="form_id" onSubmit={props._onSubmit}>
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

      <div>
        <label htmlFor="official">Login as School Official</label>
        <input type="checkbox" id="official" name="official" value="isOn" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};
