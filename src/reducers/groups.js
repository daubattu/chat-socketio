export default (state = [], action) => {
  switch(action.type) {
    case "GROUPS_INIT_GROUPS":
      state = action.groups
      break
    default: break
  }
  return state
}
