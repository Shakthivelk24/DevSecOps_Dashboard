// server/controllers/deploymentController.js
// CRUD operations for Deployment records.

import Deployment from '../models/deployment.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ─── GET /api/v1/deployments ──────────────────────────────────
export const getDeployments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.environment) filter.environment = req.query.environment;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.pipeline) filter.pipeline = req.query.pipeline;

  const [deployments, total] = await Promise.all([
    Deployment.find(filter)
      .populate('pipeline', 'name repository')
      .populate('deployedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Deployment.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Deployments fetched', deployments, { total, page, limit });
});

// ─── GET /api/v1/deployments/:id ─────────────────────────────
export const getDeploymentById = asyncHandler(async (req, res) => {
  const deployment = await Deployment.findById(req.params.id)
    .populate('pipeline', 'name repository branch')
    .populate('deployedBy', 'name email role');

  if (!deployment) return ApiResponse.error(res, 'Deployment not found', 404);

  ApiResponse.success(res, 'Deployment fetched', { deployment });
});

// ─── POST /api/v1/deployments ─────────────────────────────────
export const createDeployment = asyncHandler(async (req, res) => {
  const { pipeline, version, environment, commitHash, commitMessage, notes } = req.body;

  const deployment = await Deployment.create({
    pipeline,
    version,
    environment,
    commitHash,
    commitMessage,
    notes,
    deployedBy: req.user._id,
    status: 'pending',
    startedAt: new Date(),
  });

  const populated = await deployment.populate([
    { path: 'pipeline', select: 'name repository' },
    { path: 'deployedBy', select: 'name email' },
  ]);

  ApiResponse.created(res, 'Deployment created', { deployment: populated });
});

// ─── PATCH /api/v1/deployments/:id/status ────────────────────
export const updateDeploymentStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['pending', 'in_progress', 'success', 'failed', 'rolled_back'];

  if (!validStatuses.includes(status)) {
    return ApiResponse.error(res, `Invalid status. Must be: ${validStatuses.join(', ')}`, 400);
  }

  const update = { status };
  if (notes) update.notes = notes;
  if (status === 'success' || status === 'failed') {
    update.finishedAt = new Date();
  }

  const deployment = await Deployment.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });

  if (!deployment) return ApiResponse.error(res, 'Deployment not found', 404);

  ApiResponse.success(res, 'Deployment status updated', { deployment });
});

// ─── GET /api/v1/deployments/stats ────────────────────────────
export const getDeploymentStats = asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [byEnvironment, byStatus, recentCount] = await Promise.all([
    Deployment.aggregate([
      { $group: { _id: '$environment', count: { $sum: 1 } } },
    ]),
    Deployment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Deployment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  ApiResponse.success(res, 'Deployment stats fetched', {
    stats: { byEnvironment, byStatus, last30Days: recentCount },
  });
});