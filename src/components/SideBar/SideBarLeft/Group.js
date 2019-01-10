import React, { Fragment } from "react"

function customCreatedTime(createdTime) {
  return `${new Date(createdTime).toLocaleTimeString()} - ${new Date(createdTime).toLocaleDateString()}`
}

function customGroupAvatar(currentUser, members) {
  let users = []
  members = members.filter(member => {
    if(member._id !== currentUser._id && users.indexOf(member._id) === -1) {
      users.push(member._id)
      return members
    }
  })

  members = members.slice(0, 4)

  return (
    <div className={"group-avatar group-avatar-" + (members.length < 4 ? members.length + 1 : "n")}>
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

function Group(props) {
  const { group, setCurrentGroup, isMe, currentUser } = props

  return (
    <div className="group">
      {customGroupAvatar(currentUser, group.members)}
      <div className="group-detail">
        <b className="group-name" onClick={() => setCurrentGroup(group)}>{group.name}</b>
        {
          group.lastMessage
          &&
          <div>
            <div className="group-last-message">
              <small style={{ maxWidth: "80%", overflow: "hidden" }}>
                {isMe(group.lastMessage.user._id) && "You: "}
                {group.lastMessage.type === "text" && group.lastMessage.content.slice(0, 30)}
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