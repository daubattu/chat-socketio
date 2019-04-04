import React from "react"
import { Menu, Dropdown, Icon } from 'antd';
import { Link } from "react-router-dom"

function Header(props) {

  const { actions, user } = props

  const menu = (
    <Menu>
      <Menu.Item key="0">
        <Link to="/auth/change-password">Đổi mật khẩu</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1">
        <span style={{ cursor: "pointer" }} onClick={actions.handleLogout}>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

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
          <Dropdown overlay={menu} trigger={['click']}>
            <span className="nav-link">
              <Icon style={{ cursor: "pointer" }} type="bars" />
            </span>
          </Dropdown>
        </li>
      </ul>
    </nav>
  )
}

export default Header