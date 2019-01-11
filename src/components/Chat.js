import React, { Fragment } from "react"
import Messages from "./Messages";

function Chat(props) {
  const { group, actions, messages, message, isTyping, isMe, openExtendTypeMessage } = props

  const isValid = message => {
    if (message.type === "text") {
      if (message.content) {
        return "fa fa-paper-plane-o valid"
      } else {
        return "fa fa-paper-plane-o"
      }
    } else {
      if (message.files && message.files.length !== 0) {
        return "fa fa-paper-plane-o valid"
      } else {
        return "fa fa-paper-plane-o"
      }
    }
  }

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

        <div>
          <div className="input-message" style={{ marginBottom: "40px", position: "relative" }}>
            <div style={{ position: "relative" }}>
              {isTyping && <img className="typing" src="/images/typing.gif" />}
              <textarea
                // className={ message.type }
                onKeyPress={event => {
                  if (event.key === 'Enter') {
                    actions.handleSendMessage()
                  }
                }}
                value={message.content || ""}
                id="message-content"
                onFocus={actions.handleOnTyping}
                onBlur={actions.handleUnTyping}
                onChange={event => actions.handleChangeMessage("content", event.target.value)}
                className="form-control"
                placeholder="Nhập tin nhắn"
              />
              <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: "15px", display: "flex", alignItems: "center" }}>
                <div className={openExtendTypeMessage ? "extend-type-message is-extend" : "extend-type-message"}>
                  {
                    openExtendTypeMessage
                    &&
                    <Fragment>
                      <label htmlFor="image">
                        <i className={ message.type === "image" ? "fa fa-picture-o selected" : "fa fa-picture-o"} style={{ cursor: "pointer" }} aria-hidden="true"></i>
                      </label>
                      <input accept="image/*" multiple onChange={event => actions.handleChangeMessageWithFile("image", event.target.files)} id="image" type="file" />
                      <label htmlFor="video">
                        <i className={ message.type === "video" ? "fa fa-video-camera selected" : "fa fa-video-camera"} style={{ margin: "0 5px", cursor: "pointer" }} aria-hidden="true"></i>
                      </label>
                      <input accept="video/*" onChange={event => actions.handleChangeMessageWithFile("video", event.target.files)} id="video" type="file" />
                      <label htmlFor="file">
                        <i className={ message.type === "file" ? "fa fa-paperclip selected" : "fa fa-paperclip"} style={{ cursor: "pointer", fontWeight: "bold" }} aria-hidden="true"></i>
                      </label>
                      <input onChange={event => actions.handleChangeMessageWithFile("file", event.target.files)} id="file" type="file" />
                    </Fragment>
                  }
                  <i onClick={actions.handleChangeStateOpenExtendTypeMessage} style={{ cursor: "pointer" }} className="fa fa-chevron-right" aria-hidden="true"></i>
                </div>
                <i
                  onClick={() => {
                    if (message.content) {
                      actions.handleChangeStateOpenExtendTypeMessage
                    }
                  }}
                  style={{ cursor: "pointer", marginLeft: "10px" }} onClick={actions.handleSendMessage} className={isValid(message)} aria-hidden="true"></i>
              </div>
            </div>
            {
              message.type !== "text"
              &&
              <div className={"preview-files-attachment" + " " + message.type}>
                {
                  message.type === "image"
                  &&
                  <Fragment>
                    {
                      message.files.map((image, index) => {
                        if (image.isLoading) {
                          return <img key={index} src="/images/loading.gif" style={{ height: "20px", marginRight: "5px" }} />
                        }
                        return (
                          <div key={index} className="item-preview-image" onClick={() => actions.handleDeleteFilesWithIndex(index)}>
                            <i className="fa fa-trash-o" aria-hidden="true"></i>
                            <img src={image.src} style={{ height: "50px" }} />
                          </div>
                        )
                      })
                    }
                  </Fragment>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default Chat