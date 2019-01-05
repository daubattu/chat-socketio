import React from "react"

function Login(props) {
  const { actions, auth, loading } = props
  return (
    <div className="login-page">
      <form className="form-login">
        <img className="mb-4" src="https://getbootstrap.com/docs/4.0/assets/brand/bootstrap-solid.svg" alt="" width="72" height="72" />
        <h1 className="text-center h3 mb-3 font-weight-normal">Đăng nhập</h1>
        <input value={ auth.email || "" } style={{ marginBottom: "5px" }} id="email" onChange={actions.handleChange} type="email" className="form-control" placeholder="Email" required autoFocus />
        <input value={ auth.password || "" } style={{ marginBottom: "10px" }} id="password" onChange={actions.handleChange} type="password" className="form-control" placeholder="Mật khẩu" required />
        <button disabled={ loading } onClick={ actions.handleLogin } className="btn btn-lg btn-primary btn-block" type="submit">
          { loading && <i style={{ marginRight: "5px" }} className="fa fa-circle-o-notch fa-spin" aria-hidden="true"></i> } 
          Đăng nhập
        </button>
        <p className="text-center mt-5 mb-3 text-muted">&copy; 2019-2020</p>
      </form>
    </div>
  )
}

export default Login