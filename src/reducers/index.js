import { combineReducers } from "redux"
import group from "./group"
import auth from "./auth"
import groups from "./groups"

export default combineReducers({
  group,
  auth,
  groups
})