import React, { Fragment } from "react"
import { Tooltip, Icon } from "antd"

function customCreatedTime(createdTime) {
  return `${new Date(createdTime).toLocaleTimeString()} - ${new Date(createdTime).toLocaleDateString()}`
}

function displayMessageAttachment(type, files) {
  if (type === "image") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <a key={index} href={file.originalSrc} data-lity>
                <img onError={event => event.target.src = "/images/404.jpg"} src={file.thumbnailSrc} className="message-attachments-item image" />
              </a>
            )
          })
        }
      </Fragment>
    )
  } else if (type === "video") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <a key={index} style={{ display: "inline-block", position: "relative", cursor: "pointer", height: "100px" }} href={file.originalSrc} data-lity>
                <img onError={event => event.target.src = "/images/404.jpg"} src={file.thumbnailSrc} style={{ height: "50px", borderRadius: "5px" }} className="message-attachments-item video" />
                <div style={{ position: "absolute", width: "100%", height: "100%", background: "#fff", top: 0, opacity: ".3" }}></div>
                <Icon style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "30px", color: "black" }} type="play-circle" />
              </a>
            )
          })
        }
      </Fragment>
    )
  } else if (type === "file") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <a download key={index} href={file.originalSrc}><i className="fa fa-download" aria-hidden="true"></i></a>
            )
          })
        }
      </Fragment>
    )
  } else if (type === "voice") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <audio key={index} controls preload="metadata">
                <source src={file.originalSrc} />
              </audio>
            )
          })
        }
      </Fragment>
    )
  } else {
    return null
  }
}

function displayMemberReaded(message, isMe, numberOfMember, isMeFunc) {
  let readedByText = ""
  if (message.memberReaded) {
    for (let memberReaded of message.memberReaded) {
      if ((memberReaded._id !== message.user._id) && !isMeFunc(memberReaded._id)) {
        readedByText += readedByText === "" ? memberReaded.name : `, ${memberReaded.name}`
      }
    }

    if (readedByText === "") return null

    if (numberOfMember === 2) {
      if (isMe) {
        return <small><i style={{ color: "green" }} className="fa fa-check-circle-o" aria-hidden="true"></i> Đã xem</small>
      } else {
        return null
      }
    } else {
      return <small><i style={{ color: "green" }} className="fa fa-check-circle-o" aria-hidden="true"></i> {readedByText} đã xem</small>
    }
  } else return null
}

function Message(props) {
  const { message, isMe, isLatestMessage, numberOfMember } = props

  return (
    <div className={isMe(message.user._id) ? "item-message me" : "item-message"}>
      {!isMe(message.user._id) && <img src={message.user.avatar} style={{ height: "30px", width: "30px", marginRight: "5px" }} />}
      <div>
        {
          message.content || message.type === "map"
          ?
          <Fragment>
            {/* {
              messageSelected && messageSelected._id === message._id
                ? <span style={{ marginRight: "5px", backgroundColor: "#ccc", borderRadius: "3px", padding: "5px 10px" }}>
                    <i onClick={() => setMessageSelected(null)} style={{ cursor: "pointer" }} className="fa fa-chevron-right" aria-hidden="true"></i>
                    <Icon style={{ margin: "0 8px", cursor: "pointer" }} type="edit" />
                    <Icon style={{ cursor: "pointer" }} type="delete" />
                  </span>
                : null
            }
            {isMe(message.user._id) && !(messageSelected && messageSelected._id === message._id) ? <i id="icon-show-more-message" onClick={() => setMessageSelected(message)} style={{ marginRight: "5px", cursor: "pointer", color: "#ccc" }} className="fa fa-chevron-left" aria-hidden="true"></i> : null} */}
            <Tooltip placement={isMe(message.user._id) ? "left" : "right"} title={customCreatedTime(message.createdTime)}>
              <span className={message.error ? "item-message-content error" : "item-message-content"}>
                {
                  message.type === "map"
                  ? "định dạng tin nhắn này chưa được hỗ trợ trên web"
                  : message.content
                }
              </span>
            </Tooltip>
          </Fragment>
          : null
        }
        {
          message.files && message.files.length !== 0
            ? <Tooltip placement={isMe(message.user._id) ? "left" : "right"} title={customCreatedTime(message.createdTime)}>
              <div className="message-attachments">
                {displayMessageAttachment(message.type, message.files)}
              </div>
            </Tooltip>
            : null
        }
        <div className="member-readed-message">
          {isLatestMessage(message._id) && displayMemberReaded(message, isMe(message.user._id), numberOfMember, isMe)}
        </div>
        {/* { !message.error && <small className="item-message-created-time">{customCreatedTime(message.createdTime)}</small> } */}
      </div>
    </div>
  )
}

export default Message