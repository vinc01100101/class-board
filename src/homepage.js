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

          <p>Navigate to your school using this url format: </p>
          <p>
            <span style={{ color: "purple" }}>https://classboard.com/</span>
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
          <a href="/api/drop-collection">Delete Collections From Database</a>
        </div>
      );
    }
  };
};
