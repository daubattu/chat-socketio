import express from "express"
import { InitGroup, GetGroup, UpdateGroup } from "./group.controller"
// import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.get("/init", InitGroup)
router.get("/", GetGroup)
router.put("/:groupId", UpdateGroup)

export default router