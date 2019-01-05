import React from "react"

function Header(props) {

  const { actions } = props

  return (
    <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Mesage</a>
      <ul className="navbar-nav px-3">
        <li className="nav-item text-nowrap">
          <span style={{ cursor: "pointer" }} className="nav-link" onClick={ actions.handleLogout }>Đăng xuất</span>
        </li>
      </ul>
    </nav>
  )
}

export default Header