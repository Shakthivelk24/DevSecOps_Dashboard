// server/routes/pipelineRoutes.js
import express from 'express';
import {
  getPipelines, getPipelineById, createPipeline,
  updatePipeline, deletePipeline, triggerPipeline, getPipelineStats,
} from '../controllers/pipelineController.js';
import protect  from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';
import { validatePipeline } from '../middlewares/validateMiddleware.js';

const router = express.Router();

// All pipeline routes require authentication
router.use(protect);

router.get('/stats', getPipelineStats);
router.get('/', getPipelines);
router.get('/:id', getPipelineById);
router.post('/', validatePipeline, createPipeline);
router.put('/:id', validatePipeline, updatePipeline);
router.patch('/:id/trigger', triggerPipeline);
router.delete('/:id', restrictTo('admin'), deletePipeline);

export default router;