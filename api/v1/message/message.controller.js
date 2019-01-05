async function PostMessage(request, response) {
  return response.status(200).json({ status: 200 })
}

export {
  PostMessage
}