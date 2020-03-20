module.exports = () => {
  const React = require("react"),
    socket = io(),
    clientEmitsListener = require("./client-emits-listener");

  const raw = JSON.parse(document.getElementById("courseList").textContent);
  const courseList = raw.map(x => x[0]);
  let courseDom, yrDom, sectionDom, enterDom, windowPath;

  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        course: null,
        yr: null,
        section: null,
        tabContents: {
          cc1: "block",
          cc2: "none"
        },
        postInput: "",
        posts: []
      };
      this._yrChange = this._yrChange.bind(this);
      this._courseChange = this._courseChange.bind(this);
      this._sectionChange = this._sectionChange.bind(this);
      this.__handleTabShift2 = this.__handleTabShift2.bind(this);
      this.__connect = this.__connect.bind(this);
      this.__sendChat = this.__sendChat.bind(this);
      this._postInput = this._postInput.bind(this);
      this._postOnClick = this._postOnClick.bind(this);
      this._emitsCallback = this._emitsCallback.bind(this);
    }

    componentDidMount() {
      windowPath = window.location.href.replace(/\/\?.+/, "");
      courseDom = document.getElementById("course");
      yrDom = document.getElementById("yr");
      sectionDom = document.getElementById("section");
      enterDom = document.getElementById("enter");

      const tabNames = document.getElementsByClassName("room-tab");
      for (const props in tabNames) {
        !isNaN(parseInt(props)) &&
          tabNames[props].addEventListener("click", this.__handleTabShift2);
      }

      clientEmitsListener(socket, this._emitsCallback); //start listening to emits
    }
    _emitsCallback(p) {
      this.setState({
        posts: p
      });
    }
    _courseChange(e) {
      yrDom.value = "zero";
      sectionDom.value = "zero";
      this.setState({
        course: e.target.value,
        yr: null,
        section: null
      });
    }
    _yrChange(e) {
      sectionDom.value = "zero";
      this.setState({
        yr: e.target.value,
        section: null
      });
    }

    _sectionChange(e) {
      this.setState({
        section: e.target.value
      });
    }
    __handleTabShift2(e) {
      const sw = {
        cc1: "none",
        cc2: "none"
      };
      sw[e.target.id] = "block";
      this.setState({
        tabContents: sw
      });
    }
    __connect() {
      const roomDetail = {
        course: this.state.course,
        yr: this.state.yr,
        section: this.state.section
      };
      socket.emit("connect to room", roomDetail);
    }

    __sendChat() {}
    //text input from user
    _postInput(e) {
      this.setState({
        postInput: e.target.value
      });
    }
    //post to a room's blog
    _postOnClick() {
      socket.emit("post", this.state.postInput);
      this.setState({
        postInput: ""
      });
    }
    render() {
      return (
        <div id="room-content">
          {/*Room Section selection*/}
          <SelectRoom
            _courseChange={this._courseChange}
            _yrChange={this._yrChange}
            _sectionChange={this._sectionChange}
            __connect={this.__connect}
            course={this.state.course}
            yr={this.state.yr}
            section={this.state.section}
          />
          <div id="room-content-hide-at-first">
            {/*Room tab names*/}
            <div className="tab-names">
              <div className="room-tab tab-name" id="cc1">
                Posts
              </div>
              <div className="room-tab tab-name" id="cc2">
                Chat
              </div>
            </div>

            <div
              id="post-content"
              style={{ display: this.state.tabContents.cc1 }}
            >
              <h1>POSTS</h1>
              <div id="actual-posts-container">
                {this.state.posts.length > 0 &&
                  this.state.posts.map((x, i) => {
                    const date = new Date(x.date);
                    return (
                      <div className="postDiv" key={i}>
                        <div>
                          <img
                            className="postImg"
                            src={
                              windowPath +
                              "/img/users/" +
                              this.props.schoolUrl +
                              "/" +
                              x.id +
                              ".jpg"
                            }
                            onError={e => {
                              console.log("ONERROR");
                              e.target.onError = null;
                              e.target.src = windowPath + "/img/default.jpg";
                            }}
                          ></img>

                          <div className="postName">{x.name}</div>
                        </div>

                        <p className="postDate">
                          {date.toDateString() +
                            "|" +
                            date.toLocaleTimeString()}
                        </p>

                        <p className="postPost">{x.post}</p>
                      </div>
                    );
                  })}
              </div>
              <div id="post-input">
                <textarea
                  onChange={this._postInput}
                  value={this.state.postInput}
                />
                <button onClick={this._postOnClick}>POST</button>
              </div>
            </div>
            <div
              id="chat-content"
              style={{ display: this.state.tabContents.cc2 }}
            >
              <h1>CHAT</h1>
              <div id="chat-content" />
              <textarea id="user-input" />
              <button onClick={this.__sendChat}>Send</button>
            </div>
          </div>
        </div>
      );
    }
  };

  function SelectRoom(props) {
    return (
      <div id="room-select">
        {/*course select */}
        <select id="course" defaultValue="zero" onChange={props._courseChange}>
          <option disabled value="zero">
            Course
          </option>
          {courseList.map((x, i) => (
            <option key={i}>{x}</option>
          ))}
        </select>
        {/*year select */}
        <select
          id="yr"
          defaultValue="zero"
          onChange={props._yrChange}
          disabled={!!!props.course}
        >
          <option disabled value="zero">
            Year
          </option>

          {props.course &&
            raw
              .filter(x => x[0] == props.course)[0]
              .map(
                (x, i) =>
                  i != 0 && (
                    <option key={i} value={i}>
                      {i == 1
                        ? "1st yr"
                        : i == 2
                        ? "2nd yr"
                        : i == 3
                        ? "3rd yr"
                        : i + "th yr"}
                    </option>
                  )
              )}
        </select>
        {/*section select */}
        <select
          id="section"
          defaultValue="zero"
          onChange={props._sectionChange}
          disabled={!!!props.yr}
        >
          <option disabled value="zero">
            Section
          </option>
          {props.yr &&
            raw
              .filter(x => x[0] == props.course)[0]
              [props.yr].map((x, i) => <option key={i}>{x}</option>)}
        </select>
        {/*enter-room button*/}
        <button
          id="enter"
          disabled={!!!props.section}
          onClick={props.__connect}
        >
          Enter room
        </button>
      </div>
    );
  }
};
