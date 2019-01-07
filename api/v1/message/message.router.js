import express from "express"
import { GetMessage, PostMessage } from "./message.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.get("/", GetMessage)
router.post("/", requireAuthenticate, PostMessage)

export default router
