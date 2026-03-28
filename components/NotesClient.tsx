"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesClientProps {
  initialNotes: Note[];
}

type ViewMode = "grid" | "list";
type Theme = "light" | "dark";

const NotesClient = ({ initialNotes }: NotesClientProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [creating, setCreating] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [theme, setTheme] = useState<Theme>("light");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Initialise theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("nw-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: Theme = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  // Apply theme to <html> whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nw-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsEditModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setCreating(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      const result = await response.json();
      if (result.success) {
        setNotes((prev) => [result.data, ...prev]);
        toast.success("Note created successfully");
        setTitle("");
        setContent("");
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const deleteNote = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (result.success) {
        setNotes((prev) => prev.filter((note) => note._id !== id));
        toast.success("Note deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const updateNote = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setUpdating(true);
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      const result = await response.json();
      if (result.success) {
        setNotes((prev) =>
          prev.map((note) => (note._id === id ? result.data : note))
        );
        toast.success("Note updated successfully");
        setEditingId(null);
        setEditTitle("");
        setEditContent("");
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
    setIsEditModalOpen(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const ACCENTS = ["#f59e0b", "#38bdf8", "#34d399", "#fb7185", "#a78bfa", "#fb923c"];
  const getAccent = (index: number) => ACCENTS[index % ACCENTS.length];

  const EditIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
    </svg>
  );

  const TrashIcon = () => (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );

  const SunIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );

  const MoonIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ─────────────────────────────────────────
           All colours reference CSS variables set
           on <html> by page.tsx & the toggle effect
        ───────────────────────────────────────── */

        .notes-root {
          font-family: 'DM Sans', sans-serif;
          padding: 2.5rem 1.5rem;
          transition: color 0.25s ease;
        }

        .notes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .notes-title {
          font-family: 'Instrument Serif', serif;
          font-size: 2.4rem;
          color: var(--text-primary);
          letter-spacing: -0.02em;
          line-height: 1.1;
          transition: color 0.25s ease;
        }
        .notes-title span { font-style: italic; color: var(--accent); transition: color 0.25s ease; }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--text-primary);
          color: var(--bg-page);
          border: none;
          padding: 0.65rem 1.3rem;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, color 0.18s, transform 0.12s;
          white-space: nowrap;
        }
        .btn-new:hover { opacity: 0.85; transform: translateY(-1px); }

        /* ── Toolbar ── */
        .toolbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .search-bar {
          flex: 1;
          min-width: 180px;
          max-width: 420px;
          position: relative;
        }
        .search-bar input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.6rem;
          border: 1.5px solid var(--border-soft);
          border-radius: 99px;
          background: var(--bg-surface);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: var(--text-primary);
          outline: none;
          transition: border-color 0.18s, background 0.25s ease, color 0.25s ease;
          box-sizing: border-box;
        }
        .search-bar input::placeholder { color: var(--text-muted); }
        .search-bar input:focus { border-color: var(--accent); }
        .search-bar .search-icon {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          transition: color 0.25s ease;
        }

        /* ── View toggle ── */
        .view-toggle {
          display: flex;
          align-items: center;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-soft);
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
          flex-shrink: 0;
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        .view-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          background: transparent;
          color: var(--text-faint);
          transition: background 0.15s, color 0.15s;
        }
        .view-btn:hover { color: var(--text-secondary); background: var(--bg-subtle); }
        .view-btn.active { background: var(--text-primary); color: var(--bg-page); }

        /* ── Theme toggle ── */
        .theme-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: 1.5px solid var(--border-soft);
          border-radius: 10px;
          cursor: pointer;
          background: var(--bg-surface);
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: background 0.18s, border-color 0.18s, color 0.18s, transform 0.15s;
        }
        .theme-btn:hover {
          background: var(--bg-subtle);
          color: var(--accent);
          transform: rotate(15deg) scale(1.05);
        }

        /* ── Meta ── */
        .notes-meta {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          transition: color 0.25s ease;
        }

        /* ── Grid layout ── */
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        /* ── List layout ── */
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* ── Shared card base ── */
        .note-card {
          background: var(--bg-surface);
          position: relative;
          overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.2s, background 0.25s ease;
        }
        .note-card.is-deleting {
          opacity: 0.4;
          pointer-events: none;
          transform: scale(0.98) !important;
        }

        /* ── Grid card ── */
        .note-card.grid-card {
          border-radius: 16px;
          padding: 1.4rem 1.4rem 1.1rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          border: 1px solid var(--border);
        }
        html[data-theme="dark"] .note-card.grid-card {
          box-shadow: 0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2);
        }
        .note-card.grid-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--accent-color, #f59e0b);
        }
        .note-card.grid-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.09), 0 12px 32px rgba(0,0,0,0.07);
        }
        html[data-theme="dark"] .note-card.grid-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 12px 32px rgba(0,0,0,0.3);
        }

        .grid-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }
        .grid-card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.2rem;
          color: var(--text-primary);
          line-height: 1.3;
          flex: 1;
          transition: color 0.25s ease;
        }
        .grid-card-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.18s;
          flex-shrink: 0;
        }
        .note-card.grid-card:hover .grid-card-actions,
        .note-card.grid-card.is-deleting .grid-card-actions { opacity: 1; }

        .grid-card-content {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.65;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1rem;
          transition: color 0.25s ease;
        }
        .grid-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          padding-top: 0.7rem;
          font-size: 0.75rem;
          color: var(--text-faint);
          transition: border-color 0.25s ease, color 0.25s ease;
        }

        /* ── List card ── */
        .note-card.list-card {
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: row;
          align-items: stretch;
          border: 1px solid var(--border);
        }
        html[data-theme="dark"] .note-card.list-card {
          box-shadow: 0 1px 3px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.2);
        }
        .note-card.list-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          width: 3px;
          background: var(--accent-color, #f59e0b);
          border-radius: 12px 0 0 12px;
        }
        .note-card.list-card:hover {
          transform: translateX(3px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 6px 20px rgba(0,0,0,0.06);
        }
        html[data-theme="dark"] .note-card.list-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.35), 0 6px 20px rgba(0,0,0,0.25);
        }

        .list-card-inner {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1rem 0.9rem 1.25rem;
          min-width: 0;
        }
        .list-card-text { flex: 1; min-width: 0; }
        .list-card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.05rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.25s ease;
        }
        .list-card-preview {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.25s ease;
        }
        .list-card-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .list-card-date {
          font-size: 0.72rem;
          color: var(--text-faint);
          white-space: nowrap;
          transition: color 0.25s ease;
        }
        .list-card-actions {
          display: flex;
          gap: 0.2rem;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .note-card.list-card:hover .list-card-actions,
        .note-card.list-card.is-deleting .list-card-actions { opacity: 1; }

        /* ── Shared icon buttons ── */
        .icon-btn {
          background: none;
          border: none;
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          color: var(--text-secondary);
        }
        .icon-btn:hover { background: var(--bg-subtle); }
        .icon-btn.edit:hover { background: var(--accent-light); color: #2563eb; }
        html[data-theme="dark"] .icon-btn.edit:hover { color: #93c5fd; }
        .icon-btn.delete:hover { background: rgba(220,38,38,0.1); color: #dc2626; }
        html[data-theme="dark"] .icon-btn.delete:hover { background: rgba(220,38,38,0.15); color: #f87171; }
        .icon-btn:disabled { cursor: not-allowed; opacity: 0.4; }

        /* ── Shared badges ── */
        .note-badge {
          background: var(--bg-subtle);
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          font-size: 0.72rem;
          color: var(--text-muted);
          transition: background 0.25s ease, color 0.25s ease;
        }
        .deleting-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          color: #dc2626;
          font-weight: 500;
        }

        /* ── Spinner ── */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 14px; height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
          flex-shrink: 0;
          display: inline-block;
        }
        .spinner-sm { width: 12px; height: 12px; border-width: 1.5px; }

        /* ── Empty state ── */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-faint);
          transition: color 0.25s ease;
        }
        .empty-state svg { margin: 0 auto 1rem; display: block; opacity: 0.3; }
        .empty-state p { font-size: 1rem; color: var(--text-muted); }
        .empty-state strong {
          font-family: 'Instrument Serif', serif;
          font-size: 1.4rem;
          display: block;
          color: var(--text-faint);
          margin-bottom: 0.3rem;
        }

        /* ── Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,12,8,0.65);
          backdrop-filter: blur(4px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.18s ease;
        }
        html[data-theme="dark"] .modal-overlay {
          background: rgba(5,4,3,0.75);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: slideUp 0.22s cubic-bezier(0.34,1.56,0.64,1);
          transition: background 0.25s ease, border-color 0.25s ease;
        }
        html[data-theme="dark"] .modal-box {
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .modal-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.6rem;
          color: var(--text-primary);
          transition: color 0.25s ease;
        }
        .modal-close {
          background: var(--bg-subtle);
          border: none;
          width: 34px; height: 34px;
          border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: background 0.15s, color 0.15s;
        }
        .modal-close:hover { background: var(--border); }
        .modal-close:disabled { opacity: 0.4; cursor: not-allowed; }

        .modal-field { margin-bottom: 1rem; }
        .modal-field label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          margin-bottom: 0.4rem;
          transition: color 0.25s ease;
        }
        .modal-field input, .modal-field textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--border-soft);
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-input);
          outline: none;
          transition: border-color 0.18s, background 0.25s ease, color 0.25s ease;
          resize: vertical;
          box-sizing: border-box;
        }
        .modal-field input::placeholder, .modal-field textarea::placeholder {
          color: var(--text-muted);
        }
        .modal-field input:focus, .modal-field textarea:focus {
          border-color: var(--accent);
          background: var(--bg-surface);
        }
        .modal-field input:disabled, .modal-field textarea:disabled { opacity: 0.6; cursor: not-allowed; }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          justify-content: flex-end;
        }
        .btn-cancel {
          background: var(--bg-subtle);
          border: none;
          padding: 0.65rem 1.3rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-cancel:hover { background: var(--border); }
        .btn-cancel:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-save {
          background: var(--text-primary);
          color: var(--bg-page);
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.18s, background 0.25s ease, color 0.25s ease;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          min-width: 130px;
          justify-content: center;
        }
        .btn-save:hover { opacity: 0.82; }
        .btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-save.green {
          background: #166534;
          color: #fff;
        }
        .btn-save.green:hover { background: #14532d; }

        .modal-progress {
          height: 2px;
          background: var(--border);
          border-radius: 99px;
          margin-bottom: 1.25rem;
          overflow: hidden;
          transition: background 0.25s ease;
        }
        .modal-progress-bar {
          height: 100%;
          background: var(--accent);
          border-radius: 99px;
          animation: prog 1.2s ease-in-out infinite;
          transform-origin: left;
          transition: background 0.25s ease;
        }
        @keyframes prog {
          0%   { transform: translateX(-100%) scaleX(0.4); }
          50%  { transform: translateX(60%)   scaleX(0.6); }
          100% { transform: translateX(200%)  scaleX(0.4); }
        }
      `}</style>

      <div className="notes-root">
        {/* Header */}
        <div className="notes-header">
          <h1 className="notes-title">My <span>Notes</span></h1>
          <button className="btn-new" onClick={() => setIsModalOpen(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-bar">
            <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid view"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="5"  x2="21" y2="5"  strokeLinecap="round" />
                <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="3" y1="19" x2="21" y2="19" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Theme toggle */}
          <button
            className="theme-btn"
            onClick={toggleTheme}
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>

        {/* Meta */}
        <p className="notes-meta">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* ── GRID VIEW ── */}
        {viewMode === "grid" && (
          <div className="notes-grid">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2Z" />
                </svg>
                <strong>{searchQuery ? "No results found" : "No notes yet"}</strong>
                <p>{searchQuery ? "Try a different search term." : "Click 'New Note' to capture your first thought."}</p>
              </div>
            ) : filteredNotes.map((note, index) => {
              const isBeingDeleted = deletingId === note._id;
              return (
                <div
                  key={note._id}
                  className={`note-card grid-card ${isBeingDeleted ? "is-deleting" : ""}`}
                  style={{ "--accent-color": getAccent(index) } as React.CSSProperties}
                >
                  <div className="grid-card-header">
                    <h3 className="grid-card-title">{note.title}</h3>
                    <div className="grid-card-actions">
                      <button className="icon-btn edit" onClick={() => startEdit(note)} title="Edit" disabled={isBeingDeleted || !!deletingId}>
                        <EditIcon />
                      </button>
                      <button className="icon-btn delete" onClick={() => deleteNote(note._id)} title="Delete" disabled={!!deletingId}>
                        {isBeingDeleted ? <span className="spinner spinner-sm" style={{ color: "#dc2626" }} /> : <TrashIcon />}
                      </button>
                    </div>
                  </div>
                  <p className="grid-card-content">{note.content}</p>
                  <div className="grid-card-footer">
                    <span>{formatDate(note.createdAt)}</span>
                    {isBeingDeleted ? (
                      <span className="deleting-label"><span className="spinner spinner-sm" />Deleting…</span>
                    ) : note.updatedAt !== note.createdAt ? (
                      <span className="note-badge">Edited {formatDate(note.updatedAt)}</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {viewMode === "list" && (
          <div className="notes-list">
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2Z" />
                </svg>
                <strong>{searchQuery ? "No results found" : "No notes yet"}</strong>
                <p>{searchQuery ? "Try a different search term." : "Click 'New Note' to capture your first thought."}</p>
              </div>
            ) : filteredNotes.map((note, index) => {
              const isBeingDeleted = deletingId === note._id;
              return (
                <div
                  key={note._id}
                  className={`note-card list-card ${isBeingDeleted ? "is-deleting" : ""}`}
                  style={{ "--accent-color": getAccent(index) } as React.CSSProperties}
                >
                  <div className="list-card-inner">
                    <div className="list-card-text">
                      <div className="list-card-title">{note.title}</div>
                      <div className="list-card-preview">{note.content}</div>
                    </div>
                    <div className="list-card-meta">
                      {isBeingDeleted ? (
                        <span className="deleting-label"><span className="spinner spinner-sm" />Deleting…</span>
                      ) : (
                        <>
                          <span className="list-card-date">{formatDate(note.createdAt)}</span>
                          {note.updatedAt !== note.createdAt && <span className="note-badge">Edited</span>}
                        </>
                      )}
                      <div className="list-card-actions">
                        <button className="icon-btn edit" onClick={() => startEdit(note)} title="Edit" disabled={isBeingDeleted || !!deletingId}>
                          <EditIcon />
                        </button>
                        <button className="icon-btn delete" onClick={() => deleteNote(note._id)} title="Delete" disabled={!!deletingId}>
                          {isBeingDeleted ? <span className="spinner spinner-sm" style={{ color: "#dc2626" }} /> : <TrashIcon />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => !creating && e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            {creating && <div className="modal-progress"><div className="modal-progress-bar" /></div>}
            <div className="modal-header">
              <h2 className="modal-title">New Note</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)} disabled={creating}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={createNote}>
              <div className="modal-field">
                <label>Title</label>
                <input type="text" placeholder="Give your note a title..." value={title} onChange={(e) => setTitle(e.target.value)} autoFocus required disabled={creating} />
              </div>
              <div className="modal-field">
                <label>Content</label>
                <textarea placeholder="Write your thoughts here..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} required disabled={creating} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)} disabled={creating}>Cancel</button>
                <button type="submit" className="btn-save" disabled={creating}>
                  {creating ? (
                    <><span className="spinner" />Creating…</>
                  ) : (
                    <><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Create Note</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {isEditModalOpen && editingId && (
        <div className="modal-overlay" onClick={(e) => !updating && e.target === e.currentTarget && cancelEdit()}>
          <div className="modal-box">
            {updating && <div className="modal-progress"><div className="modal-progress-bar" style={{ background: "#166534" }} /></div>}
            <div className="modal-header">
              <h2 className="modal-title">Edit Note</h2>
              <button className="modal-close" onClick={cancelEdit} disabled={updating}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-field">
              <label>Title</label>
              <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus disabled={updating} />
            </div>
            <div className="modal-field">
              <label>Content</label>
              <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} disabled={updating} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelEdit} disabled={updating}>Cancel</button>
              <button className="btn-save green" onClick={() => updateNote(editingId)} disabled={updating}>
                {updating ? <><span className="spinner" />Saving…</> : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesClient;
