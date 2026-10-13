import { useEffect, useState } from "react";

/**
 * Home.jsx — public landing page.
 * Single sign-in entry point (top-right), no signup — matches the
 * "admin creates every account" auth model.
 *
 * Fonts (Tailwind v4 — this project has no tailwind.config.js, theming
 * lives in src/index.css). Add the two <link> tags to index.html <head>,
 * and inside the existing @theme inline { ... } block in index.css add:
 *   --font-serif: 'Newsreader', serif;
 *   --font-mono: '"JetBrains Mono"', monospace;
 * That's it — the font-serif / font-mono classes below then resolve
 * correctly. See the chat for the exact snippet if you need it again.
 */

const PERIODS = ["P1", "P2", "P3", "P4", "P5"];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const SUBJECTS = ["DS", "OS", "DBMS", "CN", "ML", "TOC", "OOPS", "CD", "AI", "SE", "CA", "DAA", "WT", "MP", "LAB"];

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useSolvingGrid() {
  const total = PERIODS.length * DAYS.length;
  const [filled, setFilled] = useState(() => Array(total).fill(null));
  const [status, setStatus] = useState("assigning slots…");
  const [count, setCount] = useState(0);

  // NOTE: no "already running" ref guard here on purpose. React 19's
  // StrictMode runs this effect twice in dev (mount → cleanup → mount)
  // to surface exactly the kind of bug a shared ref guard causes: the
  // first (throwaway) run sets the guard before the second (real) run
  // gets a chance to start, so the real loop never executes. Relying
  // only on the per-effect `cancelled` closure, and checking it right
  // after every await (before touching state), makes the throwaway
  // run a true no-op and lets the real run proceed normally — correct
  // in both dev (StrictMode) and production (effect runs once).
  useEffect(() => {
    let cancelled = false;

    async function run() {
      while (!cancelled) {
        const order = shuffle([...Array(total).keys()]);
        const codes = shuffle(SUBJECTS.concat(SUBJECTS).slice(0, total));
        setFilled(Array(total).fill(null));
        setCount(0);
        setStatus("assigning slots…");

        for (let i = 0; i < order.length; i++) {
          await new Promise((res) => setTimeout(res, 55));
          if (cancelled) return;
          setFilled((prev) => {
            const next = prev.slice();
            next[order[i]] = codes[i];
            return next;
          });
          setCount(i + 1);
        }

        setStatus("no conflicts found");
        await new Promise((res) => setTimeout(res, 2200));
        if (cancelled) return;
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [total]);

  return { filled, status, count, total };
}

export default function Home({ onSignIn = () => {} }) {
  const { filled, status, count, total } = useSolvingGrid();

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[#1E2233]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[#E7E2D6] bg-[#FFFDF8]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-8 py-[18px]">
          <div className="flex items-center gap-2.5 font-mono text-sm tracking-wide">
            <span className="h-[9px] w-[9px] rounded-sm bg-[#F2A93B]" />
            TIMETABLE.GEN
          </div>
          <button
            onClick={onSignIn}
            className="rounded-md border border-[#E7E2D6] px-5 py-2.5 text-sm font-medium transition-colors hover:border-[#B8791A] hover:text-[#B8791A]"
          >
            Sign in
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-8">
        {/* Hero */}
        <section className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-[0.85fr_1.15fr] md:gap-10 md:py-20">
          <div>
            <div className="mb-[22px] flex items-center gap-2.5 font-mono text-[13px] text-[#6B7180]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#F2A93B]" />
              Constraint solver active
            </div>

            <h1 className="mb-[22px] max-w-[12ch] font-serif text-[clamp(38px,5vw,58px)] font-medium leading-[1.08] tracking-tight text-[#1E2233]">
              Automatic Timetable Generator
            </h1>

            <p className="mb-8 max-w-[46ch] text-[17px] leading-relaxed text-[#565C6B]">
              Feed in your branches, sections, faculty and rooms. The engine
              resolves every clash — faculty double-bookings, room
              conflicts, lab subgroup overlaps — before a single class is
              placed.
            </p>

            <div className="flex flex-wrap gap-3.5">
              <a
                href="#process"
                className="inline-block rounded-md border border-[#E7E2D6] px-6 py-3 text-[15px] font-medium transition-colors hover:border-[#C9C0A8]"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Live-solving grid demo */}
          <div className="rounded-[10px] border border-[#E7E2D6] bg-white p-[22px] font-mono shadow-[0_1px_3px_rgba(30,34,51,0.06)]">
            <div className="mb-4 flex items-center justify-between text-xs text-[#6B7180]">
              <span>CSE · SEM 5 · SECTION A</span>
              <span className="flex items-center gap-[7px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F2A93B]" />
                solving…
              </span>
            </div>

            <div className="grid grid-cols-[44px_repeat(5,1fr)] gap-1">
              <div />
              {DAYS.map((d) => (
                <div key={d} className="px-0.5 py-1.5 text-center text-[11px] tracking-wide text-[#6B7180]">
                  {d}
                </div>
              ))}

              {PERIODS.map((p, r) => (
                <>
                  <div key={p} className="py-1.5 pr-1.5 text-right text-[10px] text-[#6B7180]">
                    {p}
                  </div>
                  {DAYS.map((_, c) => {
                    const idx = r * DAYS.length + c;
                    const value = filled[idx];
                    return (
                      <div
                        key={idx}
                        className={[
                          "flex aspect-[1.35] items-center justify-center rounded border text-[11px] font-semibold transition-all duration-300",
                          value
                            ? "scale-100 border-[#F2A93B] bg-[#F2A93B]/15 text-[#1E2233] opacity-100"
                            : "scale-90 border-[#E7E2D6] opacity-0",
                        ].join(" ")}
                      >
                        {value ?? ""}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>

            <div className="mt-3.5 flex justify-between text-[11px] text-[#6B7180]">
              <span>{status}</span>
              <span>{count} / {total} placed</span>
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="border-t border-[#E7E2D6] py-[70px]">
          <div className="mb-11 max-w-[52ch]">
            <h2 className="mb-2.5 font-serif text-[28px] font-medium text-[#1E2233]">
              From raw data to a conflict-free week
            </h2>
            <p className="text-[15px] leading-relaxed text-[#565C6B]">
              Three stages take you from department structure to a
              timetable every faculty member and section can rely on.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-[#E7E2D6] bg-[#E7E2D6] md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Define your structure",
                body: "Branches, sections, subjects, faculty and rooms — set up once, reordered and edited without breaking anything downstream.",
              },
              {
                num: "02",
                title: "Let the solver run",
                body: "A constraint model checks every faculty, room and lab-subgroup pairing simultaneously, not slot by slot.",
              },
              {
                num: "03",
                title: "Review and deliver",
                body: "Inspect the generated week, export to PDF or Excel, and push updates out the moment something changes.",
              },
            ].map((s) => (
              <div key={s.num} className="bg-white p-7">
                <div className="mb-3.5 font-mono text-xs font-semibold text-[#B8791A]">{s.num}</div>
                <h3 className="mb-2 text-[17px] font-semibold text-[#1E2233]">{s.title}</h3>
                <p className="text-sm leading-relaxed text-[#565C6B]">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[#E7E2D6] py-[26px]">
        <div className="mx-auto flex max-w-6xl justify-center px-8 text-[13px] text-[#6B7180]">
          <span className="font-mono">v0.1 · Phase 1</span>
        </div>
      </footer>
    </div>
  );
}