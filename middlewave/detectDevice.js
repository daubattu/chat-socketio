module.exports = userAgent => {
  let device

  console.log("user-agent", userAgent)

  if(userAgent.includes("iOS")) device = "ios"
  else if(userAgent.includes("Android")) device = "android"
  else device = "web"

  return device
}