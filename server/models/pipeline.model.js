// server/models/Pipeline.js
// Represents a CI/CD pipeline with its stages and current status.

import mongoose from 'mongoose';

const stageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'success', 'failed', 'skipped'],
    default: 'pending',
  },
  duration: { type: Number, default: 0 }, // seconds
  startedAt: { type: Date },
  finishedAt: { type: Date },
  logs: { type: String, default: '' },
});

const pipelineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pipeline name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    repository: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true,
    },
    branch: {
      type: String,
      default: 'main',
      trim: true,
    },
    status: {
      type: String,
      enum: ['idle', 'pending', 'running', 'success', 'failed', 'cancelled'],
      default: 'idle',
    },
    stages: [stageSchema],
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      default: 'development',
    },
    duration: { type: Number, default: 0 }, // total seconds
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for fast queries on status and environment
pipelineSchema.index({ status: 1, environment: 1 });
pipelineSchema.index({ triggeredBy: 1 });

const Pipeline = mongoose.model('Pipeline', pipelineSchema);
export default Pipeline;