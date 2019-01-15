import express from "express"
import { Login, Logout } from "./auth.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.post("/login", Login)
router.get("/logout", requireAuthenticate, Logout)

export default router