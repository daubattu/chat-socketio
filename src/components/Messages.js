import React, { Fragment } from "react"
import Message from "./Message";

function Messages(props) {
  const { messages, isMe, setRefMessage, isLatestMessage, isPrivateGroup, numberOfMember } = props
  return (
    <div className="list-messages" style={{ marginTop: "10px" }}>
      {
        messages
        &&
        <Fragment>
          {
            messages.map((message, index) => {
              return (
                <Message key={message._id || index} isPrivateGroup={isPrivateGroup} setRefMessage={setRefMessage} message={message} numberOfMember={numberOfMember} isLatestMessage={isLatestMessage} isMe={isMe} />
              )
            })
          }
        </Fragment>
      }
    </div>
  )
}

export default Messages