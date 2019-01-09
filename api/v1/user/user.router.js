import express from "express"
import { InitUser, GetUser, InitUserFriend } from "./user.controller"

const router = express.Router()

router.get("/init", InitUser)
router.get("/init-friends", InitUserFriend)
router.get("/", GetUser)

export default router

