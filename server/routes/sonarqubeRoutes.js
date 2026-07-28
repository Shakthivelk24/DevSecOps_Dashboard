import express from "express";
import { getDashboard } from "../controllers/sonarqubeController.js";

const router = express.Router();

router.get("/dashboard/:projectKey", getDashboard);

export default router;