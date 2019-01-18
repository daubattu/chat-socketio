import React from "react"
import Friends from "./Friends";

function SideBarRight(props) {
  const { friends } = props
  
  return (
    <div className="col-md-2">
      <div className="pt-3">
        <h2>Online</h2>
      </div>
      <Friends friends={friends} />
    </div>
  )
}

export default SideBarRight