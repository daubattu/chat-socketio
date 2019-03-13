import React, { Fragment } from "react"
import Message from "./Message";

function renderMemberTyping(members) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {
        members.map((member, index) => {
          return (
            <img key={member._id || index} src={member.avatar} style={{ height: "30px", width: "30px", marginRight: "5px" }} />
          )
        })
      }
      <img style={{ clear: "both", display: "block", height: "20px", borderRadius: 0 }} src="/images/typing.gif" />
    </div>
  )
}

function Messages(props) {
  const { messages, isMe, isLatestMessage, membersTyping, numberOfMember, messageSelected, setMessageSelected } = props
  return (
    <div className="list-messages" style={{ marginTop: "10px" }}>
      {
        messages
        &&
        <Fragment>
          {
            messages.map((message, index) => {
              return (
                <Message key={message._id || index} setMessageSelected={setMessageSelected} messageSelected={messageSelected} message={message} numberOfMember={numberOfMember} isLatestMessage={isLatestMessage} isMe={isMe} />
              )
            })
          }
        </Fragment>
      }
      {
        membersTyping && membersTyping.length !== 0
          ? <div className="item-message">{renderMemberTyping(membersTyping)}</div>
          : null
      }
    </div>
  )
}

export default Messages