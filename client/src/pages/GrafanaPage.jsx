import React, { useEffect, useState } from "react";
import api from "../api/axios";

export default function GrafanaPage() {
  const [uid, setUid] = useState(localStorage.getItem("grafanaUid") || "");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState("");

  const saveUid = () => {
    if (!uid.trim()) {
      alert("Please enter the Grafana Dashboard UID.");
      return;
    }

    localStorage.setItem("grafanaUid", uid.trim());
  };

  useEffect(() => {
    if (!uid) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const { data } = await api.get(`/grafana/dashboard/${uid}`);

        console.log(data);

        setDashboard(data.dashboard);
        setSlug(data.meta.slug);
        console.log("Dashboard UID:", data.dashboard.uid);
console.log("Slug:", data.meta.slug);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to fetch Grafana Dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [uid]);

  if (!uid) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-white mb-4">
            Grafana Dashboard
          </h2>

          <p className="text-slate-400 mb-5">
            Enter your Grafana Dashboard UID.
          </p>

          <input
            type="text"
            value={uid}
            placeholder="Example: ce4rjk7yohogwd"
            onChange={(e) => setUid(e.target.value)}
            className="w-full bg-[#0B1120] border border-slate-700 rounded-lg p-3 text-white"
          />

          <button
            onClick={saveUid}
            className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold"
          >
            Save Dashboard UID
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-white text-xl">
        Loading Grafana Dashboard...
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

  return (
    <div className="p-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{dashboard?.title}</h1>

          <p className="text-slate-400 mt-2">
            Dashboard UID:
            <span className="text-white ml-2">{uid}</span>
          </p>
        </div>

        <button
          onClick={() =>
            window.open(`http://localhost/grafana/d/${uid}`, "_blank")
          }
          className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg font-semibold"
        >
          Open Grafana
        </button>
      </div>

      {/* Panels */}
      <div className="bg-[#121A2B] border border-slate-700 rounded-xl overflow-hidden">
  <iframe
    title="Grafana Dashboard"
    src={`http://localhost/grafana/d/${dashboard?.uid}/${slug}?orgId=1&theme=dark`}
    width="100%"
    height="900"
    frameBorder="0"
    className="rounded-xl"
  />
</div>
    </div>
  );
}
