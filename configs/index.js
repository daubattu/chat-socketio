import env from "dotenv"

env.load()

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/chat-socketio",
  SECRET_KEY_JWT: process.env.SECRET_KEY_JWT || "tobeornottobe",
  SECRET_KEY_REFRESH_TOKEN_JWT: "SECRET_KEY_REFRESH_TOKEN_JWT",
  FIREBASE: {
    SECRET_KEY: process.env.SECRET_KEY_FIREBASE
  },
  APN: {
    SECRET_KEY: process.env.SECRET_KEY_APN,
    KEY_ID: process.env.KEY_ID_APN,
    TEAM_ID: process.env.TEAM_ID_APN
  },
  TOKEN_JWT_LIFETIME: 900,
  REFRESH_TOKEN_JWT_LIFE_TIME: 86400
}