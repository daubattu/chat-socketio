export default (state = [], action) => {
  switch (action.type) {
    case "GROUPS_INIT_GROUPS":
      state = action.groups
      break      
    case "GROUPS_UPDATE_GROUP":
      for (let i = 0; i < state.length; i++) {
        if (state[i]._id === action.group._id) {
          state.splice(i, 1)
          state = [action.group, ...state]
          break
        }
      }
      break
    case "GROUPS_UPDATE_GROUP_BY_ID":
      for (let i = 0; i < state.length; i++) {
        if (state[i]._id === action.groupId) {
          state.splice(i, 1)
          state = [action.group, ...state]
          break
        }
      }
      break
    case "GROUPS_ADD_NEW_GROUP":
      if (state.length === 0) {
        state = [action.group]
      } else {
        if (state.length === 10) {
          state.splice(9, 1)
        }
        state = [action.group, ...state]
      }
      break
    default: break
  }
  return state
}
