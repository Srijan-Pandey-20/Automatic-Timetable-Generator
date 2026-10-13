import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  CircleAlert,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { mockLoginResponse } from "../api/mockData";

/**
 * Login.jsx — single sign-in page for all roles.
 *
 * There is no role selector: the role belongs to the account, not to the
 * person signing in. Until the Django + JWT backend exists, MOCK_USERS below
 * stands in for the server's user table. When the backend is ready, delete
 * MOCK_USERS and replace the lookup in handleSubmit with the API call; the
 * response will carry { access, refresh, role, name } exactly like
 * mockLoginResponse does today.
 *
 * Demo accounts:  admin / admin123   faculty / faculty123   student / student123
 */

// Stand-in for the server-side user table (role is decided here, not by the user).
const MOCK_USERS = {
  admin: { password: "admin123", role: "admin", name: "Test Admin" },
  faculty: { password: "faculty123", role: "faculty", name: "Test Faculty" },
  student: { password: "student123", role: "student", name: "Test Student" },
};

// Floating "subject chips" for the background. Fixed values (not random)
// so the layout is stable between renders.
const CHIPS = [
  { t: "DS", l: 6, d: 26, s: 0, w: 30 },
  { t: "OS", l: 14, d: 32, s: 6, w: -20 },
  { t: "DBMS", l: 23, d: 29, s: 12, w: 25 },
  { t: "CN", l: 32, d: 34, s: 3, w: -30 },
  { t: "ML", l: 41, d: 27, s: 15, w: 20 },
  { t: "TOC", l: 50, d: 31, s: 8, w: -25 },
  { t: "AI", l: 58, d: 35, s: 1, w: 30 },
  { t: "OOPS", l: 66, d: 28, s: 10, w: -20 },
  { t: "CD", l: 74, d: 33, s: 5, w: 25 },
  { t: "SE", l: 82, d: 30, s: 14, w: -30 },
  { t: "DAA", l: 90, d: 26, s: 9, w: 20 },
  { t: "WT", l: 96, d: 34, s: 2, w: -25 },
  { t: "CA", l: 19, d: 36, s: 18, w: 20 },
  { t: "LAB", l: 70, d: 37, s: 20, w: -20 },
];

const styles = `
  @keyframes tt-rise {
    0%   { transform: translate3d(0, 0, 0); opacity: 0; }
    10%  { opacity: .85; }
    90%  { opacity: .85; }
    100% { transform: translate3d(var(--sway), -120vh, 0); opacity: 0; }
  }
  @keyframes tt-drift-a {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(60px, 40px, 0) scale(1.08); }
  }
  @keyframes tt-drift-b {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50%      { transform: translate3d(-50px, -30px, 0) scale(1.1); }
  }
  @keyframes tt-card-in {
    from { opacity: 0; transform: translateY(18px) scale(.985); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes tt-shine {
    from { transform: translateX(-120%) skewX(-20deg); }
    to   { transform: translateX(320%) skewX(-20deg); }
  }
  .tt-chip  { animation: tt-rise linear infinite; }
  .tt-blob-a { animation: tt-drift-a 16s ease-in-out infinite; }
  .tt-blob-b { animation: tt-drift-b 20s ease-in-out infinite; }
  .tt-card  { animation: tt-card-in .6s cubic-bezier(.2,.8,.2,1) both; }
  .tt-btn:hover .tt-shine { animation: tt-shine .8s ease; }
  @media (prefers-reduced-motion: reduce) {
    .tt-chip, .tt-blob-a, .tt-blob-b, .tt-card, .tt-btn:hover .tt-shine { animation: none; }
  }
`;

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* soft sunshine + cool-sky glows */}
      <div className="tt-blob-a absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-[#F2A93B]/30 blur-3xl" />
      <div className="tt-blob-b absolute -bottom-40 -right-24 h-[560px] w-[560px] rounded-full bg-[#9FD3F2]/40 blur-3xl" />
      <div className="tt-blob-a absolute right-1/4 top-1/3 h-[260px] w-[260px] rounded-full bg-[#F7D58A]/30 blur-3xl" />

      {/* timetable-style grid, faded toward the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(30,34,51,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,34,51,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 78%)",
        }}
      />

      {/* subjects drifting up like classes being scheduled */}
      {CHIPS.map((c) => (
        <span
          key={c.t + c.l}
          className="tt-chip absolute bottom-[-48px] rounded-md border border-[#E7E2D6] bg-white/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-[#1E2233]/70 shadow-sm backdrop-blur-sm"
          style={{
            left: `${c.l}%`,
            animationDuration: `${c.d}s`,
            animationDelay: `-${c.s}s`,
            "--sway": `${c.w}px`,
          }}
        >
          {c.t}
        </span>
      ))}
    </div>
  );
}

function Field({ label, icon: Icon, type = "text", value, onChange, placeholder, autoComplete, trailing }) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-[13px] font-medium text-[#1E2233]">{label}</span>
      <div className="relative">
        <Icon
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA0AE] transition-colors duration-200 group-focus-within:text-[#B8791A]"
        />
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-xl border border-[#E7E2D6] bg-white pl-11 pr-11 text-[15px] text-[#1E2233] outline-none transition-all duration-200 placeholder:text-[#B4B9C4] hover:border-[#C9C0A8] focus:border-[#F2A93B] focus:ring-4 focus:ring-[#F2A93B]/20"
        />
        {trailing}
      </div>
    </label>
  );
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    if (!username.trim() || !password) {
      setError("Please enter both your username and password.");
      return;
    }
    setError("");
    setLoading(true);

    // Short delay so the loading state is visible; replace this block with
    // the real API call when the backend exists.
    setTimeout(() => {
      const account = MOCK_USERS[username.trim().toLowerCase()];
      if (!account || account.password !== password) {
        setLoading(false);
        setError("Invalid username or password.");
        return;
      }
      login({ ...mockLoginResponse, role: account.role, name: account.name });
      navigate(`/${account.role}`);
    }, 700);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFDF8] px-4 py-10">
      <style>{styles}</style>
      <Background />

      <Link
        to="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#565C6B] transition-colors hover:bg-white/70 hover:text-[#1E2233]"
      >
        <ArrowLeft size={16} />
        Back to home
      </Link>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="tt-card relative z-10 w-full max-w-[420px] rounded-2xl border border-white/70 bg-white/80 p-8 shadow-[0_20px_60px_-15px_rgba(30,34,51,0.18)] backdrop-blur-xl sm:p-9"
      >
        <div className="mb-7">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-[13px] tracking-wide text-[#1E2233]">
            <span className="h-[9px] w-[9px] rounded-sm bg-[#F2A93B]" />
            TIMETABLE.GEN
          </div>
          <h1 className="mb-1.5 font-serif text-[32px] font-medium leading-tight tracking-tight text-[#1E2233]">
            Welcome back
          </h1>
          <p className="text-[15px] text-[#6B7180]">Sign in to your timetable workspace.</p>
        </div>

        <div className="space-y-4">
          <Field
            label="Username"
            icon={User}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            autoComplete="username"
          />

          <Field
            label="Password"
            icon={Lock}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[#9AA0AE] transition-colors hover:bg-[#F3EEDF] hover:text-[#1E2233]"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            }
          />

        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-[#F1C9C4] bg-[#FDF1EF] px-3 py-2.5 text-[13px] text-[#A23C32]"
          >
            <CircleAlert size={16} className="mt-px shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tt-btn group relative mt-6 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-[#F7B84E] to-[#F2A93B] text-[15px] font-semibold text-[#1E2233] shadow-[0_6px_16px_-4px_rgba(242,169,59,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-6px_rgba(242,169,59,0.6)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F2A93B]/40 active:translate-y-0 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:translate-y-0"
        >
          <span className="tt-shine pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-white/40" />
          {loading ? (
            <>
              <LoaderCircle size={18} className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </>
          )}
        </button>

        <p className="mt-5 text-center text-[12.5px] text-[#6B7180]">
          Accounts are issued by your institution’s administrator.
        </p>
      </form>
    </div>
  );
}