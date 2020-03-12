const React = require("react");
module.exports = () => {
  return class extends React.Component {
    render() {
      const domSchoolsTxt = JSON.parse(
        document.getElementById("schools").textContent
      );
      return (
        <div>
          <h1>Welcome to ClassBoard!</h1>
          <p style={{color: "green"}}>(Under development)</p>
          <p>Every registered school will have their own customizable School Page</p>
          <p>Navigate to your school using this url format: </p>
          <p>
            <span style={{ color: "purple" }}>https://vince-class-board.glitch.me/</span>
            <span style={{ color: "red" }}>school_name</span>
          </p>
          <br />
          <form action="/schoolfromselect" method="POST">
            <p>Or select your school here: </p>
            <label htmlFor="school-name">School Name: </label>
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
          <a href="/api/drop-collection"><span style={{color: 'red'}}>Delete Collections From Database(Development Mode Only)</span></a>
        </div>
      );
    }
  };
};
