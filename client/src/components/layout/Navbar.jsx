// client/src/components/layout/Navbar.jsx

import { MdMenu, MdPerson, MdLogout } from "react-icons/md";
import { useUser, useClerk } from "@clerk/clerk-react";

const Navbar = ({ onMenuClick }) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const handleLogout = async () => {
    try {
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Logout from Clerk
      await signOut({
        redirectUrl: "/sign-in",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 backdrop-blur-xl sm:px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <MdMenu size={22} />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-semibold text-white">
            DevSecOps Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Pipeline delivery with security posture in view
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
            <MdPerson size={16} />
          </div>

          <div className="hidden sm:block">
            <p className="text-xs font-medium text-white">
              {isLoaded
                ? user?.fullName || user?.username || "User"
                : "Loading..."}
            </p>

            <p className="text-xs text-slate-400">
              {user?.primaryEmailAddress?.emailAddress || ""}
            </p>
          </div>
        </div>

        <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:inline-flex">
          Secure access
        </span>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          <MdLogout size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;