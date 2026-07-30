import express from "express";
import { getDockerContainers } from "../controllers/dockerController.js";

const router = express.Router();

router.get("/containers", getDockerContainers);

export default router;