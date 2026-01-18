import { Router } from "express";
import { get } from "../db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await get("SELECT 1");
    return res.json({ status: "ok" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: "error" });
  }
});

export default router;
