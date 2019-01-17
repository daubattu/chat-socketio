import mongoose from "mongoose"

const Schema = mongoose.Schema

const UserFriendSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  friend: { type: Schema.Types.ObjectId, ref: "User" }
})

export default mongoose.model("UserFriend", UserFriendSchema)