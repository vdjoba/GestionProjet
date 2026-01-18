import { Router } from "express";
import { registerUser, loginUser, resetPassword } from "../controllers/usersController.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/reset-password", resetPassword);

export default router;
