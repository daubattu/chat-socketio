import mongoose from "mongoose"

const Schema = mongoose.Schema

const GroupSchema = new Schema({
  members: [
    { type: Schema.Types.ObjectId, ref: "User" }
  ],
  name: String
})

export default mongoose.model("Group", GroupSchema)