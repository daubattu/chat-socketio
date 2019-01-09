import express from "express"
import { InitGroup, GetGroup, CreateGroup, UpdateGroup, GroupMember } from "./group.controller"
import { requireAuthenticate } from "../../../middlewave"

const router = express.Router()

router.get("/init", InitGroup)
router.get("/", requireAuthenticate, GetGroup)
router.put("/:groupId", UpdateGroup)
router.post("/", requireAuthenticate, CreateGroup)

router.get("/:groupId/members", requireAuthenticate, GroupMember().get)
router.post("/:groupId/members", requireAuthenticate, GroupMember().post)
router.delete("/:groupId/members", requireAuthenticate, GroupMember().delete)

export default router