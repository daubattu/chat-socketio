import React, { Fragment } from "react"

function customCreatedTime(createdTime) {
  return `${new Date(createdTime).toLocaleTimeString()} - ${new Date(createdTime).toLocaleDateString()}`
}

function displayMessageAttachment(type, files) {
  if(type === "image") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <img key={index} src={file} className="message-attachments-item image" />
            )
          })
        }
      </Fragment>
    )
  }
} 

function Message(props) {
  const { message, isMe } = props

  return (
    <div className={isMe(message.user._id) ? "item-message me" : "item-message"}>
      {!isMe(message.user._id) && <img src={message.user.avatar} style={{ height: "30px", marginRight: "5px" }} />}
      <div>
        {
          message.content
          &&
          <span className={ message.error ? "item-message-content error" : "item-message-content" }>
            { message.content }
          </span>
        }
        {
          message.files && message.files.length !== 0
          ? <div className="message-attachments">
              { displayMessageAttachment(message.type, message.files)}
            </div>
          : null
        }
        { !message.error && <small className="item-message-created-time">{customCreatedTime(message.createdTime)}</small> }
      </div>
    </div>
  )
}

export default Message