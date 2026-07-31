import express from "express";
import { scanImage } from "../controllers/trivyController.js";

const router = express.Router();

router.get("/scan/:image", scanImage);

export default router;