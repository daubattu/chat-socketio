import apn from "apn"
import apnProvider from "./apn.js"
import Notification from "../../models/Notification.js";

function pushNotification(tokenNotification, user, group = null, title = null, message = null) {

  let tokenDevice = tokenNotification.value
  let success = false

  const saveNewNotification = status => {
    new Notification({
      user: user._id,
      group: group._id,
      title,
      message,
      success: status
    }).save()
  }

  let badge = user.badges ? user.badges.length : 1

  return {
    toIOS: async () => {
      const notification = new apn.Notification()

      notification.topic = "com.chatapp.go"

      if (group && title && message) {
        notification.sound = "ping.aiff"
        notification.alert = {
          title,
          body: message
        }
        notification.payload = { group }
      }
    
      notification.badge = badge
      console.log("badge", badge)

      await apnProvider.send(notification, tokenDevice)
        .then(result => {
          if (result.failed && result.failed.length === 0) {
            success = true
            console.log("push notification success", tokenDevice)
          } else {
            console.log("push notification error", result.failed, tokenNotification)
          }
        })

      if (group && title && message) {
        saveNewNotification(success)
      }
    }
  }
}

export {
  pushNotification
}