import express from "express"
import { Login } from "./auth.controller"

const router = express.Router()

router.post("/login", Login)

export default router