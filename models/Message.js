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
    name: String,
    originalSrc: String,
    thumbnailSrc: String,
    width: Number,
    height: Number,
    duration: Number
  }],
  lat: Number,
  lng: Number,
  ref: { type: Schema.Types.ObjectId, ref: "Message" }
})

export default mongoose.model("Message", MessageSchema)