import React, { Fragment } from "react"
import { Checkbox, Icon } from "antd"

function Friend(props) {
  const { friend, actions, remove } = props
  return (
    <div className="item-friend-in-modal-make-new-group" style={{ marginBottom: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div onClick={() => actions.handleChangeNewGroup("members", friend._id, friend)} style={{ flexGrow: "1" }}>
        <img src={friend.avatar} style={{ height: "40px", width: "40px", marginRight: "5px" }} />
        <b>{friend.name || friend.username}</b>
      </div>
      <div>
        {
          remove
          ? <Icon onClick={() => actions.handleChangeNewGroup("members", friend._id, friend)} type="delete" />
          : <Checkbox checked={actions.isChecked(friend._id) !== -1} onChange={() => actions.handleChangeNewGroup("members", friend._id, friend)} />
        }
      </div>
    </div>
  )
}

export default Friend