import React from "react"
import moment from "moment"

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

function customLatestTimeConnection(latestTimeConnection) {
  return <small>{new Date(latestTimeConnection).toLocaleTimeString()} - {new Date(latestTimeConnection).toLocaleDateString()}</small>
}

function Friend(props) {
  const { friend, setCurrentGroup } = props

  return (
    <div onClick={() => setCurrentGroup(friend.group)} className="item-list-friends" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div className="item-list-friends-info">
        <img src={friend.avatar} style={styles.avatar} />
        <b>{ friend.name }</b>
      </div>
      <div className="item-list-friends-status">
        {
          friend.online
          ? <div style={{ ...styles.status, background: "green" }}></div>
          : (friend.latestTimeConnection ? customLatestTimeConnection(friend.latestTimeConnection) : <div style={{ ...styles.status, background: "red" }}></div>) 
        }
      </div>
    </div>
  )
}

export default Friend