// client/src/pages/DashboardPage.jsx
// Main dashboard with stats overview, recent pipelines, and charts.

import { useContext } from "react";
import { Link } from "react-router-dom";
import {
  MdAccountTree,
  MdCheckCircle,
  MdTimeline,
  MdSecurity,
  MdShield,
  MdArrowForward,
  MdStorage,
} from "react-icons/md";

import { SiDocker, SiKubernetes } from "react-icons/si";
import UserContext from "../context/UserContext";

const DashboardPage = () => {
  const { dbUser } = useContext(UserContext);
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
            </div>

            {/* {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </p>
            )} */}
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
              to="/security"
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
            <Link
              to="/docker"
              className="bg-[#121A2B] border border-slate-700 rounded-xl p-6 hover:border-sky-500 hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-center">
                <SiDocker className="text-sky-400 text-5xl" />
                <MdArrowForward className="text-slate-400" />
              </div>

              <h2 className="text-xl font-semibold text-white mt-5">Docker</h2>

              <p className="text-slate-400 mt-2 text-sm">
                Monitor containers, images, runtime status and health.
              </p>
            </Link>
            <Link
              to="/kubernetes"
              className="bg-[#121A2B] border border-slate-700 rounded-xl p-6 hover:border-indigo-500 hover:scale-[1.02] transition"
            >
              <div className="flex justify-between items-center">
                <SiKubernetes className="text-indigo-400 text-5xl" />
                <MdArrowForward className="text-slate-400" />
              </div>

              <h2 className="text-xl font-semibold text-white mt-5">
                Kubernetes
              </h2>

              <p className="text-slate-400 mt-2 text-sm">
                View cluster health, pods, deployments and services.
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
              <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Docker</span>
                  <MdCheckCircle className="text-green-500 text-2xl" />
                </div>

                <p className="text-3xl font-bold mt-4 text-white">Healthy</p>
              </div>
              <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kubernetes</span>
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
