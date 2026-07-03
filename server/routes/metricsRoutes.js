// server/routes/metricsRoutes.js
import express from 'express';
import {
  getLiveMetrics, getMetricsHistory, getMetricsSummary,
} from '../controllers/metricsController.js';
import  protect  from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get('/live', getLiveMetrics);
router.get('/history', getMetricsHistory);
router.get('/summary', getMetricsSummary);

export default router;