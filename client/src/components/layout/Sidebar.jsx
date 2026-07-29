// client/src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  MdDashboard,
  MdShowChart,
  MdPerson,
  MdChevronLeft,
  MdChevronRight,
  MdShield,
} from "react-icons/md";
import { SiJenkins } from "react-icons/si";
import { SiGrafana } from "react-icons/si";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { path: "/security", label: "Security", icon: MdShield },
  { path: "/jenkins", label: "Jenkins", icon: SiJenkins },
  { path: "/grafana ", label: "Grafana", icon: SiGrafana },
  { path: "/metrics", label: "Metrics", icon: MdShowChart },
  { path: "/profile", label: "Profile", icon: MdPerson },
];

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <aside
      className={`relative z-10 flex flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300 ${
        isOpen ? "w-60" : "w-16"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        {isOpen && (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <MdShield size={18} />
            </span>
            <span className="whitespace-nowrap text-sm font-semibold text-white">
              DevSecOps Control
            </span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          {isOpen ? <MdChevronLeft size={20} /> : <MdChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 ${
                isActive
                  ? "bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-400/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {isOpen && (
              <span className="text-sm font-medium whitespace-nowrap">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Version badge at bottom */}
      {isOpen && (
        <div className="border-t border-white/10 p-4">
          <span className="text-xs text-slate-500">
            v{import.meta.env.VITE_APP_VERSION}
          </span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
