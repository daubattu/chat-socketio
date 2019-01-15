import mongoose from "mongoose"

const Schema = mongoose.Schema

const TokenNotificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  value: String,
  device: String,
  sockets: { type: Array, default: [] }
})

export default mongoose.model("TokenNotification", TokenNotificationSchema)