import express from "express"
import { GetFriends, Update } from "./me.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.get("/friends", requireAuthenticate, GetFriends)
router.put("/", requireAuthenticate, Update)

export default router

