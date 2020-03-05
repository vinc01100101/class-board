const React = require("react");
module.exports = function Login() {
  return (
    <form action="/login" method="POST">
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="username"
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
