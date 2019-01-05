import express from "express"
import { PostMessage } from "./message.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.post("/", requireAuthenticate, PostMessage)

export default router
