import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap, LogOut, LayoutDashboard, GitBranch, Layers, BookOpen,
  Users, Building2, Cpu, CalendarDays, Circle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Picks an icon from the nav item's label, so navItems in AdminDashboard.jsx need no changes.
const ICON_RULES = [
  [/overview|dashboard|home/i, LayoutDashboard],
  [/branch/i, GitBranch],
  [/section/i, Layers],
  [/subject/i, BookOpen],
  [/faculty/i, Users],
  [/room/i, Building2],
  [/generate/i, Cpu],
  [/calendar|schedule|timetable/i, CalendarDays],
];
const iconFor = (item) =>
  item.icon ?? ICON_RULES.find(([re]) => re.test(item.label))?.[1] ?? Circle;

// Labels stay invisible (and clipped by overflow-hidden) until the sidebar is hovered or focused.
const labelCls =
  "whitespace-nowrap opacity-0 transition-opacity duration-300 delay-200 " +
  "group-hover/side:opacity-100 group-focus-within/side:opacity-100";

const rowCls =
  "flex w-full items-center gap-4 rounded-md px-2 py-3 text-sm transition-colors hover:bg-white/10";

export default function DashboardLayout({ navItems = [], roleLabel = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Used as the React key below: a new path => the wrapper re-mounts => slide-in replays.
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#FFFDF8] text-[#1E2233]">
      {/* Sidebar: mechanics from the video (60px -> 250px, 0.75s, overflow hidden) */}
      <aside
        className="group/side flex h-full w-[60px] shrink-0 flex-col justify-between overflow-hidden
                   bg-[#1E2233] px-3 py-5 text-white transition-[width] duration-[750ms] ease-in-out
                   hover:w-[250px] focus-within:w-[250px]"
      >
        <div>
          <div className="mb-2 flex items-center gap-4 border-b border-white/15 px-2 pb-4">
            <GraduationCap size={20} className="shrink-0 text-[#F2A93B]" />
            <div className={labelCls}>
              <p className="font-mono text-[13px] tracking-widest">TIMETABLE.GEN</p>
              <p className="text-xs text-white/50">{roleLabel} Panel</p>
            </div>
          </div>

          <nav>
            <ul>
              {navItems.map((item) => {
                const Icon = iconFor(item);
                return (
                  <li key={item.path} className="border-b border-white/10">
                    <NavLink
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `${rowCls} ${isActive ? "bg-white/15 text-[#F2A93B]" : "text-white/85"}`
                      }
                    >
                      <Icon size={20} className="shrink-0" />
                      <span className={labelCls}>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <button onClick={handleLogout} className={`${rowCls} text-white/85`}>
          <LogOut size={20} className="shrink-0" />
          <span className={labelCls}>Logout</span>
        </button>
      </aside>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-[#E7E2D6] bg-white px-6">
          <span className="rounded-full bg-[#F2A93B]/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#B8791A]">
            {roleLabel}
          </span>
          <span className="text-sm">
            Signed in as <span className="font-medium">{user?.name}</span>
          </span>
        </header>

        {/* Child routes render here. overflow-x-hidden hides the sideways scrollbar
            that would otherwise flash while the page slides in. */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div key={pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}