let initialState = {
  isAuthenticated: false,
  user: {}
}

function isAuthenticated(user) {
  if(user._id) 
    return true
  return false
}

export default (state = initialState, action = {}) => {
  switch(action.type) {
    case "AUTH_SET_CURRENT_USER":
      return {
        isAuthenticated: isAuthenticated(action.user),
        user: action.user
      }
    case "AUTH_USER_LOG_OUT":
      return {
        isAuthenticated: false,
        user: {}
      }
    default: 
      return state
  }
}