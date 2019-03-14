import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import Group from "./Group"

const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: { type: String, default: "123456" },
  name: String,
  avatar: { type: String, default: "/images/user-avatar.png" },
  status: { type: Number, default: 1 },
  online: { type: Boolean, default: false },
  latestTimeConnection: Number,
  friends: [
    { type: Schema.Types.ObjectId, ref: "User" }
  ],
  badges: [
    { type: Schema.Types.ObjectId, ref: "Group", default: [] }
  ]
})

UserSchema.pre("save", function (next) {
  const user = this
  if (!user.isModified("password")) return next()
  return bcrypt.genSalt((saltError, salt) => {
    if (saltError) return next(saltError)
    return bcrypt.hash(user.password, salt, (hashError, hash) => {
      if (hashError) return next(hashError)
      user.password = hash;
      return next()
    })
  })
})

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password)
}

UserSchema.methods.getGroupChatWithFriend = async function(friendID) {
  try {
    const group = await Group.findOne({
      $and: [
        {
          $or: [
            { members: [this._id, friendID] },
            { members: [friendID, this._id] }
          ]
        },
        { members: { $size: 2 } }
      ]
    })
    .populate("members", "username name avatar online")
    .lean()

    return group
  } catch(error) {
    return null
  }
}

export default mongoose.model("User", UserSchema)