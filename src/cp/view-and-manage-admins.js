const React = require("react");

module.exports = () => {
  const listOfAdmins = JSON.parse(
    document.getElementById("listOfAdmins").textContent
  );
  return class extends React.Component {
    render() {
      const mapList = listOfAdmins.map((x, i) => {
        return `<div>${x.name}</div>
        <div>${x.position}</div>
        <div>${x.email}</div>
        <div>${JSON.stringify(x.permissions)}</div>
        `;
      });
      mapList.unshift(
        `<h4>Name</h4>
      <h4>Position</h4>
      <h4>Email</h4>
      <h4>Permissions</h4>`
      );
      const html = {
        __html: mapList.join("")
      };

      return (
        <div>
          <h1>View and manage admin accounts</h1>
          <div id="admins-table" dangerouslySetInnerHTML={html}></div>
        </div>
      );
    }
  };
};
