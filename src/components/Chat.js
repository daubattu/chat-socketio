import React, { Fragment } from "react"
import Messages from "./Messages";

function Chat(props) {
  const { group, actions, messages, isTyping } = props
  return (
    <Fragment>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div style={{ flexGrow: "1" }}>
          <div className="info-group">
            {
              group._id
              &&
              <Fragment>
                <b>{group.name}</b>
                <small onClick={() => actions.handleChangeStatusModal("listMembers")} style={{ cursor: "pointer" }}> {group.members.length} thành viên</small>
              </Fragment>
            }
          </div>
          <Messages messages={messages} />
        </div>
        <div className="input-message" style={{ marginBottom: "10px", position: "relative" }}>
          { isTyping && <img className="typing" src="/images/typing.gif" /> }
          <textarea id="message-content" onFocus={ actions.handleOnTyping } onBlur={ actions.handleUnTyping } onChange={actions.handleChangeMessage} className="form-control" placeholder="Nhập tin nhắn" />
          <button onClick={actions.handleSendMessage} className="btn btn-sm btn-primary" style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "15px" }}>Gửi</button>
        </div>
      </div>
    </Fragment>
  )
}

export default Chat