import mongoose from "mongoose"

const Schema = mongoose.Schema

const GroupSchema = new Schema({
  members: [
    { type: Schema.Types.ObjectId, ref: "User" }
  ],
  avatar: String,
  name: String,
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  updatedTime: { type: Number, default: Date.now() }
})

export default mongoose.model("Group", GroupSchema)