import express from "express"
import { GetMessage, PostMessage } from "./message.controller"
import { requireAuthenticate, uploadFormData } from "../../../middlewave"

const uploadMessageAttachments = uploadFormData.fields([{ name: "attachments" }, { name: "thumbnails" }])

const router = express.Router()

router.get("/", GetMessage)
router.post("/", [requireAuthenticate, uploadMessageAttachments], PostMessage)

export default router
