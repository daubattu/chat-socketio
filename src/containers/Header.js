import React, { Component } from "react"
import Header from "../components/Header";
import { connect } from "react-redux"
import { handleLogOut } from "../actions/auth"

class HeaderContainer extends Component {
  actions = {
    handleLogout: () => {
      localStorage.removeItem("tokenJWT")
      this.props.handleLogOut()
      this.props.history.push("/auth/login")
    }
  }
  render() {
    const { auth } = this.props
    return (
      <Header 
        user={auth ? auth.user : {}}
        actions={this.actions}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth
  }
}
export default connect(mapStateToProps, { handleLogOut })(HeaderContainer)