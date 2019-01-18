const initialState = {
  online: [],
  filter: null
}


export default (state = initialState, action) => {
  switch (action.type) {
    case "FRIENDS_INIT_FRIENDS_ONLINE":
      state = {
        ...state,
        online: action.friendsOnline
      }
      break    
    default: break
  }
  return state
}
