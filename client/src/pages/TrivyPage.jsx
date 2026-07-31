import { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FaBug,
  FaExclamationTriangle,
  FaShieldAlt,
  FaSyncAlt,
  FaSearch,
} from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import Spinner from "../components/ui/Spinner";

export default function TrivyPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [search, setSearch] = useState("");

  const fetchScan = async () => {
    if (!image.trim()) return;

    try {
      setLoading(true);

      const { data } = await api.get(
        `/trivy/scan/${encodeURIComponent(image)}`,
      );

      setReport(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScan();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  const vulnerabilities = (report?.Results || []).flatMap(
    (target) => target.Vulnerabilities || [],
  );

  const filtered = vulnerabilities.filter((item) =>
    item.PkgName.toLowerCase().includes(search.toLowerCase()),
  );
  const exportPDF = () => {
    const img = new Image();
    img.src = "/logo.png";

    img.onload = () => {
      const doc = new jsPDF();

      // Logo
      doc.addImage(img, "PNG", 14, 10, 22, 22);

      // Title
      doc.setFontSize(20);
      doc.setTextColor(30, 41, 59);
      doc.text("DevSecOps Dashboard", 42, 18);

      doc.setFontSize(14);
      doc.setTextColor(100);
      doc.text("Trivy Security Scan Report", 42, 28);

      // Divider
      doc.setDrawColor(200);
      doc.line(14, 36, 196, 36);

      // Scan Information
      doc.setFontSize(11);
      doc.setTextColor(0);

      doc.text(`Docker Image: ${report?.ArtifactName || image}`, 14, 48);

      doc.text(
        `OS: ${report?.Metadata?.OS?.Family || "-"} ${
          report?.Metadata?.OS?.Name || ""
        }`,
        14,
        56,
      );

      doc.text(
        `Scan Time: ${
          report?.CreatedAt ? new Date(report.CreatedAt).toLocaleString() : "-"
        }`,
        14,
        64,
      );

      doc.text(`Critical: ${count("CRITICAL")}`, 14, 74);
      doc.text(`High: ${count("HIGH")}`, 55, 74);
      doc.text(`Medium: ${count("MEDIUM")}`, 95, 74);
      doc.text(`Low: ${count("LOW")}`, 140, 74);

      autoTable(doc, {
        startY: 82,
        head: [["Package", "Severity", "Installed", "Fixed", "CVE"]],
        body: filtered.map((v) => [
          v.PkgName,
          v.Severity,
          v.InstalledVersion,
          v.FixedVersion || "-",
          v.VulnerabilityID,
        ]),

        styles: {
          fontSize: 8,
          cellPadding: 3,
          valign: "middle",
        },

        headStyles: {
          fillColor: [37, 99, 235], // Blue header
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },

        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },

        didParseCell: function (data) {
          // Severity column (2nd column)
          if (data.section === "body" && data.column.index === 1) {
            const severity = data.cell.raw;

            switch (severity) {
              case "CRITICAL":
                data.cell.styles.fillColor = [220, 38, 38]; // Red
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              case "HIGH":
                data.cell.styles.fillColor = [249, 115, 22]; // Orange
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              case "MEDIUM":
                data.cell.styles.fillColor = [250, 204, 21]; // Yellow
                data.cell.styles.textColor = [0, 0, 0];
                data.cell.styles.fontStyle = "bold";
                break;

              case "LOW":
                data.cell.styles.fillColor = [59, 130, 246]; // Blue
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontStyle = "bold";
                break;

              default:
                data.cell.styles.fillColor = [34, 197, 94]; // Green
                data.cell.styles.textColor = [255, 255, 255];
            }
          }
        },
      });

      doc.save(`trivy-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    };
  };
  const count = (severity) =>
    vulnerabilities.filter((v) => v.Severity === severity).length;

  return (
    <div className="p-8 text-white">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold">Trivy Security Scan</h1>

        <div className="flex gap-3">
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Enter Docker image (e.g. nginx:latest)"
            className="w-80 bg-[#121A2B] border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />

          <button
            onClick={fetchScan}
            disabled={!image.trim()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition"
          >
            <FaSyncAlt />
            Scan
          </button>
          <button
            onClick={exportPDF}
            disabled={!report}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition"
          >
            <FaFilePdf />
            Export PDF
          </button>
        </div>
      </div>
      {report && (
        <div className="mb-6 rounded-lg bg-[#121A2B] border border-slate-700 p-4">
          <p>
            <span className="text-slate-400">Image:</span>{" "}
            <span className="font-semibold">{report.ArtifactName}</span>
          </p>

          <p>
            <span className="text-slate-400">OS:</span>{" "}
            {report.Metadata?.OS?.Family} {report.Metadata?.OS?.Name}
          </p>

          <p>
            <span className="text-slate-400">Image Size:</span>{" "}
            {(report.Metadata?.Size / (1024 * 1024)).toFixed(2)} MB
          </p>

          <p>
            <span className="text-slate-400">Scanned At:</span>{" "}
            {new Date(report.CreatedAt).toLocaleString()}
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card
          title="Critical"
          value={count("CRITICAL")}
          color="red"
          icon={<FaBug />}
        />

        <Card
          title="High"
          value={count("HIGH")}
          color="orange"
          icon={<FaExclamationTriangle />}
        />

        <Card
          title="Medium"
          value={count("MEDIUM")}
          color="yellow"
          icon={<FaShieldAlt />}
        />

        <Card
          title="Low"
          value={count("LOW")}
          color="green"
          icon={<FaShieldAlt />}
        />
      </div>

      <div className="relative mb-6">
        <FaSearch className="absolute left-4 top-4 text-slate-400" />

        <input
          className="w-full bg-[#121A2B] rounded-lg border border-slate-700 py-3 pl-12 pr-4"
          placeholder="Search package..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[#121A2B] rounded-xl p-6 overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="pb-3">Package</th>

              <th className="pb-3">Severity</th>

              <th className="pb-3">Installed</th>

              <th className="pb-3">Fixed</th>

              <th className="pb-3">CVE</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length > 0 ? (
              filtered.map((vuln, index) => (
                <tr
                  key={`${vuln.VulnerabilityID}-${vuln.PkgName}-${vuln.InstalledVersion}-${index}`}
                  className="border-b border-slate-800"
                >
                  <td className="py-4">{vuln.PkgName}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        vuln.Severity === "CRITICAL"
                          ? "bg-red-600"
                          : vuln.Severity === "HIGH"
                            ? "bg-orange-600"
                            : vuln.Severity === "MEDIUM"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-600"
                      }`}
                    >
                      {vuln.Severity}
                    </span>
                  </td>

                  <td>{vuln.InstalledVersion}</td>

                  <td>{vuln.FixedVersion || "-"}</td>

                  <td>{vuln.VulnerabilityID}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No vulnerabilities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-[#121A2B] rounded-xl border border-slate-700 p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-slate-400">{title}</p>
          <h2 className="text-4xl font-bold mt-2">{value}</h2>
        </div>

        <div className="text-4xl text-blue-400">{icon}</div>
      </div>
    </div>
  );
}
