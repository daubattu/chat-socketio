import React from "react"
import { Upload, Button, Icon } from "antd"

function Signup(props) {
  const { actions, auth, loading } = props

  const propsOfUpload = {
    onRemove: () => {
      actions.handleChange("avatar", null)
    },
    beforeUpload: avatar => {
      actions.handleChange("avatar", avatar)
      return false;
    },
    fileList: auth.avatar ? [auth.avatar] : [],
  };

  return (
    <div className="login-page">
      <form 
        onSubmit={ actions.handleSignup }
        className="form-login">
        <img className="mb-4" src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
        <h1 className="text-center h3 mb-3 font-weight-normal">Đăng ký</h1>
        <input value={auth.email || ""} style={{ marginBottom: "5px" }} id="email" onChange={event => actions.handleChange(event.target.id, event.target.value)} className="form-control" placeholder="Email" autoFocus />
        <input value={auth.name || ""} style={{ marginBottom: "5px" }} id="name" onChange={event => actions.handleChange(event.target.id, event.target.value)} type="text" className="form-control" placeholder="Tên" />
        <input value={auth.password || ""} style={{ marginBottom: "10px" }} id="password" onChange={event => actions.handleChange(event.target.id, event.target.value)} type="password" className="form-control" placeholder="Mật khẩu" />
        <input value={auth.confirmPassword || ""} style={{ marginBottom: "10px" }} id="confirmPassword" onChange={event => actions.handleChange(event.target.id, event.target.value)} type="password" className="form-control" placeholder="Xác nhận mật khẩu" />
        <Upload {...propsOfUpload}>
          <Button>
            <Icon type="upload" /> Chọn avatar
          </Button>
        </Upload>
        <button 
          style={{ marginTop: "10px" }}
          disabled={loading}
          // onClick={ actions.handleSignup } 
          className="btn btn-lg btn-primary btn-block" type="submit">
          {loading && <i style={{ marginRight: "5px" }} className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i>}
          Đăng ký
        </button>
        <p className="text-center mt-5 mb-3 text-muted">&copy; 2019-2020</p>
      </form>
    </div>
  )
}

export default Signup