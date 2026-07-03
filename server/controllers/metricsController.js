// server/controllers/metricsController.js
// Returns server health metrics — either simulated or from Metric model.

import os from 'os';
import Metric from '../models/metric.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// ─── GET /api/v1/metrics/live ─────────────────────────────────
// Returns live server metrics using Node.js 'os' module
export const getLiveMetrics = asyncHandler(async (req, res) => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

  const cpuUsage = os.loadavg()[0]; // 1-minute load average

  const metrics = {
    server: os.hostname(),
    cpu: {
      usage: Math.min(parseFloat((cpuUsage * 10).toFixed(1)), 100),
      cores: os.cpus().length,
      model: os.cpus()[0]?.model || 'Unknown',
    },
    memory: {
      used: usedMem,
      total: totalMem,
      free: freeMem,
      usagePercent: parseFloat(memPercent),
    },
    uptime: Math.floor(os.uptime()),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    recordedAt: new Date().toISOString(),
  };

  // Save snapshot to DB for historical tracking
  await Metric.create({
    server: os.hostname(),
    cpu: { usage: metrics.cpu.usage, cores: metrics.cpu.cores },
    memory: {
      used: usedMem,
      total: totalMem,
      usagePercent: parseFloat(memPercent),
    },
    uptime: metrics.uptime,
  });

  ApiResponse.success(res, 'Live metrics fetched', { metrics });
});

// ─── GET /api/v1/metrics/history ─────────────────────────────
// Returns historical metrics for charting
export const getMetricsHistory = asyncHandler(async (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const history = await Metric.find({ recordedAt: { $gte: since } })
    .select('cpu.usage memory.usagePercent uptime recordedAt')
    .sort({ recordedAt: 1 })
    .limit(100);

  // If no real data, generate mock data for demonstration
  const data = history.length > 0 ? history : generateMockHistory(24);

  ApiResponse.success(res, 'Metrics history fetched', { history: data });
});

// ─── GET /api/v1/metrics/summary ──────────────────────────────
// Returns aggregate stats
export const getMetricsSummary = asyncHandler(async (req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const summary = await Metric.aggregate([
    { $match: { recordedAt: { $gte: oneDayAgo } } },
    {
      $group: {
        _id: null,
        avgCpu: { $avg: '$cpu.usage' },
        maxCpu: { $max: '$cpu.usage' },
        avgMem: { $avg: '$memory.usagePercent' },
        maxMem: { $max: '$memory.usagePercent' },
        count: { $sum: 1 },
      },
    },
  ]);

  ApiResponse.success(res, 'Metrics summary fetched', {
    summary: summary[0] || { avgCpu: 0, maxCpu: 0, avgMem: 0, maxMem: 0 },
  });
});

// Helper: Generate mock time-series data for demo purposes
const generateMockHistory = (hours) => {
  return Array.from({ length: hours }, (_, i) => ({
    recordedAt: new Date(Date.now() - (hours - i) * 60 * 60 * 1000),
    'cpu.usage': Math.floor(20 + Math.random() * 60),
    'memory.usagePercent': Math.floor(40 + Math.random() * 40),
  }));
};