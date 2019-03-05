import fs from "fs"
import sharp from "sharp"

export default (path, format, width, height) => {
  const readStream = fs.createReadStream(path)
  const writeStream = fs.createWriteStream('test.png');

  let transform = sharp()
  
  if (format) {
    transform = transform.toFormat(format)
  }
  if (width || height) {
    transform = transform.resize(width, height)
  }
  return readStream.pipe(transform).pipe(writeStream)
}