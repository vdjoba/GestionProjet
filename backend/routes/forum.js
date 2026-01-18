import { Router } from "express";
import { listMessages, createMessage, updateMessage, deleteMessage } from "../controllers/forumController.js";

const router = Router();

router.get("/messages", listMessages);
router.post("/messages", createMessage);
router.put("/messages/:id", updateMessage);
router.delete("/messages/:id", deleteMessage);

export default router;
