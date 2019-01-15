import mongoose from "mongoose"

const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  group: { type: Schema.Types.ObjectId, ref: "Group" },
  readed: { type: Boolean, default: false },
  title: String,
  message: String,
  created_time: { type: Number, default: Date.now() },
  success: { type: Boolean, default: false }
})

export default mongoose.model("Notification", NotificationSchema)