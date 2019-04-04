import React from "react"

function ChangePassword(props) {
  const { actions, auth, loading } = props
  return (
    <div className="login-page">
      <form className="form-login">
        <img className="mb-4" src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
        <h1 className="text-center h3 mb-3 font-weight-normal">Đổi mật khẩu</h1>
        <input value={ auth.oldPassword || "" } style={{ marginBottom: "5px" }} id="oldPassword" onChange={actions.handleChange} type="password" className="form-control" placeholder="Mật khẩu cũ" autoFocus />
        <input value={ auth.newPassword || "" } style={{ marginBottom: "10px" }} id="newPassword" onChange={actions.handleChange} type="password" className="form-control" placeholder="Mật khẩu mới" />
        <input value={ auth.confirmNewPassword || "" } style={{ marginBottom: "10px" }} id="confirmNewPassword" onChange={actions.handleChange} type="password" className="form-control" placeholder="Xác nhận mật khẩu mới" />
        <button disabled={ loading } onClick={ actions.handleChangePassword } className="btn btn-lg btn-primary btn-block" type="submit">
          { loading && <i style={{ marginRight: "5px" }} className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> } 
          Xác nhận
        </button>
        <p className="text-center mt-5 mb-3 text-muted">&copy; 2019-2020</p>
      </form>
    </div>
  )
}

export default ChangePassword