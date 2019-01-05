import React, { Component, Fragment } from "react"
import socketIOClient from "socket.io-client"

import { notification } from "antd"
import "antd/dist/antd.css"

import SideBarLeft from "../containers/Sidebar/SideBarLeft"
import SideBarRight from "./SideBar/SideBarRight"
import Chat from "../containers/Chat"
import Header from "../containers/Header"

class Home extends Component {
  componentDidMount() {
    const socket = socketIOClient("http://localhost:3000")

    socket.emit("my other event", "Hello world")
  }

  pushNotifycation = (type, message) => {
    notification[type]({ message })
  }

  render() {
    const { history } = this.props

    return (
      <Fragment>
        <Header history={history} pushNotifycation={this.pushNotifycation} />
        <div className="container-fluid">
          <div className="row">
            <SideBarLeft pushNotifycation={this.pushNotifycation} />
            <Chat pushNotifycation={this.pushNotifycation} />
            <SideBarRight />
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Home