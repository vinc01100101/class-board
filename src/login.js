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

      <button type="submit">Submit</button>
    </form>
  );
};
