import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/ui/Spinner";

export default function SecurityPage() {
  // Saved project key
  const [projectKey, setProjectKey] = useState(
    () => localStorage.getItem("sonarProjectKey") || ""
  );

  // Input value
  const [inputProjectKey, setInputProjectKey] = useState(
    () => localStorage.getItem("sonarProjectKey") || ""
  );

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const saveProjectKey = () => {
    const key = inputProjectKey.trim();

    if (!key) {
      alert("Please enter a SonarQube Project Key.");
      return;
    }

    localStorage.setItem("sonarProjectKey", key);

    console.log(
      "Stored:",
      localStorage.getItem("sonarProjectKey")
    );

    setProjectKey(key);
  };

  const changeProjectKey = () => {
    localStorage.removeItem("sonarProjectKey");

    setProjectKey("");
    setInputProjectKey("");
    setDashboard(null);
    setError("");
  };

  useEffect(() => {
    if (!projectKey) return;

    const fetchDashboard = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const { data } = await api.get(
          `/sonarqube/dashboard/${projectKey}`
        );

        setDashboard(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Unable to fetch SonarQube data.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    fetchDashboard(true);

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 5000);

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
            Enter the SonarQube Project Key.
          </p>

          <input
            type="text"
            placeholder="Example: Secure-DevOps"
            value={inputProjectKey}
            onChange={(e) => setInputProjectKey(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#0B1120] border border-slate-700 text-white"
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
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <p className="text-red-500 text-xl">{error}</p>

        <button
          onClick={changeProjectKey}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
        >
          Change Project Key
        </button>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">
            SonarQube Dashboard
          </h1>

          <p className="text-slate-400 mt-2">
            Monitoring Project:
            <span className="text-white ml-2 font-semibold">
              {projectKey}
            </span>
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() =>
              window.open(
                `http://localhost:9000/dashboard?id=${projectKey}`,
                "_blank"
              )
            }
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            Open SonarQube
          </button>

          <button
            onClick={changeProjectKey}
            className="px-5 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
          >
            Change Key
          </button>
        </div>
      </div>

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