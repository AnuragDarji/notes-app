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

        /* ── Light theme (default) ── */
        :root {
          --bg-page:        #f7f5f0;
          --bg-surface:     #ffffff;
          --bg-subtle:      #f0ede6;
          --bg-input:       #faf9f6;
          --text-primary:   #1a1a1a;
          --text-secondary: #555555;
          --text-muted:     #9b9186;
          --text-faint:     #bbbbbb;
          --border:         #e8e3d8;
          --border-soft:    #e0dbd0;
          --accent:         #b45309;
          --accent-light:   #fef3c7;
          --hero-bg:        #1a1a1a;
          --hero-grid:      rgba(255,255,255,0.065);
          --hero-glow:      rgba(180,83,9,0.22);
          --hero-tag-bg:    rgba(255,255,255,0.07);
          --hero-tag-bd:    rgba(255,255,255,0.10);
          --hero-tag-txt:   rgba(255,255,255,0.40);
          --hero-sub-txt:   rgba(255,255,255,0.35);
          --stat-bg:        rgba(255,255,255,0.05);
          --stat-bd:        rgba(255,255,255,0.08);
          --stat-num:       #ffffff;
          --stat-label:     rgba(255,255,255,0.28);
          --topbar-bg:      rgba(247,245,240,0.88);
          --logo-icon-bg:   #1a1a1a;
          --logo-icon-str:  #ffffff;
          --logo-text:      #1a1a1a;
          --logo-em:        #b45309;
          --status-dot:     #22c55e;
          --status-shadow:  rgba(34,197,94,0.22);
          --max-w:          1100px;
        }

        /* ── Dark theme ── */
        html[data-theme="dark"] {
          --bg-page:        #131110;
          --bg-surface:     #1e1b17;
          --bg-subtle:      #282420;
          --bg-input:       #1a1714;
          --text-primary:   #edeae4;
          --text-secondary: #a09488;
          --text-muted:     #706860;
          --text-faint:     #504840;
          --border:         #2e2924;
          --border-soft:    #332e28;
          --accent:         #f6c05a;
          --accent-light:   #3d2e08;
          --hero-bg:        #0c0b09;
          --hero-grid:      rgba(255,255,255,0.03);
          --hero-glow:      rgba(246,192,90,0.10);
          --hero-tag-bg:    rgba(255,255,255,0.04);
          --hero-tag-bd:    rgba(255,255,255,0.07);
          --hero-tag-txt:   rgba(255,255,255,0.30);
          --hero-sub-txt:   rgba(255,255,255,0.28);
          --stat-bg:        rgba(255,255,255,0.03);
          --stat-bd:        rgba(255,255,255,0.06);
          --stat-num:       #edeae4;
          --stat-label:     rgba(255,255,255,0.22);
          --topbar-bg:      rgba(19,17,16,0.90);
          --logo-icon-bg:   #2a2620;
          --logo-icon-str:  #edeae4;
          --logo-text:      #edeae4;
          --logo-em:        #f6c05a;
          --status-dot:     #22c55e;
          --status-shadow:  rgba(34,197,94,0.18);
        }

        html, body {
          background: var(--bg-page);
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
          transition: background 0.25s ease, color 0.25s ease;
        }

        /* ── Topbar ── */
        .topbar {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--topbar-bg);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border);
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          transition: background 0.25s ease, border-color 0.25s ease;
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
          background: var(--logo-icon-bg);
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 0.25s ease;
        }
        .topbar-logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 1.25rem;
          color: var(--logo-text);
          letter-spacing: -0.01em;
          transition: color 0.25s ease;
        }
        .topbar-logo-text em {
          font-style: italic;
          color: var(--logo-em);
          transition: color 0.25s ease;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .topbar-date {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: none;
          transition: color 0.25s ease;
        }
        @media (min-width: 600px) { .topbar-date { display: block; } }

        .topbar-status {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          transition: color 0.25s ease;
        }
        .status-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--status-dot);
          box-shadow: 0 0 0 2.5px var(--status-shadow);
          flex-shrink: 0;
        }

        /* ── Hero ── */
        .hero {
          background: var(--hero-bg);
          position: relative;
          overflow: hidden;
          padding: 3.5rem 2rem 3rem;
          transition: background 0.25s ease;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 72% 60%, var(--hero-glow) 0%, transparent 65%);
          pointer-events: none;
          transition: background 0.25s ease;
        }
        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, var(--hero-grid) 1px, transparent 1px);
          background-size: 26px 26px;
          pointer-events: none;
          transition: background-image 0.25s ease;
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
          background: var(--hero-tag-bg);
          border: 1px solid var(--hero-tag-bd);
          border-radius: 99px;
          padding: 0.28rem 0.75rem;
          font-size: 0.7rem;
          color: var(--hero-tag-txt);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-bottom: 1rem;
          transition: background 0.25s ease, color 0.25s ease;
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
          color: var(--hero-sub-txt);
          margin-top: 0.7rem;
          font-weight: 300;
          line-height: 1.65;
          transition: color 0.25s ease;
        }

        .hero-stats {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }
        .stat-card {
          background: var(--stat-bg);
          border: 1px solid var(--stat-bd);
          border-radius: 14px;
          padding: 1rem 1.5rem;
          text-align: center;
          min-width: 90px;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .stat-card-num {
          font-family: 'Instrument Serif', serif;
          font-size: 2.2rem;
          color: var(--stat-num);
          line-height: 1;
          transition: color 0.25s ease;
        }
        .stat-card-label {
          font-size: 0.67rem;
          color: var(--stat-label);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          margin-top: 0.3rem;
          transition: color 0.25s ease;
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
              <svg width="16" height="16" fill="none" stroke="var(--logo-icon-str)" strokeWidth="2.2" viewBox="0 0 24 24">
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
