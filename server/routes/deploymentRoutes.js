// server/routes/deploymentRoutes.js
import express from 'express';
import {
  getDeployments, getDeploymentById, createDeployment,
  updateDeploymentStatus, getDeploymentStats,
} from '../controllers/deploymentController.js';
import  protect  from '../middlewares/auth.js';
import { restrictTo } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/stats', getDeploymentStats);
router.get('/', getDeployments);
router.get('/:id', getDeploymentById);
router.post('/', createDeployment);
router.patch('/:id/status', updateDeploymentStatus);

export default router;