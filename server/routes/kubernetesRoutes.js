import express from "express";
import { getCluster } from "../controllers/kubernetesController.js";

const router = express.Router();

router.get("/cluster", getCluster);

export default router;