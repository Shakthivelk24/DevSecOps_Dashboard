import { useEffect, useState, useRef } from "react";
import api from "../api/axios";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

const JenkinsPage = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const [consoleLogs, setConsoleLogs] = useState("");
  const [buildDetails, setBuildDetails] = useState({});
  const [artifacts, setArtifacts] = useState([]);
  const jobName = localStorage.getItem("jobName");
  const logRef = useRef(null);

  const [inputJobName, setInputJobName] = useState(
  localStorage.getItem("jobName") || ""
);

const saveJobName = () => {
  if (!inputJobName.trim()) {
    alert("Please enter a Jenkins Job Name.");
    return;
  }

  localStorage.setItem("jobName", inputJobName.trim());
  window.location.reload();
};

if (!jobName) {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="bg-[#121A2B] border border-slate-700 rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-white mb-3">
          Jenkins Configuration
        </h2>

        <p className="text-slate-400 mb-6">
          Enter the Jenkins Pipeline / Job Name to monitor.
        </p>

        <input
          type="text"
          value={inputJobName}
          onChange={(e) => setInputJobName(e.target.value)}
          placeholder="Example: Virtual-Assistant"
          className="w-full rounded-lg bg-[#0B1120] border border-slate-700 p-3 text-white focus:outline-none focus:border-blue-500"
        />

        <button
          onClick={saveJobName}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold transition"
        >
          Save Job Name
        </button>
      </div>
    </div>
  );
}

  const fetchBuilds = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      }

      const { data } = await api.get(`/jenkins/${jobName}/builds`);

      setBuilds(data.builds);
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };
  const openJenkins = () => {
    window.open(`http://localhost:8080/job/${jobName}`, "_blank");
  };

  const fetchStages = async () => {
    try {
      const { data } = await api.get(`/jenkins/${jobName}/stages`);

      setStages(data.stages);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchConsoleLogs = async () => {
    try {
      const { data } = await api.get(`/jenkins/${jobName}/console`);

      setConsoleLogs(data.logs);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchBuildDetails = async () => {
    try {
      const { data } = await api.get(`/jenkins/${jobName}/details`);

      setBuildDetails(data.build);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArtifacts = async () => {
    try {
      const { data } = await api.get(`/jenkins/${jobName}/artifacts`);

      setArtifacts(data.artifacts);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    fetchBuilds(true);
    fetchStages();
    fetchConsoleLogs();
    fetchBuildDetails();
    fetchArtifacts();

    const interval = setInterval(() => {
      fetchBuilds(false);
      fetchStages();
      fetchConsoleLogs();
      fetchBuildDetails();
      fetchArtifacts();
    }, 5000);

    return () => clearInterval(interval);
  }, [jobName]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  return (
    <div className="min-h-screen bg-[#0B1120] text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Jenkins Builds</h1>
          <p className="text-slate-400 mt-1">
            Monitoring Job:{" "}
            <span className="text-white font-medium">{jobName}</span>
          </p>
        </div>

        <button
          onClick={openJenkins}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          Open Jenkins
        </button>
      </div>

      {/* Pipeline Stages */}
      <div className="bg-[#121A2B] rounded-xl p-6 mb-8 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Pipeline Stages</h2>
            <p className="text-slate-400 text-sm mt-1">
              Latest Pipeline Execution
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-green-600 text-sm font-medium">
            {stages.length} Stages
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center min-w-max gap-0">
            {stages.map((stage, index) => (
              <div key={index} className="flex items-center">
                {/* Stage Card */}
                <div className="w-44 h-36 bg-[#182236] border border-slate-700 rounded-xl shadow-lg hover:border-blue-500 transition-all duration-300 flex flex-col items-center justify-center p-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold
                ${
                  stage.status === "SUCCESS"
                    ? "bg-green-600"
                    : stage.status === "FAILED"
                      ? "bg-red-600"
                      : stage.status === "IN_PROGRESS"
                        ? "bg-yellow-500"
                        : "bg-slate-600"
                }`}
                  >
                    {stage.status === "SUCCESS"
                      ? "✓"
                      : stage.status === "FAILED"
                        ? "✕"
                        : "●"}
                  </div>

                  <p
                    className="mt-4 text-center font-semibold text-sm leading-5"
                    title={stage.name}
                  >
                    {stage.name}
                  </p>

                  <span
                    className={`mt-3 text-xs font-medium ${
                      stage.status === "SUCCESS"
                        ? "text-green-400"
                        : stage.status === "FAILED"
                          ? "text-red-400"
                          : stage.status === "IN_PROGRESS"
                            ? "text-yellow-400"
                            : "text-slate-400"
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>

                {/* Connector */}
                {index !== stages.length - 1 && (
                  <div className="w-16 h-[3px] bg-slate-600 mx-2 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-[#121A2B] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#182236]">
            <tr>
              <th className="p-4 text-left">Build</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Duration</th>

              <th className="p-4 text-left">Started</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : (
              builds.map((build) => (
                <tr key={build.id} className="border-b border-gray-700">
                  <td className="p-4">#{build.id}</td>

                  <td className="p-4">
                    {build.status === "SUCCESS" ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 size={18} />
                        SUCCESS
                      </span>
                    ) : build.status === "FAILURE" ? (
                      <span className="flex items-center gap-2 text-red-400">
                        <XCircle size={18} />
                        FAILURE
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-yellow-400">
                        <Clock3 size={18} />
                        RUNNING
                      </span>
                    )}
                  </td>

                  <td className="p-4">{build.duration}</td>

                  <td className="p-4">
                    {new Date(build.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold">Console Logs</h2>

          <button
            onClick={fetchConsoleLogs}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>

        <div
          ref={logRef}
          className="bg-[#0B1120] rounded-lg border border-slate-800 h-[450px] overflow-y-auto p-4"
        >
          <pre className="text-sm text-green-400 whitespace-pre-wrap font-mono">
            {consoleLogs || "No logs available."}
          </pre>
        </div>
      </div>
      <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Build Details</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#182236] rounded-lg p-4">
            <p className="text-slate-400 text-sm">Build Number</p>
            <h3 className="text-2xl font-bold mt-2">#{buildDetails.number}</h3>
          </div>

          <div className="bg-[#182236] rounded-lg p-4">
            <p className="text-slate-400 text-sm">Status</p>

            <h3 className="text-2xl font-bold mt-2 text-green-400">
              {buildDetails.result}
            </h3>
          </div>

          <div className="bg-[#182236] rounded-lg p-4">
            <p className="text-slate-400 text-sm">Agent</p>

            <h3 className="text-lg mt-2">{buildDetails.builtOn || "Master"}</h3>
          </div>

          <div className="bg-[#182236] rounded-lg p-4">
            <p className="text-slate-400 text-sm">Started</p>

            <h3 className="text-sm mt-2">
              {new Date(buildDetails.timestamp).toLocaleString()}
            </h3>
          </div>
        </div>
      </div>
      <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Artifacts</h2>

          <span className="text-slate-400">{artifacts.length} Files</span>
        </div>

        {artifacts.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            No artifacts available.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artifacts.map((artifact, index) => (
              <div
                key={index}
                className="bg-[#182236] rounded-lg p-4 border border-slate-700 hover:border-blue-500 transition"
              >
                <h3 className="font-semibold">{artifact.fileName}</h3>

                <p className="text-sm text-slate-400 mt-2">
                  {artifact.relativePath}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JenkinsPage;
