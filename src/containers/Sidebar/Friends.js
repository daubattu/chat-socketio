import React, { Fragment } from "react"
import Friend from "./Friend"

function Friends(props) {
  const { friends, actions, remove } = props

  return (
    <div style={{ marginRight: "10px" }}>
      {
        friends.map((friend, index) => {
          return (
            <Friend actions={actions} key={friend._id || index} remove={remove} friend={friend} />
          )
        })
      }
    </div>
  )
}

export default Friends