import React from "react"
import Friend from "./Friend"

function Friends(props) {
  const { friends } = props

  if (!friends) return null

  return (
    <div className="list-friends">
      {
        friends.map((friend, index) => {
          return <Friend key={ friend._id || index } friend={friend} />
        })
      }
    </div>
  )
}

export default Friends