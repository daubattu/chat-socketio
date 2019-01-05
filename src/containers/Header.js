import React, { Component } from "react"
import Header from "../components/Header";

class HeaderContainer extends Component {
  actions = {
    handleLogout: () => {
      localStorage.removeItem("tokenJWT")
      this.props.history.push("/auth/login")
    }
  }
  render() {
    return (
      <Header 
        actions={this.actions}
      />
    )
  }
}

export default HeaderContainer