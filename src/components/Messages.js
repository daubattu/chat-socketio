import React, { Fragment } from "react"
import Message from "./Message";

function Messages(props) {
  const { messages, isMe } = props
  return (
    <div className="list-messages" style={{ marginTop: "10px" }}>
      {
        messages
        &&
        <Fragment>
          { 
            messages.map((message, index) => {
            return (
              <Message key={message._id || index} message={message} isMe={isMe} />
            )
          })
          }
        </Fragment>
      }
    </div>
  )
}

export default Messages