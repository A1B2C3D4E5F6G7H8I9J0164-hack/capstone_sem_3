"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";
import { Search, Plus, Loader2, Sparkles, ListChecks, ChevronLeft, ChevronRight, FileText, Filter, ArrowUpDown, X } from "lucide-react";

const API_BASE = "https://capstone-backend-3-jthr.onrender.com/api";

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("createdAt_desc");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    subject: "",
    tags: "",
    content: "",
  });

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Redirect to Login if no token
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
    }
  }, [router]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`${API_BASE}/notes?${params.toString()}`, {
        headers,
      });

      if (!res.ok) {
        console.error("Failed to fetch notes", res.status);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data.notes) ? data.notes : [];
      setNotes(items);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
      if (items.length > 0 && !selectedNoteId) {
        setSelectedNoteId(items[0]._id);
      }
    } catch (err) {
      console.error("Error fetching notes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNotes();
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;

      const body = {
        title: createForm.title,
        content: createForm.content,
        subject: createForm.subject || undefined,
        tags: createForm.tags
          ? createForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : undefined,
      };

      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        alert(errData.message || "Failed to create note");
        return;
      }

      const newNote = await res.json();
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote._id);
      setCreateForm({ title: "", subject: "", tags: "", content: "" });
      setIsCreateOpen(false);
    } catch (err) {
      console.error("Error creating note:", err);
      alert("Network error while creating note");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedNote = useMemo(
    () => notes.find((n) => n._id === selectedNoteId) || null,
    [notes, selectedNoteId]
  );

  const filteredNotes = useMemo(
    () =>
      notes.filter((note) =>
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase()) ||
        (note.subject && note.subject.toLowerCase().includes(search.toLowerCase()))
      ),
    [notes, search]
  );

  const handleGenerateQuiz = async () => {
    if (!selectedNote) return;
    try {
      setIsGeneratingQuiz(true);
      setQuizQuestions([]);
      setQuizAnswers({});
      setQuizResult(null);
      const headers = getAuthHeaders();
      if (!headers.Authorization) return;

      const res = await fetch(`${API_BASE}/notes/${selectedNote._id}/quiz`, {
        method: "POST",
        headers,
        body: JSON.stringify({ questionCount: 5 }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        alert(data.message || "Failed to generate quiz");
        return;
      }

      setQuizQuestions(Array.isArray(data.questions) ? data.questions : []);
    } catch (err) {
      console.error("Error generating quiz:", err);
      alert("Network error while generating quiz");
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizSubmit = () => {
    if (quizQuestions.length === 0) return;
    
    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    
    setQuizResult({
      correct,
      total: quizQuestions.length,
      score: Math.round((correct / quizQuestions.length) * 100)
    });
  };

  return (
    <div className="relative min-h-screen bg-[#030303] dark:bg-[#030303] bg-white text-white dark:text-white overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/95 dark:from-black/30 dark:via-black/70 dark:to-black/95" />

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50 dark:text-white/50">Workspace</p>
            <h1 className="text-3xl font-semibold tracking-tight mt-1 text-gray-900 dark:text-white">Notes & Quizzes</h1>
            <p className="text-white/60 dark:text-white/60 text-sm mt-1">
              Capture notes, search quickly, and generate practice quizzes powered by AI.
            </p>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <div className="flex items-center gap-2 flex-1 md:flex-none rounded-full border border-white/15 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-1.5">
              <Search className="h-4 w-4 text-gray-400 dark:text-white/40" />
              <input
                type="text"
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent placeholder:text-gray-400 dark:placeholder:text-white/40 text-gray-900 dark:text-white text-sm outline-none flex-1 w-20 md:w-auto"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-white/15 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-1.5 text-sm text-gray-900 dark:text-white/80 outline-none"
            >
              <option value="createdAt_desc">Newest</option>
              <option value="createdAt_asc">Oldest</option>
              <option value="title_asc">Title A–Z</option>
              <option value="title_desc">Title Z–A</option>
            </select>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-white/60">
              <Filter className="h-4 w-4" />
              Sort
            </div>
          </form>
        </motion.div>

        <section className="grid gap-6 md:grid-cols-3">
          {/* Notes list & create */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1 rounded-3xl border border-white/10 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl p-5 flex flex-col gap-4 max-h-[70vh]"
          >
            <button
              type="button"
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-white text-black dark:text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 dark:hover:bg-white/90 transition"
            >
              <Plus className="h-4 w-4" />
              New Note
            </button>

            {isCreateOpen && (
              <form onSubmit={handleCreateNote} className="space-y-3 text-sm">
                <input
                  type="text"
                  required
                  placeholder="Title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full rounded-xl border border-white/15 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 outline-none"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Write your note here..."
                  value={createForm.content}
                  onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                  className="w-full rounded-xl border border-white/15 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 outline-none resize-none"
                />
                <input
                  type="text"
                  placeholder="Subject (optional)"
                  value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                  className="w-full rounded-xl border border-white/15 dark:border-white/15 bg-white/90 dark:bg-black/40 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/40 outline-none"
                />
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-white dark:bg-white text-black dark:text-black px-4 py-2 font-semibold hover:bg-white/90 dark:hover:bg-white/90 transition disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isSaving ? "Saving..." : "Save Note"}</span>
                </button>
              </form>
            )}

            <div className="mt-1 flex-1 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center h-24 text-gray-500 dark:text-white/60 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading notes...
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-white/60 text-sm py-8">
                  <p className="font-medium">No notes found</p>
                  <p className="text-xs mt-1 text-gray-400 dark:text-white/40">
                    {search ? "Try a different search term" : "Create your first note to get started"}
                  </p>
                </div>
              ) : (
                filteredNotes.map((note) => (
                  <button
                    key={note._id}
                    onClick={() => {
                      setSelectedNoteId(note._id);
                      setQuizQuestions([]);
                    }}
                    className={`w-full text-left rounded-2xl border px-3 py-2 text-sm mb- transition ${
                      note._id === selectedNoteId
                        ? "border-white/50 dark:border-white/50 bg-white/15 dark:bg-white/15"
                        : "border-white/10 dark:border-white/10 bg-gray-100 dark:bg-black/30 hover:bg-gray-200 dark:hover:bg-black/40"
                    }`}
                  >
                    <p className="font-medium truncate text-gray-900 dark:text-white">{note.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-white/50 truncate mt-0.5">
                      {note.subject || "General"}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 dark:text-white/50 border border-white/15 dark:border-white/15 rounded-full px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="pt-2 flex items-center justify-between text-xs text-gray-600 dark:text-white/60">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-white/20 px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-white/40 transition"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 dark:border-white/20 px-2 py-1 disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-400 dark:hover:border-white/40 transition"
                >
                  Next
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Note detail & quiz */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2 rounded-3xl border border-white/10 dark:border-white/10 bg-white/10 dark:bg-white/5 backdrop-blur-xl p-6 flex flex-col gap-4 max-h-[70vh]"
          >
            {selectedNote ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5 text-indigo-500 dark:text-indigo-300" />
                      {selectedNote.title}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-white/50 mt-0.5">
                      {selectedNote.subject || "General"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={handleGenerateQuiz}
                      disabled={isGeneratingQuiz}
                      className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-white text-black dark:text-black px-4 py-1.5 font-semibold hover:bg-white/90 dark:hover:bg-white/90 transition disabled:opacity-50 text-xs"
                    >
                      {isGeneratingQuiz ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                      <span>{isGeneratingQuiz ? "Generating..." : "Generate Quiz"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-white/10 dark:border-white/10 bg-white/90 dark:bg-black/40 p-4 text-sm leading-relaxed">
                  <pre className="whitespace-pre-wrap text-gray-800 dark:text-white/80">
                    {selectedNote.content}
                  </pre>
                </div>

                <div className="rounded-2xl border border-white/10 dark:border-white/10 bg-white/90 dark:bg-black/40 p-4 text-sm max-h-64 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <ListChecks className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500 dark:text-white/50">
                      Quiz
                    </p>
                  </div>
                  {quizResult && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-300 mb-2">
                      You scored {quizResult.correct}/{quizResult.total}.
                    </p>
                  )}
                  {isGeneratingQuiz ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating quiz from note content...</span>
                    </div>
                  ) : quizQuestions.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-white/50">
                      Click &quot;Generate Quiz&quot; to create a quiz from this note.
                    </p>
                  ) : (
                    <ol className="space-y-4 list-decimal list-inside">
                      {quizQuestions.map((q, idx) => (
                        <li key={idx} className="space-y-1">
                          <p className="font-medium">{q.question}</p>
                          <ul className="space-y-1 ml-1 text-sm">
                            {q.options.map((opt, i) => (
                              <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-white/80">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`question-${idx}`}
                                    value={i}
                                    checked={quizAnswers[idx] === i}
                                    onChange={() => setQuizAnswers({ ...quizAnswers, [idx]: i })}
                                    className="w-3 h-3 text-indigo-500 border-gray-300 dark:border-white/30 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                                  />
                                  <span className="text-[11px] uppercase tracking-[0.25em] text-gray-500 dark:text-white/40">
                                    {String.fromCharCode(65 + i)}
                                  </span>
                                  <span>{opt}</span>
                                </label>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                      <li className="list-none mt-2">
                        <button
                          type="button"
                          onClick={handleQuizSubmit}
                          className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-white text-black dark:text-black px-4 py-1.5 font-semibold hover:bg-white/90 dark:hover:bg-white/90 transition text-xs"
                        >
                          Submit Quiz
                        </button>
                      </li>
                    </ol>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-white/60 text-sm">
                <p>Select or create a note to view details and generate a quiz.</p>
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
