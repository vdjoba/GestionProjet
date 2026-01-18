import { Router } from "express";
import { createProject, listProjects, latestProjects } from "../controllers/projectsController.js";

const router = Router();

router.post("/", createProject);
router.get("/", listProjects);
router.get("/latest", latestProjects);

export default router;
