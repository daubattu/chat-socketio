import React, { Fragment } from "react"
import Group from "./Group"

function Groups(props) {
  const { groups, setCurrentGroup } = props
  return (
    <Fragment>
      {
        groups.map((group, index) => {
          return (
            <Group key={ group._id || index } group={group} setCurrentGroup={setCurrentGroup} />
          )
        })
      }
    </Fragment>
  )
}

export default Groups