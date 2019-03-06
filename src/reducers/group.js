export default (state = { members: [] }, action) => {
  switch(action.type) {
    case "SET_CURRENT_GROUP":
      state = { ...action.payload.group }
      break
    case "ADD_MEMBERS_CURRENT_GROUP":
      state = {
        ...state,
        members: [...state.members, ...action.members]        
      }
      break
    case "DELETE_MEMBER_CURRENT_GROUP":
      state = {
        ...state,
        members: [...state.members].filter(member => member._id !== action.deleteMemberId)
      }

      if(state.members.length === 0) {
        state = {}
      }
      break
    default: break
  }
  return state
}