export default (state = {}, action) => {
  switch(action.type) {
    case "SET_CURRENT_GROUP":
      state = action.payload.group
      break
    default: break
  }
  return state
}