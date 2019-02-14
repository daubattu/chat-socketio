import React from "react"
import Friends from "./Friends";

function SideBarRight(props) {
  const { friends, setCurrentGroup } = props
  
  return (
    <div className="col-md-3">
      <div className="pt-3">
        <h2>Online</h2>
      </div>
      <Friends setCurrentGroup={setCurrentGroup} friends={friends} />
    </div>
  )
}

export default SideBarRight