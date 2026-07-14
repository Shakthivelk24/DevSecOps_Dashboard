// client/src/pages/MetricsPage.jsx
import { useEffect, useState } from 'react';
import { MdRefresh, MdMemory, MdComputer, MdAccessTime } from 'react-icons/md';
import api from '../api/axios';
import CpuChart from '../components/charts/CpuChart';
import MemoryChart from '../components/charts/MemoryChart';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const gb = bytes / (1024 ** 3);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 ** 2)).toFixed(0)} MB`;
};

const formatUptime = (seconds) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
};

const MetricsPage = () => {
  const [live, setLive] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      const [liveRes, histRes] = await Promise.all([
        api.get('/metrics/live'),
        api.get('/metrics/history'),
      ]);
      setLive(liveRes.data.data?.metrics);
      setHistory(histRes.data.data?.history || []);
    } catch (err) {
      console.error('Metrics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Server Metrics</h2>
          <p className="text-gray-400 text-sm">Auto-refreshes every 30 seconds</p>
        </div>
        <button onClick={fetchMetrics} className="btn-secondary flex items-center gap-2 text-sm">
          <MdRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Live Stats */}
      {live && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="CPU Usage"
            value={`${live.cpu?.usage || 0}%`}
            subtitle={`${live.cpu?.cores} cores`}
            icon={MdComputer}
            color={live.cpu?.usage > 80 ? 'red' : live.cpu?.usage > 60 ? 'yellow' : 'green'}
          />
          <StatCard
            title="Memory Used"
            value={`${live.memory?.usagePercent || 0}%`}
            subtitle={`${formatBytes(live.memory?.used)} / ${formatBytes(live.memory?.total)}`}
            icon={MdMemory}
            color={live.memory?.usagePercent > 85 ? 'red' : 'blue'}
          />
          <StatCard
            title="Uptime"
            value={formatUptime(live.uptime || 0)}
            icon={MdAccessTime}
            color="green"
          />
          <StatCard
            title="Node.js"
            value={live.nodeVersion || 'N/A'}
            subtitle={`${live.platform} · ${live.arch}`}
            icon={MdComputer}
            color="cyan"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CpuChart data={history} />
        <MemoryChart data={history} />
      </div>

      {/* Server Info */}
      {live && (
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Server Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Hostname', value: live.server },
              { label: 'Platform', value: live.platform },
              { label: 'Architecture', value: live.arch },
              { label: 'Node.js', value: live.nodeVersion },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-mono text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPage;