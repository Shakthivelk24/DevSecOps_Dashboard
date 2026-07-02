import Pipeline from '../models/pipeline.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';

// ─── GET /api/v1/pipelines ────────────────────────────────────
export const getPipelines = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = { isActive: true };
  if (req.query.status) filter.status = req.query.status;
  if (req.query.environment) filter.environment = req.query.environment;

  const [pipelines, total] = await Promise.all([
    Pipeline.find(filter)
      .populate('triggeredBy', 'name email role')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit),
    Pipeline.countDocuments(filter),
  ]);

  ApiResponse.paginated(res, 'Pipelines fetched', pipelines, { total, page, limit });
});

// ─── GET /api/v1/pipelines/:id ────────────────────────────────
export const getPipelineById = asyncHandler(async (req, res) => {
  const pipeline = await Pipeline.findById(req.params.id)
    .populate('triggeredBy', 'name email');

  if (!pipeline) {
    return ApiResponse.error(res, 'Pipeline not found', 404);
  }

  ApiResponse.success(res, 'Pipeline fetched', { pipeline });
});

// ─── POST /api/v1/pipelines ───────────────────────────────────
export const createPipeline = asyncHandler(async (req, res) => {
  const { name, description, repository, branch, environment, stages, tags } = req.body;

  const pipeline = await Pipeline.create({
    name,
    description,
    repository,
    branch: branch || 'main',
    environment: environment || 'development',
    stages: stages || [
      { name: 'Build', status: 'pending' },
      { name: 'Test', status: 'pending' },
      { name: 'Deploy', status: 'pending' },
    ],
    tags: tags || [],
    triggeredBy: req.userId, // Assuming req.userId is set by the protect middleware
  });

  const populated = await pipeline.populate('triggeredBy', 'name email');
  ApiResponse.created(res, 'Pipeline created successfully', { pipeline: populated });
});

// ─── PUT /api/v1/pipelines/:id ────────────────────────────────
export const updatePipeline = asyncHandler(async (req, res) => {
  const pipeline = await Pipeline.findByIdAndUpdate(
    req.params.id,
    { ...req.body, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('triggeredBy', 'name email');

  if (!pipeline) {
    return ApiResponse.error(res, 'Pipeline not found', 404);
  }

  ApiResponse.success(res, 'Pipeline updated', { pipeline });
});

// ─── PATCH /api/v1/pipelines/:id/trigger ─────────────────────
export const triggerPipeline = asyncHandler(async (req, res) => {
  const pipeline = await Pipeline.findById(req.params.id);

  if (!pipeline) return ApiResponse.error(res, 'Pipeline not found', 404);

  if (pipeline.status === 'running') {
    return ApiResponse.error(res, 'Pipeline is already running', 400);
  }

  // Simulate triggering the pipeline
  pipeline.status = 'running';
  pipeline.lastRunAt = new Date();
  pipeline.runCount += 1;
  pipeline.stages = pipeline.stages.map((s) => ({ ...s.toObject(), status: 'pending' }));
  await pipeline.save();

  ApiResponse.success(res, 'Pipeline triggered successfully', { pipeline });
});

// ─── DELETE /api/v1/pipelines/:id ────────────────────────────
export const deletePipeline = asyncHandler(async (req, res) => {
  const pipeline = await Pipeline.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!pipeline) return ApiResponse.error(res, 'Pipeline not found', 404);

  ApiResponse.success(res, 'Pipeline deleted');
});

// ─── GET /api/v1/pipelines/stats ─────────────────────────────
export const getPipelineStats = asyncHandler(async (req, res) => {
  const stats = await Pipeline.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgDuration: { $avg: '$duration' },
      },
    },
  ]);

  const formatted = stats.reduce((acc, s) => {
    acc[s._id] = { count: s.count, avgDuration: Math.round(s.avgDuration || 0) };
    return acc;
  }, {});

  ApiResponse.success(res, 'Pipeline stats fetched', { stats: formatted });
});