import React, { Component } from "react"
import axios from "axios"
import Login from "../../components/Auth/Login"
import { notification } from "antd"
import "antd/dist/antd.css"
import { connect } from "react-redux"
import { setCurrentUser } from "../../actions/auth"

class LoginContainer extends Component {
  state = {
    auth: {
      email: null,
      password: null
    },
    loading: false
  }

  pushNotifycation = (type, message) => {
    notification[type]({ message })
  }

  actions = {
    handleChange: event => {
      const { id, value } = event.target
      let { auth } = this.state

      auth[id] = value

      this.setState({ auth })
    },
    handleLogin: async () => {
      const { auth } = this.state

      this.setState({ loading: true })

      await axios.post("/api/v1/auth/login", auth)
        .then(response => {
          this.setState({ loading: false })
          localStorage.tokenJWT = response.data.tokenJWT
          this.props.setCurrentUser(response.data.tokenJWT)
          this.props.history.push("/")
        }, error => {
          let message = "Đăng nhập không thành công"

          if(error.response.data.message) {
            message = error.response.data.message
          }

          this.pushNotifycation("error", message)
          this.setState({ loading: false })
        })
        .catch(error => {
          console.log(error)
          this.pushNotifycation("error", "Đăng nhập không thành công")
          this.setState({ loading: false })
        })
    }
  }

  render() {
    const { auth, loading } = this.state
    return (
      <Login 
        actions={this.actions}
        loading={loading}
        auth={auth}
      />
    )
  }
}

export default connect(null, { setCurrentUser })(LoginContainer)