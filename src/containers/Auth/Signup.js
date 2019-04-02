import React, { Component, Fragment } from "react"
import Signup from "../../components/Auth/Signup"
import axios from "axios"
import { message } from "antd"

class SignupContainer extends Component {
  state = {
    auth: {
      email: null,
      password: null,
      confirmPassword: null,
      avatar: null
    },
    loading: false,
    avatarBase64: null
  }

  pushNotifycation = (type, message) => {
    notification[type]({ message })
  }

  isValidEmail = email => {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }

  isValid = () => {
    const props = ["email", "name", "password", "confirmPassword", "avatar"]

    let auth = { ...this.state.auth }

    for(let prop of props) {
      if(!auth[prop]) {
        message.error("Chưa nhập đủ thông tin")
        return false
      }

      if(prop === "email") {
        if(!this.isValidEmail(auth[prop])) {
          message.error("Email không đúng định dạng")
          return false
        }
      } else if (prop === "password") {
        if(auth[prop].length < 7) {
          message.error("Mật khẩu phải dài hơn 6 ký tự")
          return false
        }
        if(auth[prop].includes(" ")) {
          message.error("Mật khẩu không được chứa khoảng trắng")
          return false
        }
      } else if (prop === "confirmPassword") {
        if(auth.password !== auth[prop]) {
          message.error("Mật khẩu xác nhận không khớp")
          return false
        }
      }
    }

    return true
  }

  actions = {
    handleChange: (field, value) => {
      let auth = { ...this.state.auth }
      if(field === "avatar") {
        let reader = new FileReader()
        auth[field] = value

        reader.onload = event => {
          console.log(event.target.result)
          this.setState({ auth, avatarBase64: event.target.result })
        }
        
        reader.readAsDataURL(value)
      } else {
        auth[field] = value

        this.setState({ auth })
      }
    },
    handleSignup: async (event) => {
      event.preventDefault()
      
      let auth = {...this.state.auth}

      if(this.isValid()) {
        auth.avatar = this.state.avatarBase64
        this.setState({ loading: true })

        await axios.post("/api/v1/auth/signup", { ...auth })
          .then(() => {
            let auth = {
              email: null,
              password: null,
              confirmPassword: null,
              avatar: null
            }
            let avatarBase64 = null
            this.setState({ auth, avatarBase64 })
            message.success("Đăng ký thành công")
            setTimeout(() => {
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
            message.error("Đăng ký không thành công")
            this.setState({ loading: false })
          })
        
        this.setState({ loading: false })
      }
    }
  }

  render() {
    const { auth, loading } = this.state
    return (
      <Signup
        actions={this.actions}
        loading={loading}
        auth={auth}
      />
    )
  }
}

export default SignupContainer