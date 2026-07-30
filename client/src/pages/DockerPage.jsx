import { useEffect, useState ,useMemo} from "react";
import api from "../api/axios";
import { FaDocker, FaPlayCircle, FaStopCircle, FaCube } from "react-icons/fa";

export default function DockerPage() {
  const [containers, setContainers] = useState([]);

  const runningContainers = useMemo(
    () => containers.filter((c) => c.state === "running").length,
    [containers],
  );

  const exitedContainers = useMemo(
    () => containers.filter((c) => c.state !== "running").length,
    [containers],
  );

  const images = useMemo(
    () => [...new Set(containers.map((c) => c.image))],
    [containers],
  );

  useEffect(() => {
    api.get("/docker/containers").then((res) => {
      setContainers(res.data.containers);
    });
  }, []);

  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Docker Container Monitoring</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#121A2B] rounded-xl p-6 border border-slate-700">
          <FaPlayCircle className="text-green-500 text-3xl mb-3" />
          <h3 className="text-slate-400">Running</h3>
          <p className="text-3xl font-bold">{runningContainers}</p>
        </div>

        <div className="bg-[#121A2B] rounded-xl p-6 border border-slate-700">
          <FaStopCircle className="text-red-500 text-3xl mb-3" />
          <h3 className="text-slate-400">Exited</h3>
          <p className="text-3xl font-bold">{exitedContainers}</p>
        </div>

        <div className="bg-[#121A2B] rounded-xl p-6 border border-slate-700">
          <FaDocker className="text-blue-500 text-3xl mb-3" />
          <h3 className="text-slate-400">Containers</h3>
          <p className="text-3xl font-bold">{containers.length}</p>
        </div>

        <div className="bg-[#121A2B] rounded-xl p-6 border border-slate-700">
          <FaCube className="text-purple-500 text-3xl mb-3" />
          <h3 className="text-slate-400">Images</h3>
          <p className="text-3xl font-bold">{images.length}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {containers.map((container) => (
          <div
            key={container.id}
            className="bg-[#121A2B] rounded-2xl border border-slate-700 p-6 hover:border-blue-500 transition-all duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{container.name}</h2>

                <p className="text-slate-400 mt-1 break-all">
                  {container.image}
                </p>
              </div>

              <FaDocker className="text-blue-400" size={38} />
            </div>

            <div className="mt-5 flex justify-between items-center">
              <span
                className={`px-3 py-1 rounded-full font-medium ${
                  container.state === "running" ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {container.state}
              </span>

              <span className="text-slate-400 text-sm">{container.status}</span>
            </div>

            <div className="mt-6 border-t border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Container ID</span>

                <span>{container.id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Restart Count</span>

                <span>{container.restartCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
