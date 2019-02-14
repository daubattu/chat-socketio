import React, { Fragment } from "react"

function customCreatedTime(createdTime) {
  return `${new Date(createdTime).toLocaleTimeString()} - ${new Date(createdTime).toLocaleDateString()}`
}

function customGroupAvatar(currentUser, members) {
  let users = [], online = false
  members = members.filter(member => {
    if(member._id !== currentUser._id && users.indexOf(member._id) === -1) {
      if(member.online) online = true
      users.push(member._id)
      return members
    }
  })

  members = members.slice(0, 4)

  const styleOfStatusGroup = { 
    width: "10px",
    position: "absolute",
    bottom: 0,
    zIndex: 1,
    transform: "translate(-50%, 50%)",
    height: "10px",
    border: "1px solid #fff",
    borderRadius: "50%",
    backgroundColor: online ? "green" : "red",
  }

  return (
    <div className={"group-avatar group-avatar-" + (members.length < 4 ? members.length + 1 : "n")}>
      <div style={ styleOfStatusGroup }></div>
      {
        members.map((member, index) => {
          return (
            <img id={member._id} key={member._id || index} src={member.avatar} />
          )
        })
      }
    </div>
  )
}

function displayMemberReaded(message) {
  let readedByText = ""
  if(message.memberReaded) {
    for(let memberReaded of message.memberReaded) {
      if(memberReaded !== message.user._id) {
        readedByText += readedByText === "" ? memberReaded : `, ${memberReaded}`
      }
    }

    if(readedByText !== "") {
      return <small><i style={{ color: "green", marginLeft: "5px" }} className="fa fa-check-circle-o" aria-hidden="true"></i></small>
    }
    
    return null
  } else return null
}

function customLastMessage(message) {
  if(message.type === "text") {
    return message.content ? message.content.slice(0, 30) : ""
  } else {
    if(message.type === "image") {
      return (
        <Fragment>
          Đã gửi { message.files.length } bức ảnh <i className="fa fa-picture-o" />
        </Fragment>
      )
    } else if (message.type === "video") {
      return (
        <Fragment>
          Đã gửi { message.files.length } video <i className="fa fa-video-camera" />
        </Fragment>
      )
    } else if (message.type === "file") {
      return (
        <Fragment>
          Đã gửi { message.files.length } file đính kèm <b><i className="fa fa-paperclip" /></b>
        </Fragment>
      )
    } else {
      return "Đã gửi 1 thứ gì đó hay ho"
    }
  }
}

function Group(props) {
  const { group, setCurrentGroup, isMe, currentUser } = props

  return (
    <div className={ group.numberOfMessagesUnReaded !== 0 ? "group has-new-message px-4" : "group px-4" }>
      {customGroupAvatar(currentUser, group.members)}
      <div className="group-detail">
        <b className="group-name" onClick={() => setCurrentGroup(group)}>{group.name} { group.numberOfMessagesUnReaded !== 0 && <span style={{ color: "red" }}>({group.numberOfMessagesUnReaded})</span>}</b>
        {
          group.lastMessage
          &&
          <div>
            <div className="group-last-message">
              <small style={{ maxWidth: "80%", overflow: "hidden" }}>
                { isMe(group.lastMessage.user._id) && "You: " }
                { customLastMessage(group.lastMessage) }
                { isMe(group.lastMessage.user._id) && displayMemberReaded(group.lastMessage) }
              </small>
              {
                !isMe(group.lastMessage.user._id)
                &&
                <img src={group.lastMessage.user.avatar} style={{ height: "20px" }} />
              }
            </div>
            <small style={{ textAlign: "right", width: "100%", display: "inline-block" }}>{customCreatedTime(group.lastMessage.createdTime)}</small>
          </div>
        }
      </div>
    </div>
  )
}

export default Group