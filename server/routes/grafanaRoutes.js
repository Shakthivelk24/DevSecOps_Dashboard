import express from "express";
import { getDashboard } from "../controllers/grafanaController.js";

const router = express.Router();

router.get("/dashboard/:uid", getDashboard);

export default router;