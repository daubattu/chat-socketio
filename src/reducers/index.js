import { combineReducers } from "redux"
import group from "./group"
import auth from "./auth"

export default combineReducers({
  group,
  auth
})