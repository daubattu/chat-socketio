function findIndexById(groups, groupId) {
  let index = -1
  for (let i = 0; i < groups.length; i++) {
    if (groups[i]._id === groupId) {
      index = i
      break
    }
  }
  return index
}

export default (state = [], action) => {
  switch (action.type) {
    case "GROUPS_INIT_GROUPS":
      state = action.groups
      break      
    case "GROUPS_UPDATE_GROUP":
      if(findIndexById(state, action.group._id) !== -1) {
        if(action.changePosition) {
          state.splice(findIndexById(state, action.group._id), 1)
          state = [action.group, ...state]
        } else {
          let stateTemp = [...state]
          stateTemp[findIndexById(state, action.group._id)] = action.group
          state = [...stateTemp]
        }
      } else {
        state = [action.group, ...state]
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
    case "GROUPS_DELETE_GROUP":
      if(findIndexById(state, action.groupId) !== -1) {
        console.log("findIndexById(state, action.groupId) !== -1", findIndexById(state, action.groupId) !== -1)
        // state.splice(findIndexById(state, action.groupId), 1)
        state = [...state].filter(g => g._id !== action.groupId)
      }
      break
    default: break
  }
  return state
}
