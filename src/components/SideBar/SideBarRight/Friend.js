import React from "react"

const styles = {
  avatar: {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    marginRight: "5px"
  },
  status: {
    width: "5px",
    height: "5px",
    borderRadius: "50%"
  }
}

function Friend(props) {
  const { friend } = props

  return (
    <div className="item-list-friends" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="item-list-friends-info">
        <img src={friend.avatar} style={styles.avatar} />
        <b>{ friend.name }</b>
      </div>
      <div className="item-list-friends-status">
        <div style={{ ...styles.status, background: friend.online ? "green" : "red" }}></div>
      </div>
    </div>
  )
}

export default Friend