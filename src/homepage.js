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
          <p style={{ color: "green" }}>(Under development)</p>
          <p>Every registered school will have their own customizable page.</p>
          <p>Navigate to your school using this url format: </p>
          <p>
            <span style={{ color: "purple" }}>
              https://vince-class-board.glitch.me/
            </span>
            <span style={{ color: "red" }}>school_name</span>
          </p>
          <br />
          <form action="/schoolfromselect" method="POST">
            <p>Or select here: </p>
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
          <h5>
            1 Like = 5 hours of motivation boost to continue this project xD
          </h5>
          <div
            class="fb-like"
            data-href="https://vince-class-board.glitch.me/"
            data-width="30"
            data-layout="box_count"
            data-action="like"
            data-size="large"
            data-share="true"
          />
          <br />
          <br />
          <a href="/api/drop-collection">
            <span style={{ color: "red" }}>
              Delete Collections From Database(Development Mode Only)
            </span>
          </a>
        </div>
      );
    }
  };
};
