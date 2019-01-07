import React, { Fragment } from "react"
import Messages from "./Messages";

function Chat(props) {
  const { group, actions, messages, message, isTyping, isMe, openExtendTypeMessage } = props
  return (
    <Fragment>
      {
        group._id
        &&
        <div style={{ position: "relative", width: "100%" }}>
          <div className="info-group" style={{ width: "100%", background: "#eee", position: "absolute", padding: "5px 10px", borderRadius: "3px" }}>
            <b>{group.name}</b>
            <small onClick={() => actions.handleChangeStatusModal("listMembers")} style={{ cursor: "pointer" }}> {group.members.length} thành viên</small>
          </div>
        </div>
      }
      <div style={{ marginTop: "31px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div id="wrapper-messages" style={{ flexGrow: "1", overflow: "auto", height: "100vh" }}>
          <Messages isMe={isMe} messages={messages} />
        </div>
        <div className="input-message" style={{ marginBottom: "40px", position: "relative" }}>
          {isTyping && <img className="typing" src="/images/typing.gif" />}
          <textarea
            onKeyPress={event => {
              if (event.key === 'Enter') {
                actions.handleSendMessage()
              }
            }}
            value={message.content || ""} id="message-content" onFocus={actions.handleOnTyping} onBlur={actions.handleUnTyping} onChange={event => actions.handleChangeMessage("content", event.target.value)} className="form-control" placeholder="Nhập tin nhắn" />
          <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "15px", display: "flex", alignItems: "center" }}>
            <div className={openExtendTypeMessage ? "extend-type-message is-extend" : "extend-type-message"}>
              {
                openExtendTypeMessage
                &&
                <Fragment>
                  <i className="fa fa-picture-o" style={{ marginRight: "5px", cursor: "pointer" }} aria-hidden="true"></i>
                  <i className="fa fa-video-camera" style={{ cursor: "pointer" }} aria-hidden="true"></i>
                </Fragment>
              }
              <i onClick={actions.handleChangeStateOpenExtendTypeMessage} style={{ cursor: "pointer" }} className="fa fa-chevron-right" aria-hidden="true"></i>
            </div>
            <i style={{ cursor: "pointer", marginLeft: "10px" }} onClick={actions.handleSendMessage} className="fa fa-paper-plane-o" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Chat