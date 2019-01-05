import env from "dotenv"

env.load()

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/chat-socketio",
  SECRET_KEY_JWT: process.env.SECRET_KEY_JWT || "somethingwrong"
}