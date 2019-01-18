const initialState = {
  all: [],
  filter: null
}


export default (state = initialState, action) => {
  switch (action.type) {
    case "FRIENDS_INIT_FRIENDS_ALL":
      state = {
        ...state,
        all: action.friends
      }
      break    
    case "FRIENDS_UPDATE_FRIEND":
      let indexOfFriend = -1
      for (let i = 0; i < state.all.length; i++) {
        if (state.all[i]._id === action.friend._id) {
          indexOfFriend = i
          break
        }
      }

      if(indexOfFriend !== -1) {
        state.all.splice(indexOfFriend, 1)
        if(action.friend.online) {
          state = {
            ...state,
            all: [action.friend, ...state.all]
          }
        } else {
          state = {
            ...state,
            all: [...state.all, action.friend]
          }
        }
      }
      break
    default: break
  }
  return state
}
