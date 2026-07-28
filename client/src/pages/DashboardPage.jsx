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
                to="/jenkins"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-400"
              >
                View pipelines <MdArrowForward size={16} />
              </Link>
              <Link
                to="/grafana"
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
        {/* Quick Access */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-white mb-6">
            DevSecOps Services
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Jenkins */}
            <Link
              to="/jenkins"
              className="bg-[#121A2B] border border-slate-700 rounded-xl p-6 hover:border-blue-500 hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-center">
                <MdAccountTree className="text-blue-400 text-5xl" />
                <MdArrowForward className="text-slate-400" />
              </div>

              <h2 className="text-xl font-semibold text-white mt-5">Jenkins</h2>

              <p className="text-slate-400 mt-2 text-sm">
                Monitor builds, pipeline stages, logs and artifacts.
              </p>
            </Link>

            {/* SonarQube */}
            <Link
              to="/sonarqube"
              className="bg-[#121A2B] border border-slate-700 rounded-xl p-6 hover:border-yellow-500 hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-center">
                <MdShield className="text-yellow-400 text-5xl" />
                <MdArrowForward className="text-slate-400" />
              </div>

              <h2 className="text-xl font-semibold text-white mt-5">
                SonarQube
              </h2>

              <p className="text-slate-400 mt-2 text-sm">
                Code quality, security vulnerabilities and coverage reports.
              </p>
            </Link>

            {/* Grafana */}
            <Link
              to="/grafana"
              className="bg-[#121A2B] border border-slate-700 rounded-xl p-6 hover:border-orange-500 hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-center">
                <MdTimeline className="text-orange-400 text-5xl" />
                <MdArrowForward className="text-slate-400" />
              </div>

              <h2 className="text-xl font-semibold text-white mt-5">Grafana</h2>

              <p className="text-slate-400 mt-2 text-sm">
                View live metrics, dashboards and infrastructure monitoring.
              </p>
            </Link>
          </div>
          {/* Platform Status */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-6">
              Platform Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Jenkins</span>
                  <MdCheckCircle className="text-green-500 text-2xl" />
                </div>
                <p className="text-3xl font-bold mt-4 text-white">Healthy</p>
              </div>

              <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">SonarQube</span>
                  <MdCheckCircle className="text-green-500 text-2xl" />
                </div>
                <p className="text-3xl font-bold mt-4 text-white">Healthy</p>
              </div>

              <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Grafana</span>
                  <MdCheckCircle className="text-green-500 text-2xl" />
                </div>
                <p className="text-3xl font-bold mt-4 text-white">Healthy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
