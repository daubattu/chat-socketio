import multer from "multer"

const storage = multer.diskStorage({
  destination: function (request, file, callback) {
    callback(null, "public")
  },
  filename: (request, file, callback) => {
    let folder

    if(file.fieldname === "attachments") {
      folder = "/uploads/originals/" 
    } else if (file.fieldname === "thumbnails") {
      folder = "/uploads/thumbnails/"
    } else {
      folder = "/uploads/"
    }
    callback(null, folder + Date.now() + "-" + file.originalname)
  }
})

const uploadFormData = multer({
  storage
})

export default uploadFormData