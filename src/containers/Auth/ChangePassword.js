import React, { Component, Fragment } from "react"
import ChangePassword from "../../components/Auth/ChangePassword"
import axios from "axios"
import { message } from "antd"
import { handleLogOut } from "../../actions/auth"
import { connect } from "react-redux"
import { setCurrentGroup } from "../../actions/group"

class ChangePasswordContainer extends Component {
  state = {
    auth: {
      oldPassword: null,
      newPassword: null,
      confirmNewPassword: null
    },
    loading: false
  }

  isValid = () => {
    const props = ["oldPassword", "newPassword", "confirmNewPassword"]

    let auth = { ...this.state.auth }

    for(let prop of props) {
      if(!auth[prop]) {
        message.error("Chưa nhập đủ thông tin")
        return false
      }

      if (prop === "newPassword") {
        if(auth[prop].length < 7) {
          message.error("Mật khẩu phải dài hơn 6 ký tự")
          return false
        }
        if(auth[prop].includes(" ")) {
          message.error("Mật khẩu không được chứa khoảng trắng")
          return false
        }

        if(auth[prop] === auth.oldPassword) {
          message.error("Mật khẩu mới không được trùng với mật khẩu cũ")
          return false
        }
      } else if (prop === "confirmNewPassword") {
        if(auth.newPassword !== auth[prop]) {
          message.error("Mật khẩu xác nhận không khớp")
          return false
        }
      }
    }

    return true
  }

  actions = {
    handleChange: (event) => {
      let auth = { ...this.state.auth }
      console.log(event.target.value)
      auth[event.target.id] = event.target.value
      this.setState({ auth })
    },
    handleChangePassword: async (event) => {
      event.preventDefault()
      
      let auth = {...this.state.auth}

      if(this.isValid()) {
        this.setState({ loading: true })

        await axios.post("/api/v1/auth/change-password", { ...auth })
          .then(() => {
            message.success("Đổi mật khẩu thành công")
            setTimeout(() => {
              this.props.handleLogOut()
              this.props.setCurrentGroup({})
              this.props.history.push("/auth/login")
            }, 1000)
          }, error => {
            if(error.response.data) {
              console.log(error.response.data)
              message.error(error.response.data.message)
            }
          })
          .catch(error => {
            console.log(error)
            message.error("Đổi mật khẩu không thành công")
            this.setState({ loading: false })
          })
        
        this.setState({ loading: false })
      }
    }
  }

  render() {
    const { auth, loading } = this.state
    return (
      <ChangePassword
        actions={this.actions}
        loading={loading}
        auth={auth}
      />
    )
  }
}

export default connect(null, { handleLogOut, setCurrentGroup })(ChangePasswordContainer)