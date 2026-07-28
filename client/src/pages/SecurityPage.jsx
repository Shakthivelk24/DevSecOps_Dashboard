import React, { useEffect, useState } from "react";
import api from "../api/axios"; // Change this path if needed

export default function SecurityPage() {
  const [projectKey, setProjectKey] = useState(
    localStorage.getItem("sonarProjectKey") || "",
  );

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const saveProjectKey = () => {
    if (!projectKey.trim()) {
      alert("Please enter a SonarQube Project Key.");
      return;
    }

    const key = projectKey.trim();

    localStorage.setItem("sonarProjectKey", key);

    setProjectKey(key);

    alert("Project Key saved successfully.");
  };

  useEffect(() => {
    if (!projectKey) {
      setLoading(false);
      return;
    }

    const fetchDashboard = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        const { data } = await api.get(`/sonarqube/dashboard/${projectKey}`);

        setDashboard(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to fetch SonarQube data.");
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    const interval = setInterval(fetchDashboard, 5000);

    return () => clearInterval(interval);
  }, [projectKey]);

  if (!projectKey) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-[#121A2B] rounded-xl p-8 w-full max-w-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-4">
            SonarQube Project
          </h2>

          <p className="text-slate-400 mb-6">
            Enter the SonarQube Project Key to monitor.
          </p>

          <input
            type="text"
            placeholder="Example: Secure-DevOps"
            value={projectKey}
            onChange={(e) => setProjectKey(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#0B1120] border border-slate-700 text-white focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={saveProjectKey}
            className="w-full mt-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white"
          >
            Save Project Key
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-white text-xl">
        Loading SonarQube Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-red-500 text-xl">
        {error}
      </div>
    );
  }
  const measures = dashboard?.component?.measures || [];

  const metrics = {};

  measures.forEach((item) => {
    metrics[item.metric] = item.value;
  });
  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">SonarQube Dashboard</h1>

          <p className="text-slate-400 mt-2">
            Monitoring Project:
            <span className="text-white font-semibold ml-2">{projectKey}</span>
          </p>
        </div>

        <button
          onClick={() =>
            window.open(
              `http://localhost:9000/dashboard?id=${projectKey}`,
              "_blank",
            )
          }
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Open SonarQube
        </button>
      </div>

      {/* Dashboard Data */}
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Coverage</p>
          <h2 className="text-3xl font-bold mt-3">{metrics.coverage || 0}%</h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Bugs</p>
          <h2 className="text-3xl font-bold mt-3 text-red-400">
            {metrics.bugs || 0}
          </h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Vulnerabilities</p>
          <h2 className="text-3xl font-bold mt-3 text-yellow-400">
            {metrics.vulnerabilities || 0}
          </h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Code Smells</p>
          <h2 className="text-3xl font-bold mt-3 text-orange-400">
            {metrics.code_smells || 0}
          </h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Lines of Code</p>
          <h2 className="text-3xl font-bold mt-3">{metrics.ncloc || 0}</h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Duplications</p>
          <h2 className="text-3xl font-bold mt-3">
            {metrics.duplicated_lines_density || 0}%
          </h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Reliability Rating</p>
          <h2 className="text-3xl font-bold mt-3">
            {metrics.reliability_rating || "-"}
          </h2>
        </div>

        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Security Rating</p>
          <h2 className="text-3xl font-bold mt-3">
            {metrics.security_rating || "-"}
          </h2>
        </div>
      </div>
    </div>
  );
}
