import React, { Component, Fragment } from "react"
import "./App.css"
import socketIOClient from "socket.io-client"


class App extends Component {
  componentDidMount() {
    const socket = socketIOClient("http://localhost:3000")

    socket.emit("my other event", "Hello world")
  }
  render() {
    return (
      <Fragment>
        <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Mesage</a>
          {/* <input className="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search" /> */}
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap">
              <a className="nav-link" href="#">Sign out</a>
            </li>
          </ul>
        </nav>

        <div className="container-fluid">
          <div className="row">
            <nav className="col-md-3 bg-light sidebar">
              <div className="sidebar-sticky">
              <div className="pt-3 px-4">
                <h2>#sidebar</h2>            
              </div>
              </div>
            </nav>

            <main role="main" className="col-md-7 ml-sm-auto pt-3 px-4 border-right" style={{ height: "calc(100vh - 48px)" }}>
              <h2>#main</h2>
            </main>
            <div className="col-md-2 pt-3 px-4">
            <h2>#configs</h2>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

export default App