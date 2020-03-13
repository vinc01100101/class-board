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

  let popupContainer;
  let popupName;
  let popupId;
  let oldHtml = "";

  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        showManageAdmin: true,
        posLevel: 5,
        html: {
          __html: this.generateHtml(listOfAdmins)
        }
      };
      this.__popupContClick = this.__popupContClick.bind(this);
      this._editOnClick = this._editOnClick.bind(this);
      this._editClose = this._editClose.bind(this);
      this.__posOnChange = this.__posOnChange.bind(this);
      this._sort = this._sort.bind(this);
      this.generateHtml = this.generateHtml.bind(this);
      this.setListeners = this.setListeners.bind(this);
    }

    componentDidMount() {
      popupContainer = document.getElementById("popup-container");
      popupName = document.getElementById("popup-name");
      popupId = document.getElementById("popup-id");
      this._sort("position.-1");
      this.setListeners();
    }

    componentDidUpdate() {
      this.setListeners();
    }
    setListeners() {
      if (oldHtml != this.state.html.__html) {
        function _handleClick(e) {
          console.log("CLICKED");
          const toEdit = listOfAdmins.filter(
            x => x.id == e.target.textContent
          )[0];

          popupName.textContent = toEdit.name;
          popupId.textContent = e.target.textContent;
          popupContainer.style.display = "flex";
        }
        const clicks = document.getElementsByClassName("clickable");

        for (const props in clicks) {
          !isNaN(parseInt(props)) &&
            clicks[props].addEventListener("click", _handleClick);
        }

        oldHtml = this.state.html.__html;
      }
    }
    generateHtml(argumentListOfAdmins) {
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
      const mapList = argumentListOfAdmins.map((x, i) => {
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

      return mapList.join("");
    }
    __popupContClick(e) {
      if (e.target == popupContainer) popupContainer.style.display = "none";
    }
    _editOnClick() {
      popupContainer.style.display = "none";

      const accountToEdit = listOfAdmins.filter(
        x => x.id == popupId.textContent && x.name == popupName.textContent
      )[0];
      document.getElementById("h4-nameofaccount-to-edit").textContent =
        accountToEdit.name;
      document.getElementById("nameofaccount-to-edit").value =
        accountToEdit.name;
      document.getElementById("idofaccount-to-edit").value = accountToEdit.id;
      document.getElementById("nameofaccount-to-delete").value =
        accountToEdit.name;
      document.getElementById("idofaccount-to-delete").value = accountToEdit.id;
      document.getElementById("position").value = accountToEdit.position;
      document.getElementById("sched").checked =
        accountToEdit.permissions.manageSchedule && true;
      document.getElementById("payment").checked =
        accountToEdit.permissions.manageStudentsPayment && true;
      const adminCheckDom = document.getElementById("admin-accounts");
      if (adminCheckDom)
        adminCheckDom.checked =
          accountToEdit.permissions.manageAdminAccounts && true;

      accountToEdit.position == "Accountant" ||
      accountToEdit.position == "Faculty"
        ? this.setState({ showManageAdmin: false })
        : this.setState({ showManageAdmin: true });
      this.setState({
        posLevel: hierarchy[userProfile.position]
      });
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
    _sort(e) {
      let sortedList = [...listOfAdmins];
      const splitted = e.target ? e.target.value.split(".") : e.split(".");
      const column = splitted[0];
      const mode = parseInt(splitted[1]);
      sortedList.sort((a, b) => {
        let compA, compB;
        if (column == "name") {
          compA = a[column];
          compB = b[column];
        } else {
          compA = hierarchy[a[column]];
          compB = hierarchy[b[column]];
        }

        if (compA > compB) {
          return mode;
        }
        if (compB > compA) {
          return -mode;
        }
        return 0;
      });
      this.setState({
        html: {
          __html: this.generateHtml(sortedList)
        }
      });
    }
    _handleSubmit(e) {
      const conf = confirm(
        e.target.id == "delete-account"
          ? "Are you sure to DELETE this account?"
          : "Proceed UPDATING this account?"
      );
      !conf && e.preventDefault();
    }
    render() {
      const successDom = document.getElementById("successDom").textContent;
      const errorDom = document.getElementById("errorDom").textContent;
      return (
        <div>
          <h1>View and manage admin accounts</h1>
          <ul>
            <li>You can only edit accounts if you have the permission</li>
            <li>
              You can only edit accounts of those whose position is descendant
              of yours
            </li>
          </ul>
          <h4 style={{ color: "green" }}>{successDom}</h4>
          <h4 style={{ color: "red" }}>{errorDom}</h4>
          <div id="popup-container" onClick={this.__popupContClick}>
            <div id="popup">
              <h4 id="popup-name"></h4>
              <p id="popup-id"></p>
              <button onClick={this._editOnClick}>Edit This Account</button>
            </div>
          </div>

          <div id="edit-account-container">
            <form
              id="edit-account"
              action="/update-account"
              method="POST"
              onSubmit={this._handleSubmit}
            >
              <input
                type="text"
                style={{ display: "none" }}
                id="nameofaccount-to-edit"
                name="nameofaccount-to-edit"
              />
              <input
                type="text"
                style={{ display: "none" }}
                id="idofaccount-to-edit"
                name="idofaccount-to-edit"
              />
              <h4 id="h4-nameofaccount-to-edit" />
              <div>
                <label htmlFor="position">Position: </label>
                <select
                  id="position"
                  name="position"
                  onChange={this.__posOnChange}
                >
                  {this.state.posLevel > 4 && (
                    <option value="Vice President">Vice President</option>
                  )}
                  {this.state.posLevel > 3 && (
                    <option value="Dean">Dean</option>
                  )}
                  {this.state.posLevel > 2 && (
                    <option value="Faculty">Faculty</option>
                  )}
                  {this.state.posLevel > 2 && (
                    <option value="Accountant">Accountant</option>
                  )}
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
            <form
              action="/delete-account"
              method="POST"
              id="delete-account"
              onSubmit={this._handleSubmit}
            >
              <input
                type="text"
                style={{ display: "none" }}
                id="nameofaccount-to-delete"
                name="nameofaccount-to-delete"
              />
              <input
                type="text"
                style={{ display: "none" }}
                id="idofaccount-to-delete"
                name="idofaccount-to-delete"
              />
              <button type="submit" id="edit-account-delete">
                (!!) Delete This Account
              </button>
            </form>

            <button id="edit-account-close" onClick={this._editClose}>
              Cancel
            </button>
          </div>

          <label htmlFor="sortby">Sort By: </label>
          <select id="sortby" onChange={this._sort} defaultValue="position.-1">
            <option value="name.1">Name(A-Z)</option>
            <option value="name.-1">Name(Z-A)</option>
            <option value="position.1">Position(Incrementing)</option>
            <option value="position.-1">Position(Decrementing)</option>
          </select>
          <div id="table-container">
            <div id="admins-table" dangerouslySetInnerHTML={this.state.html} />
          </div>
          <a href="/?page=control-panel">Back</a>
        </div>
      );
    }
  };
};
