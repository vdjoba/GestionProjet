import { Router } from "express";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../controllers/eventsController.js";

const router = Router();

router.get("/", listEvents);
router.post("/", createEvent);
router.put("/:id", updateEvent);
router.delete("/:id", deleteEvent);

export default router;
