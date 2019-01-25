import React, { Fragment } from "react"
import { Tooltip } from "antd"

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
  } else if (type === "video") {
    return (
      <Fragment>
        {
          files.map((file, index) => {
            return (
              <video key={index} src={file} className="message-attachments-item video" style={{ height: "150px", marginTop: "5px" }} controls />
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
              <a download key={index} href={file}><i className="fa fa-download" aria-hidden="true"></i></a>
            )
          })
        }
      </Fragment>
    )
  }
} 

function displayMemberReaded(message, isMe, numberOfMember, isMeFunc) {
  let readedByText = ""
  if(message.memberReaded) {
    for(let memberReaded of message.memberReaded) {
      if((memberReaded._id !== message.user._id) && !isMeFunc(memberReaded._id)) {
        readedByText += readedByText === "" ? memberReaded.name : `, ${memberReaded.name}`
      }
    }

    if(readedByText === "") return null

    if(numberOfMember === 2) {
      if(isMe) {
        return <small><i style={{ color: "green" }} className="fa fa-check-circle-o" aria-hidden="true"></i> Đã xem</small>
      } else {
        return null
      }
    } else {
      return <small><i style={{ color: "green" }} className="fa fa-check-circle-o" aria-hidden="true"></i> { readedByText } đã xem</small>
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
          message.content
          &&
          <Tooltip placement={ isMe(message.user._id) ? "left" : "right" } title={customCreatedTime(message.createdTime)}>
            <span className={ message.error ? "item-message-content error" : "item-message-content" }>
              { message.content } 
            </span> 
          </Tooltip>
        }
        {
          message.files && message.files.length !== 0
          ? <Tooltip placement={ isMe(message.user._id) ? "left" : "right" } title={customCreatedTime(message.createdTime)}>
              <div className="message-attachments">
                { displayMessageAttachment(message.type, message.files) }
              </div>
            </Tooltip>
          : null
        }
        <div className="member-readed-message">
          { isLatestMessage(message._id) && displayMemberReaded(message, isMe(message.user._id), numberOfMember, isMe) }
        </div>
        {/* { !message.error && <small className="item-message-created-time">{customCreatedTime(message.createdTime)}</small> } */}
      </div>
    </div>
  )
}

export default Message