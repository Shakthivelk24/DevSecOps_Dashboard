// server/models/Deployment.js
// Records each deployment event — linked to a Pipeline.

import mongoose from 'mongoose';

const deploymentSchema = new mongoose.Schema(
  {
    pipeline: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pipeline',
      required: [true, 'Pipeline reference is required'],
    },
    version: {
      type: String,
      required: [true, 'Deployment version is required'],
      trim: true,
    },
    environment: {
      type: String,
      enum: ['development', 'staging', 'production'],
      required: [true, 'Environment is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'success', 'failed', 'rolled_back'],
      default: 'pending',
    },
    deployedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    commitHash: {
      type: String,
      trim: true,
      maxlength: [40, 'Commit hash cannot exceed 40 characters'],
    },
    commitMessage: { type: String, trim: true },
    duration: { type: Number, default: 0 },   // seconds
    startedAt: { type: Date },
    finishedAt: { type: Date },
    notes: { type: String, trim: true, maxlength: [1000] },
    rollbackOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deployment',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

deploymentSchema.index({ pipeline: 1, environment: 1 });
deploymentSchema.index({ status: 1 });
deploymentSchema.index({ createdAt: -1 }); // Latest first

const Deployment = mongoose.model('Deployment', deploymentSchema);
export default Deployment;