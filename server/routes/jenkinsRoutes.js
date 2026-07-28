import express from 'express';
import protect from '../middlewares/auth.js';
import { getBuilds,getPipelineStages,getConsoleLogs , getBuildDetails,getArtifacts } from '../controllers/jenkinsController.js';

const router = express.Router();

router.use(protect);
router.get("/:jobName/builds", getBuilds);
router.get("/:jobName/stages", getPipelineStages);
router.get("/:jobName/console", getConsoleLogs);
// These are probably missing
router.get("/:jobName/details", getBuildDetails);
router.get("/:jobName/artifacts", getArtifacts);

export default router;