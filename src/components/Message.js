import React, { Fragment } from "react"
import { Tooltip, Icon, Menu, Dropdown } from "antd"

function customCreatedTime(createdTime) {
  return `${new Date(createdTime).toLocaleTimeString()} - ${new Date(createdTime).toLocaleDateString()}`
}

function displayMessageAttachment(type, files, isMe) {
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
              <a key={index} style={{ display: "inline-block", position: "relative", cursor: "pointer", maxHeight: "100px", float: isMe && "right" }} href={file.originalSrc} data-lity>
                <img onError={event => event.target.src = "/images/404.jpg"} src={file.thumbnailSrc} className="message-attachments-item video" />
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
            if(!file.name) return null
            return (
              <a download key={index} href={file.originalSrc}>
                {
                  isMe
                  ? <Fragment><i className="fa fa-paperclip" aria-hidden="true"></i> { file.name }</Fragment>
                  : <Fragment>{ file.name } <i className="fa fa-paperclip" aria-hidden="true"></i></Fragment>
                }
              </a>
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

function renderRefMessage(refMessage, isPrivateGroup) {
  if (!refMessage) return null

  return (
    <div className="quote-message-sended">
      <div className="quote-message-sended-main">
        <i className="fa fa-quote-left" aria-hidden="true"></i>
        <div className="quote-message-sended-content">
          {refMessage.content}
        </div>
      </div>
      <div>
        <Icon type="user" /> {refMessage.user.name} | <Icon type="clock-circle" /> {customCreatedTime(refMessage.createdTime)}
      </div>
    </div>
  )
}

function Message(props) {
  const { message, isMe, setRefMessage, isLatestMessage, isPrivateGroup, numberOfMember } = props

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <span onClick={() => setRefMessage(message)}>Trích dẫn</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <div id={message._id} className={isMe(message.user._id) ? "item-message me" : "item-message"}>
      <div style={{ display: "flex" }}>
        {!isMe(message.user._id) && <img src={message.user.avatar} style={{ height: "30px", width: "30px", marginRight: "5px" }} />}
        <div style={{ textAlign: "left" }}>
          <div className="item-message-created-time">{customCreatedTime(message.createdTime)}</div>
          {
            message.content || message.type === "map"
              ? <span className={message.error ? "item-message-content error" : "item-message-content"}>
                {renderRefMessage(message.ref, isPrivateGroup)}
                {
                  message.type === "map"
                    ? "định dạng tin nhắn này chưa được hỗ trợ trên web"
                    : message.content
                }
              </span>
              : null
          }
          {
            message.files && message.files.length !== 0
              ? <div className="message-attachments">
                  {displayMessageAttachment(message.type, message.files, isMe(message.user._id))}
                </div>
              : null
          }
          <div className="member-readed-message">
            {isLatestMessage(message._id) && displayMemberReaded(message, isMe(message.user._id), numberOfMember, isMe)}
          </div>
        </div>
      </div>
      {
        !isMe(message.user._id) && message.type === "text"
          ? <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
              <Icon className="icon-option-message" type="down-square" />
            </Dropdown>
          : null
      }
    </div>
  )
}

export default Message