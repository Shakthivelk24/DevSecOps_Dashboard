import { useEffect, useState } from "react";
import api from "../api/axios";
import { FaServer, FaCube, FaNetworkWired, FaLayerGroup } from "react-icons/fa";
import { FaSearch, FaSyncAlt } from "react-icons/fa";
import Spinner from "../components/ui/Spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

// ADD THIS HERE
const getPodStatus = (pod) => {
  const containerStatuses = pod.status.containerStatuses || [];

  for (const container of containerStatuses) {
    const waiting = container.state?.waiting;

    if (waiting?.reason === "CrashLoopBackOff") {
      return {
        text: "CrashLoopBackOff",
        color: "bg-orange-600",
      };
    }
  }

  switch (pod.status.phase) {
    case "Running":
      return {
        text: "Running",
        color: "bg-green-600",
      };

    case "Pending":
      return {
        text: "Pending",
        color: "bg-yellow-500 text-black",
      };

    case "Failed":
      return {
        text: "Failed",
        color: "bg-red-600",
      };

    case "Succeeded":
      return {
        text: "Succeeded",
        color: "bg-blue-600",
      };

    default:
      return {
        text: pod.status.phase || "Unknown",
        color: "bg-gray-600",
      };
  }
};

export default function KubernetesPage() {
  const [cluster, setCluster] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/kubernetes/cluster").then((res) => setCluster(res.data));
  }, []);
  const filteredPods = (cluster?.pods || []).filter((pod) =>
    pod.metadata.name.toLowerCase().includes(search.toLowerCase()),
  );
  if (!cluster)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  const exportPDF = () => {
  const img = new Image();
  img.src = "/logo.png";

  img.onload = () => {
    const doc = new jsPDF();

    // Logo
    doc.addImage(img, "PNG", 14, 10, 22, 22);

    // Header
    doc.setFontSize(20);
    doc.text("DevOps Pipeline Dashboard", 42, 18);

    doc.setFontSize(14);
    doc.text("Kubernetes Cluster Report", 42, 28);

    doc.line(14, 38, 196, 38);

    doc.setFontSize(11);

    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

    doc.text(`Nodes: ${cluster.nodes.length}`, 14, 58);
    doc.text(`Pods: ${cluster.pods.length}`, 60, 58);
    doc.text(`Services: ${cluster.services.length}`, 100, 58);
    doc.text(`Deployments: ${cluster.deployments.length}`, 150, 58);

    autoTable(doc, {
      startY: 70,

      head: [["Pod Name", "Namespace", "Status"]],

      body: filteredPods.map((pod) => {
        const status = getPodStatus(pod);

        return [
          pod.metadata.name,
          pod.metadata.namespace,
          status.text,
        ];
      }),

      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },

      styles: {
        fontSize: 9,
        cellPadding: 3,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 2) {
          switch (data.cell.raw) {
            case "Running":
              data.cell.styles.fillColor = [22, 163, 74];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
              break;

            case "Pending":
              data.cell.styles.fillColor = [234, 179, 8];
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.fontStyle = "bold";
              break;

            case "Failed":
              data.cell.styles.fillColor = [220, 38, 38];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
              break;

            case "Succeeded":
              data.cell.styles.fillColor = [59, 130, 246];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
              break;

            case "CrashLoopBackOff":
              data.cell.styles.fillColor = [249, 115, 22];
              data.cell.styles.textColor = [255, 255, 255];
              data.cell.styles.fontStyle = "bold";
              break;

            default:
              data.cell.styles.fillColor = [107, 114, 128];
              data.cell.styles.textColor = [255, 255, 255];
          }
        }
      },
    });

    doc.save(
      `kubernetes-report-${new Date().toISOString().slice(0, 10)}.pdf`
    );
  };
};
  return (
    <div className="p-8 text-white">
      <h1 className="text-4xl font-bold mb-8">Kubernetes Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 hover:border-blue-500 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400">Nodes</p>
              <h2 className="text-4xl font-bold mt-2">
                {cluster.nodes.length}
              </h2>
            </div>

            <FaServer className="text-blue-400 text-4xl" />
          </div>
        </div>

        <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 hover:border-green-500 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400">Pods</p>
              <h2 className="text-4xl font-bold mt-2">{cluster.pods.length}</h2>
            </div>

            <FaCube className="text-green-400 text-4xl" />
          </div>
        </div>

        <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 hover:border-purple-500 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400">Services</p>
              <h2 className="text-4xl font-bold mt-2">
                {cluster.services.length}
              </h2>
            </div>

            <FaNetworkWired className="text-purple-400 text-4xl" />
          </div>
        </div>

        <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6 hover:border-yellow-500 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-400">Deployments</p>
              <h2 className="text-4xl font-bold mt-2">
                {cluster.deployments.length}
              </h2>
            </div>

            <FaLayerGroup className="text-yellow-400 text-4xl" />
          </div>
        </div>
      </div>

      <div className="bg-[#121A2B] rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
  <h2 className="text-2xl font-bold">Pods</h2>

  <div className="flex gap-3">
    <button
      onClick={exportPDF}
      className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
    >
      <FaFilePdf />
      Export Report
    </button>

    <button
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
    >
      <FaSyncAlt />
      Refresh
    </button>
  </div>
</div>

        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search Pods..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F172A] border border-slate-700 rounded-lg py-3 pl-12 pr-4"
          />
        </div>

        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-left">
              <th className="pb-3">Pod Name</th>

              <th className="pb-3">Namespace</th>

              <th className="pb-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredPods.length > 0 ? (
              filteredPods.map((pod) => {
                const status = getPodStatus(pod);

                return (
                  <tr
                    key={pod.metadata.uid}
                    className="bg-[#0F172A] hover:bg-[#16213A] transition-all duration-200"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <FaCube className="text-blue-400" />

                        <div>
                          <p className="font-semibold">{pod.metadata.name}</p>

                          <p className="text-xs text-slate-500">
                            {pod.metadata.uid.slice(0, 10)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="bg-slate-800 px-3 py-1 rounded-lg text-sm">
                        {pod.metadata.namespace}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${status.color}`}
                      >
                        {status.text}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-400">
                  No pods found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
