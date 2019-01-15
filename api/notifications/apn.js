import apn from "apn"

const { APN } = require("../../configs")
const { SECRET_KEY, TEAM_ID, KEY_ID } = APN

const options = {
  token: {
    key: SECRET_KEY,
    keyId: KEY_ID,
    teamId: TEAM_ID
  },
  production: false
}

export default new apn.Provider(options)