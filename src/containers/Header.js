import React, { Component } from "react"
import Header from "../components/Header";
import { connect } from "react-redux"
import { handleLogOut } from "../actions/auth"
import axios from "axios"

class HeaderContainer extends Component {
  actions = {
    handleLogout: () => {
      axios.get("/api/v1/auth/logout")
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