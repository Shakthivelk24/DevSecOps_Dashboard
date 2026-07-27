import { useEffect, useState } from "react";
import api from "../api/axios";
import { CheckCircle2, XCircle, Clock3 } from "lucide-react";

const JenkinsPage = () => {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState([]);
  const jobName = localStorage.getItem("jobName");

  // Show message if no project is selected
  if (!jobName) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-[#121A2B] rounded-xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white">
            No Jenkins Job was entered.
          </h2>

          <p className="mt-3 text-slate-400">
            Please enter a Jenkins job name on the Dashboard first.
          </p>
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
  useEffect(() => {
    fetchBuilds(true);
    fetchStages();

    const interval = setInterval(() => {
      fetchBuilds(false);
      fetchStages();
    }, 5000);

    return () => clearInterval(interval);
  }, [jobName]);

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
    </div>
  );
};

export default JenkinsPage;
