import express from "express"
import { Login, Logout, Signup } from "./auth.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.post("/login", Login)
router.get("/logout", requireAuthenticate, Logout)
router.post("/signup", Signup)
export default router