// import axios from "axios"
// import { FIREBASE_SECRET_KEY } from "../../configs"
import apn from "apn"
import apnProvider from "./apn.js"
import Notification from "../../models/Notification.js";

async function pushNotificationToIOS(token, title, message, user, group) {
  const notification = new apn.Notification()

  // const badge = await Notification.count({ readed: false, success: true, to: user.id  })

  // note.badge = badge + 1
  notification.sound = "ping.aiff"
  notification.alert = title
  notification.topic = "com.chatapp.go"
  notification.payload = { message }

  let success = false

  await apnProvider.send(notification, token)
    .then(result => {
      console.log("result push totification toIOS", result)
      if (result.failed && result.failed.length === 0) {
        success = true
      }
    })

  new Notification({
    user,
    group,
    title,
    message,
    success
  }).save()
}

export {
  pushNotificationToIOS
}