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

const NotesClient = ({ initialNotes }: NotesClientProps) => {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Close modal on Escape key
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
    setLoading(true);
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
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
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
    }
  };

  const updateNote = async (id: string) => {
    if (!editTitle.trim() || !editContent.trim()) return;
    setLoading(true);
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
      setLoading(false);
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

  const getCardAccent = (index: number) => {
    const accents = [
      "before:bg-amber-400",
      "before:bg-sky-400",
      "before:bg-emerald-400",
      "before:bg-rose-400",
      "before:bg-violet-400",
      "before:bg-orange-400",
    ];
    return accents[index % accents.length];
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        .notes-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          background: #f7f5f0;
          padding: 2.5rem 1.5rem;
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
          color: #1a1a1a;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .notes-title span {
          font-style: italic;
          color: #b45309;
        }

        .btn-new {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #1a1a1a;
          color: #f7f5f0;
          border: none;
          padding: 0.65rem 1.3rem;
          border-radius: 99px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          white-space: nowrap;
        }
        .btn-new:hover { background: #333; transform: translateY(-1px); }
        .btn-new svg { flex-shrink: 0; }

        .search-bar {
          width: 100%;
          max-width: 420px;
          position: relative;
          margin-bottom: 2rem;
        }
        .search-bar input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.6rem;
          border: 1.5px solid #e0dbd0;
          border-radius: 99px;
          background: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1a1a1a;
          outline: none;
          transition: border-color 0.18s;
          box-sizing: border-box;
        }
        .search-bar input:focus { border-color: #b45309; }
        .search-bar svg {
          position: absolute;
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
          pointer-events: none;
        }

        .notes-meta {
          font-size: 0.82rem;
          color: #999;
          margin-bottom: 1.5rem;
          font-weight: 400;
        }

        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .note-card {
          background: #fff;
          border-radius: 16px;
          padding: 1.4rem 1.4rem 1.1rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
          position: relative;
          overflow: hidden;
          transition: transform 0.18s, box-shadow 0.18s;
          display: flex;
          flex-direction: column;
        }
        .note-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .note-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.09), 0 12px 32px rgba(0,0,0,0.07);
        }

        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
          margin-bottom: 0.6rem;
        }

        .note-card-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.2rem;
          color: #1a1a1a;
          line-height: 1.3;
          flex: 1;
        }

        .note-card-actions {
          display: flex;
          gap: 0.25rem;
          opacity: 0;
          transition: opacity 0.18s;
          flex-shrink: 0;
        }
        .note-card:hover .note-card-actions { opacity: 1; }

        .icon-btn {
          background: none;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
          color: #666;
        }
        .icon-btn:hover { background: #f0ede6; }
        .icon-btn.delete:hover { background: #fef2f2; color: #dc2626; }
        .icon-btn.edit:hover { background: #eff6ff; color: #2563eb; }

        .note-card-content {
          font-size: 0.875rem;
          color: #555;
          line-height: 1.65;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .note-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid #f0ede6;
          padding-top: 0.7rem;
          font-size: 0.75rem;
          color: #bbb;
        }

        .note-badge {
          background: #f7f5f0;
          padding: 0.2rem 0.55rem;
          border-radius: 99px;
          font-size: 0.72rem;
          color: #999;
        }

        /* Empty state */
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 5rem 2rem;
          color: #bbb;
        }
        .empty-state svg { margin: 0 auto 1rem; display: block; opacity: 0.3; }
        .empty-state p { font-size: 1rem; }
        .empty-state strong { font-family: 'Instrument Serif', serif; font-size: 1.4rem; display: block; color: #ccc; margin-bottom: 0.3rem; }

        /* Modal overlay */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 12, 8, 0.55);
          backdrop-filter: blur(4px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: fadeIn 0.18s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal-box {
          background: #fff;
          border-radius: 20px;
          padding: 2rem;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18);
          animation: slideUp 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.6rem;
          color: #1a1a1a;
        }

        .modal-close {
          background: #f0ede6;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: background 0.15s;
        }
        .modal-close:hover { background: #e5e0d6; }

        .modal-field {
          margin-bottom: 1rem;
        }
        .modal-field label {
          display: block;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: #999;
          margin-bottom: 0.4rem;
        }
        .modal-field input,
        .modal-field textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid #e0dbd0;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #1a1a1a;
          background: #faf9f6;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
          resize: vertical;
          box-sizing: border-box;
        }
        .modal-field input:focus,
        .modal-field textarea:focus {
          border-color: #b45309;
          background: #fff;
        }

        .modal-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          justify-content: flex-end;
        }

        .btn-cancel {
          background: #f0ede6;
          border: none;
          padding: 0.65rem 1.3rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          color: #666;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-cancel:hover { background: #e5e0d6; }

        .btn-save {
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.18s;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-save:hover { background: #333; }
        .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-save.green { background: #166534; }
        .btn-save.green:hover { background: #14532d; }
      `}</style>

      <div className="notes-root">
        {/* Header */}
        <div className="notes-header">
          <h1 className="notes-title">
            My <span>Notes</span>
          </h1>
          <button className="btn-new" onClick={() => setIsModalOpen(true)}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="search-bar">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Meta */}
        <p className="notes-meta">
          {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>

        {/* Notes Grid */}
        <div className="notes-grid">
          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414A1 1 0 0 1 19 9.414V19a2 2 0 0 1-2 2Z" />
              </svg>
              <strong>{searchQuery ? "No results found" : "No notes yet"}</strong>
              <p>{searchQuery ? "Try a different search term." : "Click 'New Note' to capture your first thought."}</p>
            </div>
          ) : (
            filteredNotes.map((note, index) => (
              <div key={note._id} className={`note-card ${getCardAccent(index)}`}>
                <div className="note-card-header">
                  <h3 className="note-card-title">{note.title}</h3>
                  <div className="note-card-actions">
                    <button className="icon-btn edit" onClick={() => startEdit(note)} title="Edit">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                      </svg>
                    </button>
                    <button className="icon-btn delete" onClick={() => deleteNote(note._id)} title="Delete">
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <p className="note-card-content">{note.content}</p>

                <div className="note-card-footer">
                  <span>{formatDate(note.createdAt)}</span>
                  {note.updatedAt !== note.createdAt && (
                    <span className="note-badge">Edited {formatDate(note.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">New Note</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={createNote}>
              <div className="modal-field">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="Give your note a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="modal-field">
                <label>Content</label>
                <textarea
                  placeholder="Write your thoughts here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={loading}>
                  {loading ? (
                    "Saving..."
                  ) : (
                    <>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Note
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingId && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && cancelEdit()}>
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="modal-title">Edit Note</h2>
              <button className="modal-close" onClick={cancelEdit}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="modal-field">
              <label>Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-field">
              <label>Content</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelEdit}>
                Cancel
              </button>
              <button
                className="btn-save green"
                onClick={() => updateNote(editingId)}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotesClient;