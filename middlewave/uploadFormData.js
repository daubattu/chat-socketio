import multer from "multer"

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "public")
  },
  filename: (request, file, callback) => {
    callback(null, "/uploads/" + Date.now() + "-" + file.originalname)
  }
})

const uploadFormData = multer({
  storage
})

export default uploadFormData