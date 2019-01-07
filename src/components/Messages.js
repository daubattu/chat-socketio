import React, { Fragment } from "react"
import Message from "./Message";

function Messages(props) {
  const { messages } = props
  return (
    <div className="list-messages">
      {
        messages
        &&
        <Fragment>
          { 
            messages.map((message, index) => {
            return (
              <Message key={message._id || index} message={message} />
            )
          })
          }
        </Fragment>
      }
    </div>
  )
}

export default Messages