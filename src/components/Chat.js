import React, { Fragment } from "react"

function Chat(props) {
  const { group, actions } = props
  return (
    <Fragment>
      {
        group._id
        &&
        <div>
          <h2>{group.name}</h2> 
          <span onClick={() => actions.changeStatusModal("listMembers")} style={{ cursor: "pointer" }}>{group.members.length} thành viên</span>
        </div>
      }
    </Fragment>
  )
}

export default Chat