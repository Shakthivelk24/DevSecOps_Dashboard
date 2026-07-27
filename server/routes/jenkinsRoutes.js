import express from 'express';
import protect from '../middlewares/auth.js';
import { getBuilds,getPipelineStages } from '../controllers/jenkinsController.js';

const router = express.Router();

router.use(protect);
router.get("/:jobName/builds", getBuilds);
router.get("/:jobName/stages", getPipelineStages);

export default router;