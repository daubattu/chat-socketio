import React from "react"

function Header(props) {

  const { actions, user } = props

  return (
    <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Mesage</a>
      <ul className="navbar-nav ml-auto px-3" style={{ display: "flex", flexDirection: "row" }}>
        <li className="nav-item" style={{ marginRight: "15px" }}>
          <span className="nav-link">
            <img src={ user.avatar } style={{ height: "20px" }} /> { user.name }
          </span>
        </li>
        <li className="nav-item text-nowrap">
          <span style={{ cursor: "pointer" }} className="nav-link" onClick={actions.handleLogout}>Đăng xuất</span>
        </li>
      </ul>
    </nav>
  )
}

export default Header