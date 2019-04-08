import React, { Fragment } from "react"
import Messages from "./Messages";
import { Progress } from 'antd'
import RefMessage from "./RefMessage";

function renderMemberTyping(members) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
      {
        members.map((member, index) => {
          return (
            <img key={member._id || index} src={member.avatar} style={{ height: "30px", width: "30px", borderRadius: "50%",  marginRight: "5px" }} />
          )
        })
      }
      <img style={{ clear: "both", display: "block", height: "20px", borderRadius: 0 }} src="/images/typing.gif" />
    </div>
  )
}

function Chat(props) {
  const { group, actions, isPrivateGroup, refMessage, messages, message, membersTyping, isMe, openExtendTypeMessage, percentCompleted, isLatestMessage, messageSelected, handleScroll, isLoadingLoadMoreMessage } = props

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

  const formatFileSize = size => {
    var i = Math.floor(Math.log(size) / Math.log(1024))
    return (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i]
  }

  const previewFilesAttachment = (file, index) => {
    if (message.type === "image") {
      return (
        <div key={index} className="item-preview-image" onClick={() => actions.handleDeleteFilesWithIndex(index)}>
          <i className="fa fa-trash-o" aria-hidden="true"></i>
          <img src={file.src} style={{ height: "50px" }} />
        </div>
      )
    } else if (message.type === "video") {
      return (
        <div key={index} className="item-preview-video">
          <i className="fa fa-file-video-o" aria-hidden="true"></i>
          {` `}
          {file.file.name} - {formatFileSize(file.file.size)}
          <i style={{ marginLeft: "5px", cursor: "pointer" }} onClick={() => actions.handleDeleteFilesWithIndex(index)} className="fa fa-trash-o" aria-hidden="true"></i>
        </div>
      )
    } else if (message.type === "file") {
      return (
        <div key={index} className="item-preview-file">
          <i className="fa fa-file-o" aria-hidden="true"></i>
          {` `}
          {file.file.name} - {formatFileSize(file.file.size)}
          <i style={{ marginLeft: "5px", cursor: "pointer" }} onClick={() => actions.handleDeleteFilesWithIndex(index)} className="fa fa-trash-o" aria-hidden="true"></i>
        </div>
      )
    } else if (message.type === "voice") {
      return (
        <div key={index} className="item-preview-file">
          <i className="fa fa-file-audio-o" aria-hidden="true"></i>
          {` `}
          {file.file.name} - {formatFileSize(file.file.size)}
          <i style={{ marginLeft: "5px", cursor: "pointer" }} onClick={() => actions.handleDeleteFilesWithIndex(index)} className="fa fa-trash-o" aria-hidden="true"></i>
        </div>
      )
    } else {
      return null
    }
  }

  return (
    <Fragment>
      {
        group._id
        &&
        <div style={{ position: "relative", width: "100%" }}>
          <div className="info-group" style={{ width: "100%", background: "#eee", position: "absolute", display: "flex", justifyContent: "space-between", padding: "5px 10px", borderRadius: "3px" }}>
            <span>
              <b>{group.name}</b>
              {
                group.admin
                &&
                <small onClick={() => actions.handleChangeStatusModal("listMembers")} style={{ cursor: "pointer" }}> {group.members.length} thành viên</small>
              }
            </span>
            {
              isLoadingLoadMoreMessage
              &&
              <span>
                <img src="/images/loading.gif" style={{ height: "15px" }} />
              </span>
            }
          </div>
        </div>
      }
      <div style={{ marginTop: "31px", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
        <div id="wrapper-messages" onScroll={handleScroll} style={{ flexGrow: "1", overflow: "auto", height: "100vh" }}>
          <Messages isPrivateGroup={isPrivateGroup} setRefMessage={actions.setRefMessage} numberOfMember={group.members ? group.members.length : 0} isLatestMessage={isLatestMessage} isMe={isMe} messages={messages} />
        </div>

        <div className="input-message" style={{ marginBottom: "40px", position: "relative" }}>
            {
              membersTyping && membersTyping.length !== 0
                ? renderMemberTyping(membersTyping)
                : null
            }
            {
              refMessage
              &&
              <div>
                <RefMessage setRefMessage={actions.setRefMessage} message={refMessage} />
              </div>
            }
            <div style={{ position: "relative" }}>
              <textarea
                onKeyPress={event => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    actions.handleSendMessage()
                  }
                }}
                value={message.content || ""}
                id="message-content"
                onFocus={actions.handleReadLastMessage}
                onBlur={actions.handleUnTyping}
                onChange={event => actions.handleChangeMessage("content", event.target.value)}
                placeholder="Nhập tin nhắn"
              />
              <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", right: 0, display: "flex", alignItems: "center" }}>
                <div className={openExtendTypeMessage ? "extend-type-message is-extend" : "extend-type-message"}>
                  {
                    openExtendTypeMessage
                    &&
                    <Fragment>
                      <label htmlFor="image" onClick={() => actions.handleChangeMessage("type", "image")}>
                        <i className={message.type === "image" ? "fa fa-picture-o selected" : "fa fa-picture-o"} style={{ cursor: "pointer" }} aria-hidden="true"></i>
                      </label>
                      <input accept="image/*" multiple onChange={event => actions.handleChangeMessageWithFile("image", event.target.files)} id="image" type="file" />
                      <label 
                      // htmlFor="voice" 
                        onClick={
                          () => {
                            actions.handleChangeMessage("type", "voice")
                            actions.handleChangeStatusModal("recordAudio")
                            // actions.handleChangeMessage("type", "voice")
                          }}>
                        <i className={message.type === "voice" ? "fa fa-microphone selected" : "fa fa-microphone"} style={{ marginLeft: "5px", fontWeight: "bold", cursor: "pointer" }} aria-hidden="true"></i>
                      </label>
                      {/* <input accept="audio/*" onChange={event => actions.handleChangeMessageWithFile("voice", event.target.files)} id="voice" type="file" /> */}
                      <label htmlFor="video" onClick={() => actions.handleChangeMessage("type", "video")}>
                        <i className={message.type === "video" ? "fa fa-video-camera selected" : "fa fa-video-camera"} style={{ marginLeft: "5px", cursor: "pointer" }} aria-hidden="true"></i>
                      </label>
                      <input accept="video/*" onChange={event => actions.handleChangeMessageWithFile("video", event.target.files)} id="video" type="file" />
                      <label htmlFor="file" onClick={() => actions.handleChangeMessage("type", "file")}>
                        <i className={message.type === "file" ? "fa fa-paperclip selected" : "fa fa-paperclip"} style={{ marginLeft: "5px", cursor: "pointer", fontWeight: "bold" }} aria-hidden="true"></i>
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
                  style={{ cursor: "pointer", marginLeft: "5px" }} onClick={actions.handleSendMessage} className={isValid(message)} aria-hidden="true"></i>
              </div>
            </div>
            {
              message.type !== "text" && message.files && message.files.length !== 0
                ? <div className={"preview-files-attachment" + " " + message.type}>
                  <Fragment>
                    {
                      message.files.map((file, index) => {
                        if (file.isLoading) {
                          return <img key={index} src="/images/loading.gif" style={{ height: "20px", marginRight: "5px" }} />
                        }
                        return previewFilesAttachment(file, index)
                      })
                    }
                  </Fragment>
                </div>
                : null
            }
            {
              percentCompleted
                ? <Progress percent={percentCompleted} size="small" status="active" />
                : null
            }
          </div>
      </div>
    </Fragment>
  )
}

export default Chat