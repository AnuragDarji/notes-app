export const dynamic = 'force-dynamic';
import NotesClient from "@/components/NotesClient";
import dbConnect from "@/lib/db";
import Note from "@/models/Note";

async function getNotes() {
  await dbConnect();
  const notes = await Note.find({}).sort({ createdAt: -1 }).lean();
  return notes.map((note) => ({
    ...note,
    _id: note._id.toString(),
    createdAt: note.createdAt.toString(),
    updatedAt: note.updatedAt.toString(),
  }));
}

export default async function Home() {
  const notes = await getNotes();
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const thisWeekCount = notes.filter((n) => {
    const d = new Date(n.updatedAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cream: #f7f5f0;
          --ink: #1a1a1a;
          --amber: #b45309;
          --muted: #9b9186;
          --border: #e8e3d8;
          --max-w: 1100px;
        }

        html, body {
          background: var(--cream);
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
        }

        /* ── Topbar ── */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: rgba(247,245,240,0.88);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 2rem;
        }

        .topbar-inner {
          width: 100%;
          max-width: var(--max-w);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .topbar-logo {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }
        .topbar-logo-icon {
          width: 32px; height: 32px;
          background: var(--ink);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .topbar-logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 1.25rem;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .topbar-logo-text em {
          font-style: italic;
          color: var(--amber);
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .topbar-date {
          font-size: 0.78rem;
          color: var(--muted);
          display: none;
        }
        @media (min-width: 600px) { .topbar-date { display: block; } }

        .topbar-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--muted);
        }
        .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 2.5px rgba(34,197,94,0.22);
          flex-shrink: 0;
        }

        /* ── Hero ── */
        .hero {
          background: var(--ink);
          position: relative;
          overflow: hidden;
          padding: 3.5rem 2rem 3rem;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 72% 60%, rgba(180,83,9,0.22) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none;
        }

        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: var(--max-w);
          margin: 0 auto;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 99px;
          padding: 0.28rem 0.75rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 1rem;
        }
        .hero-tag-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #f6d28b;
          flex-shrink: 0;
        }

        .hero-heading {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2.2rem, 5vw, 3.4rem);
          color: #fff;
          letter-spacing: -0.03em;
          line-height: 1.04;
        }
        .hero-heading em {
          font-style: italic;
          color: #f6d28b;
        }
        .hero-sub {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.35);
          margin-top: 0.7rem;
          font-weight: 300;
          line-height: 1.65;
        }

        .hero-stats {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 1rem 1.5rem;
          text-align: center;
          min-width: 90px;
        }
        .stat-card-num {
          font-family: 'Instrument Serif', serif;
          font-size: 2.2rem;
          color: #fff;
          line-height: 1;
        }
        .stat-card-label {
          font-size: 0.67rem;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-top: 0.3rem;
        }

        /* ── Page content ── */
        .page-content {
          max-width: var(--max-w);
          margin: 0 auto;
          padding: 2.5rem 2rem 4rem;
        }

        @media (max-width: 520px) {
          .hero { padding: 2.5rem 1.25rem 2rem; }
          .page-content { padding: 1.75rem 1.25rem 3rem; }
          .topbar { padding: 0 1.25rem; }
          .stat-card { padding: 0.75rem 1rem; min-width: 76px; }
          .stat-card-num { font-size: 1.8rem; }
        }
      `}</style>

      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-logo">
            <div className="topbar-logo-icon">
              <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487 18.549 2.8a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
              </svg>
            </div>
            <span className="topbar-logo-text">Note<em>wise</em></span>
          </div>

          <div className="topbar-right">
            <span className="topbar-date">{today}</span>
            <div className="topbar-status">
              <div className="status-dot" />
              Connected
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              Personal workspace
            </div>
            <h1 className="hero-heading">
              Your <em>thoughts,</em><br />organised.
            </h1>
            <p className="hero-sub">
              Capture ideas, keep them close.<br />Everything you need, nothing you don't.
            </p>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-card-num">{notes.length}</div>
              <div className="stat-card-label">Total Notes</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-num">{thisWeekCount}</div>
              <div className="stat-card-label">This Week</div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <div className="page-content">
        <NotesClient initialNotes={notes} />
      </div>
    </>
  );
}