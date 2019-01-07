import React, { Fragment } from "react"

function Message(props) {
  const { message } = props
  
  return (
    <div className="item-message">
      {message.content}
    </div>
  )
}

export default Message