import React, { Fragment } from "react"
import { Icon } from "antd"

function RefMessage(props) {
  const { message, setRefMessage } = props

  return (
    <div className="ref-message">
      <div className="ref-message-quote-content">
        <i className="fa fa-quote-left" aria-hidden="true"></i>
        <div style={{ paddingTop: "3px", color: "#ccc", whiteSpace: "pre" }}>
          { message.content }
        </div>
      </div>
      <div className="ref-message-icon-remove">
        <Icon onClick={() => setRefMessage(null)} type="close-square" />
      </div>
    </div>
  )
}

export default RefMessage