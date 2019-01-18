import { combineReducers } from "redux"
import group from "./group"
import auth from "./auth"
import groups from "./groups"
import friends from "./friends"

export default combineReducers({
  group,
  auth,
  groups,
  friends
})