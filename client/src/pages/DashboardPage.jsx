// client/src/pages/DashboardPage.jsx
// Main dashboard with stats overview, recent pipelines, and charts.

import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdAccountTree,
  MdCheckCircle,
  MdError,
  MdTimeline,
  MdRefresh,
  MdSecurity,
  MdShield,
  MdArrowForward,
  MdSpeed,
  MdStorage,
  MdLan,
  MdInsights,
  MdRocketLaunch,
  MdPlayArrow,
} from "react-icons/md";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../api/axios";
import UserContext from "../context/UserContext";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Spinner from "../components/ui/Spinner";

const statusPalette = [
  "#34d399",
  "#38bdf8",
  "#f59e0b",
  "#f87171",
  "#a78bfa",
  "#94a3b8",
];

const formatDateLabel = (dateValue) => {
  if (!dateValue) return "Now";
  const date = new Date(dateValue);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "0 B";
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const formatDuration = (seconds) => {
  if (!seconds) return "0m";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

const EmptyState = ({ title, message }) => (
  <div className="flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-6 text-center">
    <MdInsights size={28} className="text-slate-500" />
    <p className="mt-3 text-sm font-medium text-white">{title}</p>
    <p className="mt-1 max-w-sm text-xs text-slate-400">{message}</p>
  </div>
);

const DashboardPage = () => {
  const { dbUser } = useContext(UserContext);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobName, setJobName] = useState(localStorage.getItem("jobName") || "");

  const saveJobName = () => {
    if (!jobName.trim()) {
      alert("Please enter a Jenkins job name.");
      return;
    }

    localStorage.setItem("jobName", jobName.trim());

    alert(`Project "${jobName}" selected successfully.`);
  };
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashboardRes, metricRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/metrics/history"),
      ]);

      setDashboard(dashboardRes.data.data?.dashboard || null);
      setHistory(metricRes.data.data?.history || []);
    } catch (err) {
      setError(err.response?.data?.message || "Dashboard fetch error");
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  const pipelineChartData = dashboard?.charts?.pipelineStatusSeries || [];
  const deploymentChartData = dashboard?.charts?.deploymentStatusSeries || [];
  const cpuHistory = history.map((entry) => ({
    time: formatDateLabel(entry.recordedAt),
    value: entry.cpu?.usage || entry["cpu.usage"] || 0,
  }));
  const memoryHistory = history.map((entry) => ({
    time: formatDateLabel(entry.recordedAt),
    value: entry.memory?.usagePercent || entry["memory.usagePercent"] || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="hero-panel overflow-hidden">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              <MdSecurity size={14} /> DevSecOps command center
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
                {dbUser?.name?.split(" ")[0] || "there"}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Track build health, release velocity, infrastructure posture,
                and live observability from one control plane.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pipelines"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
              >
                View pipelines <MdArrowForward size={16} />
              </Link>
              <Link
                to="/metrics"
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-colors hover:bg-white/10"
              >
                Review metrics
              </Link>
              <button
                onClick={fetchData}
                className="btn-secondary inline-flex items-center gap-2 text-sm"
              >
                <MdRefresh size={16} /> Refresh
              </button>
            </div>
            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="mb-6">
  <div className="card">
  <h3 className="text-lg font-semibold text-white mb-2">
    Select Jenkins Project
  </h3>

  <p className="text-sm text-slate-400 mb-6">
    Enter the Jenkins Pipeline / Job name.
  </p>

  <div className="flex flex-col md:flex-row gap-4">

    <input
      type="text"
      value={jobName}
      onChange={(e) => setJobName(e.target.value)}
      placeholder="Example: Virtual-Assistant"
      className="flex-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
    />

    <button
      onClick={saveJobName}
      className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white hover:bg-emerald-600"
    >
      Save
    </button>

  </div>

  {jobName && (
    <div className="mt-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
      <p className="text-sm text-slate-400">
        Selected Project
      </p>

      <h4 className="text-lg font-semibold text-emerald-400">
        {jobName}
      </h4>
    </div>
  )}
</div>
</div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
            <span className="text-xs text-slate-400">
              derived from live data
            </span>
          </div>
          <div className="space-y-3">
            {(dashboard?.recentActivity?.latestAlerts || []).length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                No active alerts
              </p>
            ) : (
              dashboard.recentActivity.latestAlerts.map((alert, index) => (
                <div
                  key={`${alert.title}-${index}`}
                  className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {alert.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {alert.detail}
                    </p>
                  </div>
                  <Badge
                    status={alert.severity === "high" ? "failed" : "pending"}
                    label={alert.severity}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Monitoring Snapshot
            </h3>
            <span className="text-xs text-slate-400">latest sample</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>CPU</span>
                <span>{dashboard?.monitoringSummary?.cpuUsage || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-cyan-400"
                  style={{
                    width: `${dashboard?.monitoringSummary?.cpuUsage || 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Memory</span>
                <span>{dashboard?.monitoringSummary?.memoryUsage || 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5">
                <div
                  className="h-2 rounded-full bg-emerald-400"
                  style={{
                    width: `${dashboard?.monitoringSummary?.memoryUsage || 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Network
              </p>
              <p className="mt-2 font-medium text-white">
                {formatBytes(dashboard?.monitoringSummary?.networkIn || 0)} in
              </p>
              <p className="text-slate-400">
                {formatBytes(dashboard?.monitoringSummary?.networkOut || 0)} out
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
