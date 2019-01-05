import express from "express"
import { InitUser } from "./user.controller"

const router = express.Router()

router.get("/init", InitUser)

export default router

