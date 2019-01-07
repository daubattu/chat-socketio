import mongoose from "mongoose"

const Schema = mongoose.Schema

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  createdTime: { type: Number, default: Date.now() },
  membersReaded: [
    { type: Schema.Types.ObjectId, ref: "User" }
  ],
  type: String,
  content: String,
  content_url: String
})

export default mongoose.model("Message", MessageSchema)