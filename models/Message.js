import mongoose from "mongoose"

const Schema = mongoose.Schema

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  createdTime: { type: Number, default: Date.now()},
  memberReaded: [
    { type: Schema.Types.ObjectId, ref: "User" }
  ],
  type: { type: String, default: "text" }, // image || video || file || voice
  content: String,
  files: [{
    originalSrc: String,
    thumbnailSrc: String,
    width: Number,
    height: Number,
    duration: Number
  }]
})

export default mongoose.model("Message", MessageSchema)