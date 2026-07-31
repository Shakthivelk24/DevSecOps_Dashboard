import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { FaDocker, FaPlayCircle, FaStopCircle, FaCube } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf, FaSearch } from "react-icons/fa";

export default function DockerPage() {
  const [containers, setContainers] = useState([]);
  const [search, setSearch] = useState("");

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
  const filteredContainers = useMemo(() => {
    return containers.filter((container) => {
      const query = search.toLowerCase();

      return (
        container.name.toLowerCase().includes(query) ||
        container.image.toLowerCase().includes(query) ||
        container.state.toLowerCase().includes(query) ||
        container.id.toLowerCase().includes(query)
      );
    });
  }, [containers, search]);
  useEffect(() => {
    api.get("/docker/containers").then((res) => {
      setContainers(res.data.containers);
    });
  }, []);
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
      doc.text("Docker Monitoring Report", 42, 28);

      doc.line(14, 38, 196, 38);

      doc.setFontSize(11);

      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 48);

      doc.text(`Running Containers: ${runningContainers}`, 14, 58);
      doc.text(`Exited Containers: ${exitedContainers}`, 70, 58);
      doc.text(`Total Containers: ${containers.length}`, 135, 58);

      doc.text(`Docker Images: ${images.length}`, 14, 68);

      autoTable(doc, {
        startY: 78,

        head: [["Container", "Image", "State", "Status", "Restart Count"]],

        body: containers.map((container) => [
          container.name,
          container.image,
          container.state,
          container.status,
          container.restartCount,
        ]),

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
            const state = String(data.cell.raw).toLowerCase();

            switch (state) {
              case "running":
                data.cell.styles.fillColor = [22, 163, 74];
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              case "exited":
                data.cell.styles.fillColor = [220, 38, 38];
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              case "paused":
                data.cell.styles.fillColor = [234, 179, 8];
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
                break;

              case "restarting":
                data.cell.styles.fillColor = [249, 115, 22];
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              case "created":
                data.cell.styles.fillColor = [59, 130, 246];
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

      doc.save(`docker-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };
  };
  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Docker Container Monitoring</h1>

        <button
          onClick={exportPDF}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-5 py-3 rounded-lg font-semibold"
        >
          <FaFilePdf />
          Export Report
        </button>
      </div>
      <div className="mb-8">
        <div className="relative">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />

          <input
            type="text"
            placeholder="Search by container name, image, state or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121A2B] border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
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
        {filteredContainers.length > 0 ? (
          filteredContainers.map((container) => (
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
                    container.state === "running"
                      ? "bg-green-600"
                      : "bg-red-600"
                  }`}
                >
                  {container.state}
                </span>

                <span className="text-slate-400 text-sm">
                  {container.status}
                </span>
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-slate-400">
            No matching containers found.
          </div>
        )}
      </div>
    </div>
  );
}
