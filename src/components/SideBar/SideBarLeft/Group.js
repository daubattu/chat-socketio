import React, { Fragment } from "react"

function Group(props) {
  const { group, setCurrentGroup } = props
  return (
    <div className="group">
      <b className="group-name" onClick={() => setCurrentGroup(group)}>{ group.name }</b>
    </div>
  )
}

export default Group