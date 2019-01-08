import React, { Fragment } from "react"
import Group from "./Group"

function Groups(props) {
  const { groups, setCurrentGroup, isMe, currentUser } = props
  return (
    <Fragment>
      {
        groups.map((group, index) => {
          return (
            <Group key={ group._id || index } currentUser={currentUser} isMe={isMe} group={group} setCurrentGroup={setCurrentGroup} />
          )
        })
      }
    </Fragment>
  )
}

export default Groups