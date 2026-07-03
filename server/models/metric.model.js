// server/models/Metric.js
// Stores time-series server health data snapshots.

import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema(
  {
    server: {
      type: String,
      required: true,
      default: 'primary',
    },
    cpu: {
      usage: { type: Number, min: 0, max: 100 },       // percentage
      cores: { type: Number },
    },
    memory: {
      used: { type: Number },    // bytes
      total: { type: Number },   // bytes
      usagePercent: { type: Number, min: 0, max: 100 },
    },
    disk: {
      used: { type: Number },
      total: { type: Number },
      usagePercent: { type: Number, min: 0, max: 100 },
    },
    network: {
      bytesIn: { type: Number, default: 0 },
      bytesOut: { type: Number, default: 0 },
    },
    uptime: { type: Number },          // seconds
    requestsPerMinute: { type: Number, default: 0 },
    activeConnections: { type: Number, default: 0 },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    // Auto-expire metrics after 30 days (TTL index)
    // Keeps the collection from growing indefinitely
  }
);

// TTL index: MongoDB will automatically delete documents 30 days after recordedAt
metricSchema.index({ recordedAt: 1 }, { expireAfterSeconds: 2592000 });

const Metric = mongoose.model('Metric', metricSchema);
export default Metric;