import express from "express"
import { GetFriends } from "./me.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.get("/friends", requireAuthenticate, GetFriends)

export default router

