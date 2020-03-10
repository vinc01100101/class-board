const React = require("react");

module.exports = () => {
  const hierarchy = {
    President: 5,
    "Vice President": 4,
    Dean: 3,
    Faculty: 2,
    Accountant: 2
  };
  const userProfile = JSON.parse(
    document.getElementById("userProfile").textContent
  );
  const listOfAdmins = JSON.parse(
    document.getElementById("listOfAdmins").textContent
  );
  const generatePermissionList = p => {
    let permList = "";
    for (const prop in p) {
      permList += p[prop] ? "<li>" + prop + "</li>" : "";
    }
    return permList;
  };
  const recognizeRel = (user, target, perm) => {
    return perm && hierarchy[user] > hierarchy[target];
  };
  const mapList = listOfAdmins.map((x, i) => {
    return `<div class="${(x.pending ? "pending" : "") +
      " " +
      (recognizeRel(
        userProfile.position,
        x.position,
        userProfile.permissions.manageAdminAccounts
      )
        ? "clickable"
        : "")}">${x.id}</div>
        <div  ${x.pending ? 'class="pending"' : ""}>${x.name}</div>
    <div ${x.pending ? 'class="pending"' : ""}>${x.position}</div>
    <div ${x.pending ? 'class="pending"' : ""}>${x.email}</div>
    <div><ul ${x.pending ? 'class="pending"' : ""}>${generatePermissionList(
      x.permissions
    )}</ul></div>
    `;
  });
  mapList.unshift(
    `<h4>ID</h4>
    <h4>Name</h4>
    <h4>Position</h4>
    <h4>Email</h4>
    <h4>Permissions</h4>`
  );
  const html = {
    __html: mapList.join("")
  };
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showManageAdmin: true
      };
      this.__popupContClick = this.__popupContClick.bind(this);
      this._editOnClick = this._editOnClick.bind(this);
      this._editClose = this._editClose.bind(this);
      this.__posOnChange = this.__posOnChange.bind(this);
    }

    componentDidMount() {
      const popupContainer = document.getElementById("popup-container");
      const popupName = document.getElementById("popup-name");
      const popupId = document.getElementById("popup-id");

      function _handleClick(e) {
        // popup.style.left = e.clientX;
        // popup.style.top = e.clientY;
        popupName.textContent = listOfAdmins.filter(
          x => x.id == e.target.textContent
        )[0].name;
        popupId.textContent = e.target.textContent;
        popupContainer.style.display = "flex";
      }
      const clicks = document.getElementsByClassName("clickable");

      for (const props in clicks) {
        !isNaN(parseInt(props)) &&
          clicks[props].addEventListener("click", _handleClick);
      }
    }
    __popupContClick(e) {
      const cont = document.getElementById("popup-container");
      if (e.target == cont) cont.style.display = "none";
    }
    _editOnClick() {
      document.getElementById("popup-container").style.display = "none";
      document.getElementById("edit-account-container").style.display = "flex";
    }
    __posOnChange(e) {
      e.target.value == "Accountant" || e.target.value == "Faculty"
        ? this.setState({ showManageAdmin: false })
        : this.setState({ showManageAdmin: true });
    }
    _editClose() {
      document.getElementById("edit-account-container").style.display = "none";
    }
    render() {
      return (
        <div>
          <h1>View and manage admin accounts</h1>

          <div id="popup-container" onClick={this.__popupContClick}>
            <div id="popup">
              <h4 id="popup-name"></h4>
              <p id="popup-id"></p>
              <button onClick={this._editOnClick}>Edit</button>
            </div>
          </div>

          <div id="edit-account-container">
            <form id="edit-account">
              <div>
                <label htmlFor="position">Position: </label>
                <select
                  id="position"
                  name="position"
                  onChange={this.__posOnChange}
                >
                  <option value="Vice President">Vice President</option>
                  <option value="Dean">Dean</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <p>Permissions: </p>
              <div id="permissions">
                <div>
                  <input type="checkbox" name="sched" id="sched" />
                  <label htmlFor="sched">Manage Schedules</label>
                </div>
                <div>
                  <input type="checkbox" name="payment" id="payment" />
                  <label htmlFor="payment">Manage Students Payment</label>
                </div>
                {this.state.showManageAdmin && (
                  <div>
                    <input
                      type="checkbox"
                      name="admin-accounts"
                      id="admin-accounts"
                    />
                    <label htmlFor="admin-accounts">
                      Manage Admin Accounts
                    </label>
                  </div>
                )}
              </div>
              <button id="edit-account-update" type="submit">
                Update
              </button>
            </form>
            <button id="edit-account-delete">(!!) Delete This Account</button>
            <button id="edit-account-close" onClick={this._editClose}>
              Cancel
            </button>
          </div>

          <div id="table-container">
            <div id="admins-table" dangerouslySetInnerHTML={html} />
          </div>
        </div>
      );
    }
  };
};
