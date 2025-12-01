"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  Sparkles,
  Upload,
  Target,
  Brain,
  Calendar,
  Clock4,
  ListPlus,
  MapPin,
  Edit3,
  Check,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";

const streakData = [
  { day: "Mon", hours: 3.5, target: 4 },
  { day: "Tue", hours: 4.8, target: 5 },
  { day: "Wed", hours: 2.4, target: 4 },
  { day: "Thu", hours: 5.2, target: 5 },
  { day: "Fri", hours: 3.9, target: 4 },
  { day: "Sat", hours: 6, target: 6 },
  { day: "Sun", hours: 2, target: 3 },
];

const initialOverview = [
  { label: "Current Sprint", value: "Multi-modal Retrieval · Week 2" },
  { label: "Primary Focus", value: "Prototype refinement & latency tests" },
  { label: "Mentor Sync", value: "Elina Kapoor · Thu, 8 PM" },
];

const initialSchedules = [
  { title: "Paper Breakdown", time: "10:00 - 11:30", detail: "Survey visual-language datasets" },
  { title: "Team Sync", time: "13:00 - 13:45", detail: "Model integration checkpoints" },
  { title: "Build Sprint", time: "19:00 - 21:30", detail: "Inference pipeline review" },
];

const milestoneCards = [
  { title: "Prototype Demo", detail: "Nov 28 · XR Lab", state: "Ready" },
  { title: "Research Draft", detail: "Dec 04 · SIGED", state: "Editing" },
  { title: "Mentor Review", detail: "Dec 08 · Remote", state: "Scheduled" },
];

export default function DashboardPage() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [overview, setOverview] = useState(initialOverview);
  const [scheduleItems, setScheduleItems] = useState(initialSchedules);
  const [milestones, setMilestones] = useState(milestoneCards);
  const [user, setUser] = useState({
    name: "Aditya Rana",
    email: "aditya@learnsphere.ai",
  });

  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastActivityDate, setLastActivityDate] = useState(null);

  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isFocusRunning, setIsFocusRunning] = useState(false);

  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [isPendingTasksOpen, setIsPendingTasksOpen] = useState(false);
  const [isStreakDetailsOpen, setIsStreakDetailsOpen] = useState(false);

  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [energyGraphData, setEnergyGraphData] = useState([]);
  const [hoveredDay, setHoveredDay] = useState(null);

  const [deepWorkStats, setDeepWorkStats] = useState({
    dailyGoalMinutes: 180,
    totalFocusMinutes: 0,
    sessionCount: 0,
    averageMinutes: 0,
  });
  const [deepWorkGoalInput, setDeepWorkGoalInput] = useState(180);

  const overviewRef = useRef(null);

  const attachInputRef = useRef(null);

  const [newOverviewLabel, setNewOverviewLabel] = useState("");
  const [newOverviewValue, setNewOverviewValue] = useState("");
  const [newScheduleTime, setNewScheduleTime] = useState("");
  const [newScheduleTitle, setNewScheduleTitle] = useState("");
  const [newScheduleDetail, setNewScheduleDetail] = useState("");
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDetail, setNewMilestoneDetail] = useState("");
  const [newMilestoneState, setNewMilestoneState] = useState("");

  const aiPlaceholder = useMemo(
    () =>
      "Drop raw notes or bullet dumps.\nExample: 'Highlights from diffusion architectures, key papers, deployment blockers...'",
    []
  );

  const API_BASE = "https://capstone-backend-3-jthr.onrender.com/api";

  const getAuthHeaders = () => {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = '/Login';
      return {};
    }
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const handleAttachClick = () => {
    if (attachInputRef.current && typeof attachInputRef.current.click === "function") {
      attachInputRef.current.click();
    }
  };

  const handleAttachFileChange = (event) => {
    try {
      const file = event.target?.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = String(e.target?.result || "");
        if (!text) return;
        setNotes((prev) => {
          if (!prev) return text;
          return `${prev}\n\n${text}`;
        });
      };
      reader.readAsText(file);
    } finally {
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleApiError = (error, context = '') => {
    console.error(`Error ${context}:`, error);
    if (error.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/Login';
    }
    return null;
  };

  const fetchWithAuth = async (url, options = {}) => {
    try {
      const headers = getAuthHeaders();
      if (Object.keys(headers).length === 0) return null; 

      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleApiError({ status: 401 }, `Unauthorized access to ${url}`);
          return null;
        }

        if (response.status === 404 && url.includes("/dashboard/deepwork")) {
          console.warn("Deep work endpoint not found on backend, skipping.");
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      return handleApiError(error, `fetching ${url}`);
    }
  };

  const handleUpdateBlueprintClick = () => {
    if (typeof window === "undefined") return;
    if (overviewRef.current && typeof overviewRef.current.scrollIntoView === "function") {
      overviewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      const el = document.getElementById("overview-label-input");
      if (el && typeof el.focus === "function") {
        el.focus();
      }
    }, 400);
  };

  const fetchStreak = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/streak`);
    if (data) {
      setCurrentStreak(data.currentStreak || 0);
      setMaxStreak(data.maxStreak || 0);
      setLastActivityDate(data.lastActivityDate || null);
    }
  }, []);

  const updateStreak = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/streak/update`, {
      method: "POST"
    });
    if (data) {
      setCurrentStreak(data.currentStreak || 0);
      setMaxStreak(data.maxStreak || 0);
      setLastActivityDate(data.lastActivityDate || null);
    }
  }, []);

  const fetchMilestones = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/milestones`);
    if (data && data.length > 0) {
      setMilestones(data.map((m) => ({
        title: m.title,
        detail: m.detail,
        state: m.state,
        id: m._id,
      })));
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/overview`);
    if (data && data.length > 0) {
      setOverview(data.map((o) => ({
        label: o.label,
        value: o.value,
        id: o._id,
      })));
    }
  }, []);

  const fetchSchedules = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/schedules`);
    if (!data) return;

    const tasksData = await fetchWithAuth(`${API_BASE}/dashboard/tasks?status=pending`);
    const tasks = tasksData || [];

    const scheduleItems = data.map((s) => {
      const relatedTask = tasks.find(t => t._id === s.taskId);
      return {
        title: s.title,
        time: s.time,
        detail: s.detail,
        id: s._id,
        taskId: s.taskId || null,
        task: relatedTask ? {
          title: relatedTask.title,
          status: relatedTask.status,
          priority: relatedTask.priority
        } : null
      };
    });

    setScheduleItems(scheduleItems);
  }, []);

  const fetchPendingTasks = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.warn("No token found, skipping pending tasks fetch");
        return;
      }

      const res = await fetch(`${API_BASE}/dashboard/tasks/pending-today`, {
        headers: headers,
      });

      if (res.ok) {
        const data = await res.json();
        const count = data.count || 0;
        console.log("Pending tasks count updated:", count);
        setPendingTasksCount(count);
        setPendingTasks(data.tasks || []);
      } else if (res.status === 401) {
        console.warn("Unauthorized - token may be expired or invalid");
        setPendingTasksCount(0);
        setPendingTasks([]);
      } else {
        console.error("Failed to fetch pending tasks:", res.status);
        setPendingTasksCount(0);
        setPendingTasks([]);
      }
    } catch (err) {
      console.error("Error fetching pending tasks:", err);
      setPendingTasksCount(0);
      setPendingTasks([]);
    }
  }, []);

  const fetchEnergyGraphData = useCallback(async () => {
    try {
      console.log("Fetching energy graph data...");
      const headers = getAuthHeaders();
      if (!headers.Authorization) {
        console.warn("No token found, using sample data for energy graph");

        const sampleData = [
          { day: 'Mon', total: 5, completed: 3, pending: 2, activities: 2 },
          { day: 'Tue', total: 8, completed: 5, pending: 3, activities: 3 },
          { day: 'Wed', total: 3, completed: 2, pending: 1, activities: 1 },
          { day: 'Thu', total: 6, completed: 4, pending: 2, activities: 2 },
          { day: 'Fri', total: 7, completed: 5, pending: 2, activities: 1 },
          { day: 'Sat', total: 2, completed: 1, pending: 1, activities: 0 },
          { day: 'Sun', total: 1, completed: 0, pending: 1, activities: 0 },
        ];
        setEnergyGraphData(sampleData);
        return;
      }

      console.log("Making API request to:", `${API_BASE}/dashboard/tasks/week`);
      const response = await fetchWithAuth(`${API_BASE}/dashboard/tasks/week`);
      console.log("API Response:", response);

      if (response && Array.isArray(response)) {
        console.log("Setting energy graph data:", response);
        setEnergyGraphData(response);
      } else {
        console.warn("Unexpected response format, using sample data");

        const sampleData = [
          { day: 'Mon', total: 5, completed: 3, pending: 2, activities: 2 },
          { day: 'Tue', total: 8, completed: 5, pending: 3, activities: 3 },
          { day: 'Wed', total: 3, completed: 2, pending: 1, activities: 1 },
          { day: 'Thu', total: 6, completed: 4, pending: 2, activities: 2 },
          { day: 'Fri', total: 7, completed: 5, pending: 2, activities: 1 },
          { day: 'Sat', total: 2, completed: 1, pending: 1, activities: 0 },
          { day: 'Sun', total: 1, completed: 0, pending: 1, activities: 0 },
        ];
        setEnergyGraphData(sampleData);
      }
    } catch (err) {
      console.error("Error in fetchEnergyGraphData:", err);

      const sampleData = [
        { day: 'Mon', total: 5, completed: 3, pending: 2, activities: 2 },
        { day: 'Tue', total: 8, completed: 5, pending: 3, activities: 3 },
        { day: 'Wed', total: 3, completed: 2, pending: 1, activities: 1 },
        { day: 'Thu', total: 6, completed: 4, pending: 2, activities: 2 },
        { day: 'Fri', total: 7, completed: 5, pending: 2, activities: 1 },
        { day: 'Sat', total: 2, completed: 1, pending: 1, activities: 0 },
        { day: 'Sun', total: 1, completed: 0, pending: 1, activities: 0 },
      ];
      setEnergyGraphData(sampleData);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, redirecting to login");
      return;
    }
    
    // Set loading state
    setEnergyGraphData(prev => (Array.isArray(prev) && prev.length > 0 ? prev : null));

    const loadData = async () => {
      try {
        await fetchStreak();
        await fetchMilestones();
        await fetchOverview();
        await fetchSchedules();
        await fetchPendingTasks();
        await fetchEnergyGraphData();
        await fetchDeepWorkStats();
        await updateStreak();
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadData();

  }, []);

  const logDeepWorkSession = useCallback(async (minutes) => {
    const mins = Math.max(1, Number(minutes) || 0);
    const data = await fetchWithAuth(`${API_BASE}/dashboard/deepwork/session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ minutes: mins }),
    });
    if (data) {
      setDeepWorkStats({
        dailyGoalMinutes: data.dailyGoalMinutes || 0,
        totalFocusMinutes: data.totalFocusMinutes || 0,
        sessionCount: data.sessionCount || 0,
        averageMinutes: data.averageMinutes || 0,
      });
    } else {
      // Fallback to local state update
      setDeepWorkStats((prev) => {
        const totalFocusMinutes = (prev.totalFocusMinutes || 0) + mins;
        const sessionCount = (prev.sessionCount || 0) + 1;
        const averageMinutes = sessionCount > 0
          ? Math.round(totalFocusMinutes / sessionCount)
          : 0;
        return {
          ...prev,
          totalFocusMinutes,
          sessionCount,
          averageMinutes,
        };
      });
    }
  }, []);

  useEffect(() => {
    if (!isFocusRunning || remainingSeconds <= 0) return;

    const id = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsFocusRunning(false);
          if (typeof window !== "undefined") {
            alert("Deep work session complete! Great job staying focused.");
          }
          logDeepWorkSession(focusMinutes);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isFocusRunning, remainingSeconds, focusMinutes, logDeepWorkSession]);

  const formattedFocusTime = useMemo(() => {
    const total = remainingSeconds || focusMinutes * 60;
    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [remainingSeconds, focusMinutes]);

  const formatMinutesToHours = (minutes) => {
    const mins = Math.max(0, Number(minutes) || 0);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const handleSummarize = async () => {
    if (!notes.trim()) {
      setSummary("Add some notes first so I can craft a summary for you.");
      return;
    }

    setIsSummarizing(true);
    setSummary("");
    updateStreak();

    try {
      const headers = getAuthHeaders();
      const url = `${API_BASE}/ai/summarize`;
      console.log("Calling AI summarize endpoint:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get("content-type"));

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {

        const textResponse = await res.text();
        console.error("Non-JSON response received:", textResponse.substring(0, 200));

        if (res.status === 404) {
          setSummary(`⚠️ AI endpoint not found. The backend may not be deployed with the latest changes.\n\nFallback Summary:\n\n${generateFallbackSummary(notes)}`);
        } else {
          setSummary(`⚠️ Server returned HTML instead of JSON. Status: ${res.status}\n\nThis usually means the route doesn't exist or the backend needs to be redeployed.\n\nFallback Summary:\n\n${generateFallbackSummary(notes)}`);
        }
        return;
      }

      let data;
      try {
        data = await res.json();
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        const textResponse = await res.text();
        console.error("Response body:", textResponse.substring(0, 500));
        setSummary(`Error: Invalid JSON response from server. Status: ${res.status}\n\nFallback Summary:\n\n${generateFallbackSummary(notes)}`);
        return;
      }

      if (res.ok) {
        if (data && data.summary && data.summary.trim()) {
          console.log("Summary received successfully, length:", data.summary.length);
          setSummary(data.summary);
          await fetchEnergyGraphData();
        } else {
          console.error("Empty summary received:", data);
          setSummary("Summary generated successfully, but no content was returned. Please try again.");
        }
      } else {

        let errorMessage = "Failed to generate summary. Please try again.";
        if (data && data.message) {
          errorMessage = data.message;
        } else if (res.statusText) {
          errorMessage = res.statusText;
        }

        console.error("API Error:", res.status, errorMessage);

        if (res.status === 503) {
          setSummary(`⚠️ AI service is not configured.\n\nFallback Summary:\n\n${generateFallbackSummary(notes)}`);
        } else {
          setSummary(`Error: ${errorMessage}\n\nPlease check your connection or try again later.`);
        }
      }
    } catch (err) {
      console.error("Error generating summary:", err);

      setSummary(`⚠️ Network error: Unable to connect to AI service.\n\nFallback Summary:\n\n${generateFallbackSummary(notes)}`);
    } finally {
      setIsSummarizing(false);
    }
  };

  const generateFallbackSummary = (text) => {
    const clean = text.replace(/\s+/g, " ").trim();
    const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);
    const keyPoints = clean
      .split(/[.,;:]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
      .slice(0, 5);
    const summary = [
      sentences.slice(0, 2).join(" ") || clean.slice(0, 200),
      "",
      "Key Points:",
      ...keyPoints.map((point, idx) => `${idx + 1}. ${point}`),
    ]
      .filter(Boolean)
      .join("\n");

    return summary;
  };

  const handleShuffleOverview = () => {
    setOverview((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handleAddOverview = async () => {
    if (!newOverviewLabel.trim() || !newOverviewValue.trim()) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/dashboard/overview`, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          label: newOverviewLabel.trim(),
          value: newOverviewValue.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOverview((prev) => [...prev, { label: data.label, value: data.value, id: data._id }]);
        setNewOverviewLabel("");
        setNewOverviewValue("");
        updateStreak();
        await fetchEnergyGraphData();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Error creating overview:", errorData);
        alert(`Failed to create overview: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating overview:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleAddSchedule = async () => {
    if (!newScheduleTitle.trim()) return;

    try {
      const headers = getAuthHeaders();

      const scheduleRes = await fetch(`${API_BASE}/dashboard/schedules`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newScheduleTitle.trim(),
          time: newScheduleTime.trim() || "Custom",
          detail: newScheduleDetail.trim() || "Tap to edit details",
        }),
      });

      if (scheduleRes.ok) {
        const scheduleData = await scheduleRes.json();

        setScheduleItems((prev) => [
          ...prev,
          {
            title: scheduleData.title,
            time: scheduleData.time,
            detail: scheduleData.detail,
            id: scheduleData._id,
            taskId: null,
          },
        ]);

        const today = new Date();
        const endOfToday = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23, 59, 59, 999
        );

        const taskRes = await fetch(`${API_BASE}/dashboard/tasks`, {
          method: "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newScheduleTitle.trim(),
            description:
              newScheduleDetail.trim() ||
              scheduleData.detail ||
              "Tap to edit details",
            dueDate: endOfToday.toISOString(),
            status: "pending",
            priority: "medium",
          }),
        });

        if (taskRes.ok) {
          const taskData = await taskRes.json();

          await fetch(`${API_BASE}/dashboard/schedules/${scheduleData._id}`, {
            method: "PUT",
            headers: {
              ...headers,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ taskId: taskData._id }),
          });

          setScheduleItems((prev) =>
            prev.map((item) =>
              item.id === scheduleData._id
                ? { ...item, taskId: taskData._id }
                : item
            )
          );
        }

        await fetchPendingTasks();
        await fetchEnergyGraphData();

        setNewScheduleTitle("");
        setNewScheduleTime("");
        setNewScheduleDetail("");

        updateStreak();
      } else {
        const errorData = await scheduleRes.json().catch(() => ({
          message: "Unknown error",
        }));
        alert(`Failed to create schedule: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert(
        `Network error: ${err.message}. Please check your connection and try again.`
      );
    }
  };

  const handleDeleteSchedule = async (scheduleId, taskId) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const headers = getAuthHeaders();

      const scheduleRes = await fetch(`${API_BASE}/dashboard/schedules/${scheduleId}`, {
        method: "DELETE",
        headers: headers,
      });

      if (scheduleRes.ok) {

        if (taskId) {
          await fetch(`${API_BASE}/dashboard/tasks/${taskId}`, {
            method: "DELETE",
            headers: headers,
          });
        }

        setScheduleItems((prev) => prev.filter((item) => item.id !== scheduleId));

        await fetchPendingTasks();
        await fetchEnergyGraphData();
      } else {
        const errorData = await scheduleRes.json().catch(() => ({ message: "Unknown error" }));
        alert(`Failed to delete schedule: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error deleting schedule:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleCompleteSchedule = async (scheduleId, taskId) => {
    try {
      const headers = getAuthHeaders();

      if (taskId) {
        const taskRes = await fetch(`${API_BASE}/dashboard/tasks/${taskId}`, {
          method: "PUT",
          headers: { 
            ...headers, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            status: "completed",
          }),
        });

        if (taskRes.ok) {

          setScheduleItems((prev) => prev.filter((item) => item.id !== scheduleId));

          await fetchPendingTasks();
          await fetchEnergyGraphData();
        } else {
          const errorData = await taskRes.json().catch(() => ({ message: "Unknown error" }));
          alert(`Failed to complete task: ${errorData.message || "Unknown error"}`);
        }
      } else {

        setScheduleItems((prev) => prev.filter((item) => item.id !== scheduleId));
      }
    } catch (err) {
      console.error("Error completing schedule:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestoneTitle.trim()) return;

    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API_BASE}/dashboard/milestones`, {
        method: "POST",
        headers: { 
          ...headers, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          title: newMilestoneTitle.trim(),
          detail: newMilestoneDetail.trim() || "Details coming soon",
          state: newMilestoneState.trim() || "Planned",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMilestones((prev) => [
          ...prev,
          {
            title: data.title,
            detail: data.detail,
            state: data.state,
            id: data._id,
          },
        ]);
        setNewMilestoneTitle("");
        setNewMilestoneDetail("");
        setNewMilestoneState("");
        updateStreak();
        await fetchEnergyGraphData();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        console.error("Error creating milestone:", errorData);
        alert(`Failed to create milestone: ${errorData.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error creating milestone:", err);
      alert(`Network error: ${err.message}. Please check your connection and try again.`);
    }
  };

  const handleShareProgress = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("LearnSphere AI – Progress Report", 20, 20);

      doc.setFontSize(11);
      doc.text(`Name: ${user.name || "Aditya Rana"}`, 20, 32);
      if (user.email) {
        doc.text(`Email: ${user.email}`, 20, 38);
      } else {
        doc.text("Location: Bangalore, IN", 20, 38);
      }

      doc.text("Learning Blueprint:", 20, 50);
      overview.forEach((item, idx) => {
        doc.text(`- ${item.label}: ${item.value}`, 24, 58 + idx * 6);
      });

      const schedulesStart = 58 + overview.length * 6 + 6;
      doc.text("Schedules:", 20, schedulesStart);
      scheduleItems.forEach((item, idx) => {
        doc.text(`- ${item.time} · ${item.title}: ${item.detail}`, 24, schedulesStart + 8 + idx * 6);
      });

      let milestonesStart = schedulesStart + 8 + scheduleItems.length * 6 + 6;
      doc.text("Milestones:", 20, milestonesStart);
      milestones.forEach((m, idx) => {
        doc.text(`- [${m.state}] ${m.title}: ${m.detail}`, 24, milestonesStart + 8 + idx * 6);
      });

      doc.save("learnsphere-progress.pdf");
    } catch (err) {
      console.error("Failed to generate PDF. Make sure 'jspdf' is installed.", err);
      alert("To enable PDF export, run `npm install jspdf` in the frontend project, then try again.");
    }
  };

  const fetchDeepWorkStats = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/deepwork`);
    if (data) {
      setDeepWorkStats({
        dailyGoalMinutes: data.dailyGoalMinutes || 0,
        totalFocusMinutes: data.totalFocusMinutes || 0,
        sessionCount: data.sessionCount || 0,
        averageMinutes: data.averageMinutes || 0,
      });
      setDeepWorkGoalInput(data.dailyGoalMinutes || 0);
    }
  }, []);

  const handleStartFocus = () => {
    const mins = Number.isFinite(focusMinutes) ? Math.max(1, focusMinutes) : 25;
    setFocusMinutes(mins);
    setRemainingSeconds(mins * 60);
    setIsFocusRunning(true);
  };

  const handlePauseFocus = () => {
    setIsFocusRunning((prev) => !prev);
  };

  const handleResetFocus = () => {
    setIsFocusRunning(false);
    setRemainingSeconds(0);
  };

  const handleSaveDeepWorkGoal = async () => {
    const mins = Math.max(15, Math.min(Number(deepWorkGoalInput) || 0, 720));
    setDeepWorkGoalInput(mins);


    setDeepWorkStats((prev) => ({
      ...prev,
      dailyGoalMinutes: mins,
    }));

    const data = await fetchWithAuth(`${API_BASE}/dashboard/deepwork`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dailyGoalMinutes: mins }),
    });
    if (data) {
      setDeepWorkStats({
        dailyGoalMinutes: data.dailyGoalMinutes || mins,
        totalFocusMinutes: data.totalFocusMinutes || 0,
        sessionCount: data.sessionCount || 0,
        averageMinutes: data.averageMinutes || 0,
      });
      setDeepWorkGoalInput(data.dailyGoalMinutes || mins);
    }
  };


  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const controller = new AbortController();

    fetch("https://capstone-backend-3-jthr.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
          }));
        }
      })
      .catch(() => {
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030303] dark:bg-[#030303] light:bg-gray-50 text-white dark:text-white light:text-gray-900 overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/95 dark:from-black/30 dark:via-black/70 dark:to-black/95 light:from-white/40 light:via-white/60 light:to-white/80" />

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 space-y-10">

        {isProgressModalOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="relative w-full max-w-4xl rounded-3xl border border-white/15 bg-black/90 px-6 py-6 md:px-8 md:py-7 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Progress Overview</p>
                  <h2 className="mt-1 text-xl md:text-2xl font-semibold text-white">Your learning snapshot</h2>
                  <p className="mt-1 text-xs md:text-sm text-white/60">
                    Quick view of streaks, focus time, weekly activity and milestones. Use this before sharing or downloading.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await handleShareProgress();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-xs md:text-sm font-semibold hover:bg-white/90 transition"
                  >
                    <Upload className="h-4 w-4" />
                    Download report
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProgressModalOpen(false)}
                    className="rounded-full border border-white/30 px-3 py-2 text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Focus Streak</p>
                  <p className="mt-2 text-2xl font-semibold text-indigo-300">{currentStreak} days</p>
                  <p className="text-xs text-white/60 mt-1">Max streak: {maxStreak} days</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Deep Work</p>
                  <p className="mt-2 text-lg font-semibold text-white/90">
                    {formatMinutesToHours(deepWorkStats.totalFocusMinutes || 0)} total
                  </p>
                  <p className="text-xs text-white/60 mt-1">
                    {deepWorkStats.sessionCount || 0} sessions · Avg {formatMinutesToHours(deepWorkStats.averageMinutes || 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Pending Work</p>
                  <p className="mt-2 text-2xl font-semibold text-rose-300">{pendingTasksCount}</p>
                  <p className="text-xs text-white/60 mt-1">tasks due today</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3 items-stretch">
                <div className="md:col-span-2 rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/60 dark:bg-black/60 light:bg-gray-100 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-white/80 dark:text-white/80 light:text-gray-700" />
                      <p className="text-xs font-medium text-white/80 dark:text-white/80 light:text-gray-700">Weekly activity</p>
                    </div>
                    <p className="text-[11px] text-white/50 dark:text-white/50 light:text-gray-600">
                      {Array.isArray(energyGraphData) ? energyGraphData.reduce((sum, d) => sum + (d.completed || 0), 0) : 0} completed ·
                      {" "}
                      {Array.isArray(energyGraphData) ? energyGraphData.reduce((sum, d) => sum + (d.pending || 0), 0) : 0} pending
                    </p>
                  </div>
                  <div className="mt-1 flex items-end gap-1.5 h-28">
                    {Array.isArray(energyGraphData) && energyGraphData.length > 0 ? (
                      energyGraphData.map((d) => {
                        const total = Math.max(1, d.total || 0);
                        const completed = d.completed || 0;
                        const pending = d.pending || 0;
                        const completedHeight = (completed / total) * 100;
                        const pendingHeight = (pending / total) * 100;
                        return (
                          <div key={d.day} className="flex-1 flex flex-col items-center h-full group">
                            <div className="relative w-5 h-full flex flex-col justify-end">
                              <div
                                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 dark:from-emerald-500 light:from-emerald-600 to-emerald-400 dark:to-emerald-400 light:to-emerald-500 shadow-sm shadow-emerald-500/30 transition-all duration-300 group-hover:shadow-md group-hover:shadow-emerald-500/40"
                                style={{ height: `${completedHeight}%` }}
                              />
                              {pending > 0 && (
                                <div
                                  className="w-full bg-gradient-to-b from-rose-400 dark:from-rose-400 light:from-rose-600 to-rose-500 dark:to-rose-500 light:to-rose-700 rounded-b-md shadow-sm shadow-rose-500/30 transition-all duration-300 group-hover:shadow-md group-hover:shadow-rose-500/40"
                                  style={{ height: `${pendingHeight}%` }}
                                />
                              )}
                            </div>
                            <span className="mt-1 text-[10px] text-white/40 dark:text-white/40 light:text-gray-500 group-hover:text-white/60 dark:group-hover:text-white/60 light:group-hover:text-gray-700 transition-colors">{(d.day || '').slice(0, 1)}</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-white/50 dark:text-white/50 light:text-gray-600">
                        No weekly data yet
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/60 dark:bg-black/60 light:bg-gray-100 px-4 py-3 flex flex-col">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600 mb-2">Milestones</p>
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-40">
                    {milestones && milestones.length > 0 ? (
                      milestones.slice(0, 4).map((m) => (
                        <div key={m.id || m.title} className="text-xs text-white/70 dark:text-white/70 light:text-gray-700 flex items-center justify-between gap-2">
                          <span className="truncate">{m.title}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 dark:text-white/40 light:text-gray-500">{m.state}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/50 dark:text-white/50 light:text-gray-600">No milestones yet</p>
                    )}
                  </div>
                  {milestones && milestones.length > 4 && (
                    <p className="mt-1 text-[10px] text-white/40 dark:text-white/40 light:text-gray-500">+{milestones.length - 4} more</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 dark:border-white/10 light:border-gray-200 bg-white/5 dark:bg-white/5 light:bg-white/90 backdrop-blur-xl p-7"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_10px_35px_rgba(79,70,229,0.45)]">
                <div className="absolute inset-0 rounded-2xl border border-white/40 dark:border-white/40 light:border-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center text-3xl font-semibold text-white dark:text-white light:text-gray-800">
                  {(user.name || "A").charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/50 dark:text-white/50 light:text-gray-500">Dashboard</p>
                <h1 className="text-3xl font-semibold tracking-tight text-white dark:text-white light:text-gray-900">
                  Hi {user.name || "Learner"}, ready for tonight&apos;s sprint?
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-white/70 dark:text-white/70 light:text-gray-600">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-white dark:text-white light:text-gray-600" /> Bangalore · IST
                  </span>
                  {user.email && (
                    <span className="px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 light:bg-gray-100 border border-white/20 dark:border-white/20 light:border-gray-300 text-xs text-white dark:text-white light:text-gray-700">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleShuffleOverview}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                <Brain className="h-4 w-4" />
                Shuffle Focus
              </button>
              <button
                onClick={handleUpdateBlueprintClick}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 dark:border-white/30 light:border-gray-300 px-4 py-2 text-sm text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900"
              >
                <Edit3 className="h-4 w-4" />
                Update Blueprint
              </button>
              <button
                onClick={() => setIsProgressModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 dark:border-white/20 light:border-gray-300 px-4 py-2 text-sm text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900"
              >
                <Target className="h-4 w-4" />
                Share Progress
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3 items-end">
              <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/40 dark:bg-black/40 light:bg-gray-100 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600">Daily Deep Work Goal</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <input
                    type="number"
                    min={15}
                    max={720}
                    value={deepWorkGoalInput}
                    onChange={(e) => setDeepWorkGoalInput(Number(e.target.value) || 0)}
                    className="w-20 rounded-xl border border-white/20 dark:border-white/20 light:border-gray-300 bg-black/40 dark:bg-black/40 light:bg-white px-2 py-1.5 text-sm text-white dark:text-white light:text-gray-800 placeholder:text-white/40 dark:placeholder:text-white/40 light:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                  <span className="text-xs text-white/50 dark:text-white/50 light:text-gray-600">minutes / day</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 dark:border-white/15 light:border-gray-200 bg-black/40 dark:bg-black/40 light:bg-gray-100 px-4 py-3">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 dark:text-white/40 light:text-gray-600">Average Session</p>
                <p className="mt-2 text-lg font-semibold text-white/90 dark:text-white/90 light:text-gray-800">
                  {formatMinutesToHours(deepWorkStats.averageMinutes || 0)}
                </p>
                <p className="text-[11px] text-white/50 dark:text-white/50 light:text-gray-600 mt-1">
                  {deepWorkStats.sessionCount || 0} sessions logged
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveDeepWorkGoal}
                className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
              >
                Save Goal
              </button>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 rounded-2xl bg-gradient-to-br from-black/80 via-black to-gray-900/90 dark:from-black/80 dark:via-black dark:to-gray-900/90 light:from-white/90 light:via-gray-50 light:to-gray-100/90 border border-white/5 dark:border-white/5 light:border-gray-200 shadow-2xl shadow-black/50 dark:shadow-black/50 light:shadow-gray-300/30 p-5 space-y-5 backdrop-blur-md"
          >
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-white/80 dark:text-white/80 light:text-gray-700" />
                <p className="text-sm font-medium text-white/90 dark:text-white/90 light:text-gray-800">Activity Overview</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/70 dark:text-white/70 light:text-gray-600">
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-400 light:bg-emerald-600 mr-1.5 shadow-sm shadow-emerald-400/50"></span>
                  <span className="text-white/80 dark:text-white/80 light:text-gray-700">Completed</span>
                </span>
                <span className="hidden sm:inline text-white/30 dark:text-white/30 light:text-gray-400">•</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-rose-400 light:bg-rose-600 mr-1.5 shadow-sm shadow-rose-400/50"></span>
                  <span className="text-white/60 dark:text-white/60 light:text-gray-600">Pending</span>
                </span>
                <span className="hidden sm:inline text-white/30 dark:text-white/30 light:text-gray-400">•</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-400 light:bg-purple-600 mr-1.5 shadow-sm shadow-purple-400/50"></span>
                  <span className="text-white/60 dark:text-white/60 light:text-gray-600">Activities</span>
                </span>
              </div>
            </div>
            
            <div className="relative h-48 -mx-1">
              <div className="absolute inset-0 grid grid-cols-7 h-full">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="border-r border-white/[0.03] dark:border-white/[0.03] light:border-gray-200/20 last:border-r-0"></div>
                ))}
              </div>
              
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 25, 50, 75, 100].map((percent, i) => (
                  <div 
                    key={i}
                    className="relative h-px w-full"
                    style={{ 
                      marginTop: i === 0 ? 0 : 'auto',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent)',
                      dark: { background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent)' },
                      light: { background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.05) 10%, rgba(0,0,0,0.05) 90%, transparent)' }
                    }}
                  >
                    {percent > 0 && (
                      <span className="absolute left-1 text-[10px] text-white/20 dark:text-white/20 light:text-gray-400 -translate-y-1/2 select-none">
                        {100 - percent}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="relative h-full flex items-end justify-between px-1">
                {energyGraphData === null ? (
                  Array(7).fill(0).map((_, i) => (
                    <div 
                      key={`loading-${i}`} 
                      className="h-full w-8 relative group"
                      style={{
                        '--delay': `${i * 0.1}s`,
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                        animationDelay: `var(--delay, 0s)`,
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/30 dark:from-indigo-500/30 light:from-indigo-400/40 to-purple-500/20 dark:to-purple-500/20 light:to-purple-400/30 rounded-t-lg shadow-sm shadow-indigo-500/20"></div>
                    </div>
                  ))
                ) : Array.isArray(energyGraphData) && energyGraphData.length > 0 ? (
                  energyGraphData.map((item) => {
                    const day = item.day || '';
                    const total = item.total || 0;
                    const completed = item.completed || 0;
                    const pending = item.pending || 0;
                    const activities = item.activities || 0;
                    
                    const maxValue = Math.max(1, ...energyGraphData.map(d => 
                      Math.max(d.total || 0, d.activities || 0, d.completed || 0, d.pending || 0)
                    ));
                    
                    const totalHeight = Math.min((total / maxValue) * 90, 90);
                    const completedHeight = total > 0 ? (completed / total) * 100 : 0;
                    const activitiesHeight = total > 0 ? (activities / total) * 100 : 0;
                    
                    const isHovered = hoveredDay === day;
                    
                    return (
                      <div
                        key={day}
                        className="flex-1 flex flex-col items-center h-full relative group"
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        {isHovered && (
                          <div 
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 rounded-lg bg-gradient-to-b from-black/95 dark:from-black/95 light:from-white/95 to-gray-900/95 dark:to-gray-900/95 light:to-gray-100/95 border border-white/10 dark:border-white/10 light:border-gray-200 backdrop-blur-md z-50 shadow-xl shadow-black/40 dark:shadow-black/40 light:shadow-gray-300/40 w-40 text-sm"
                          >
                            <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-white/10 dark:border-white/10 light:border-gray-200">
                              <p className="text-sm font-semibold text-white dark:text-white light:text-gray-800">{day}</p>
                              <div className="flex items-center space-x-1.5">
                                <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-white/10 dark:bg-white/10 light:bg-gray-100 text-white/80 dark:text-white/80 light:text-gray-700">
                                  {total} total
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 dark:bg-emerald-400 light:bg-emerald-600 mr-1.5"></span>
                                  Completed
                                </span>
                                <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{completed || 0}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-300 dark:text-gray-300 light:text-gray-600 flex items-center">
                                  <span className="w-2 h-2 rounded-full bg-rose-400 dark:bg-rose-400 light:bg-rose-600 mr-1.5"></span>
                                  Pending
                                </span>
                                <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{pending || 0}</span>
                              </div>
                              
                              {activities > 0 && (
                                <div className="pt-1.5 mt-1.5 border-t border-white/5 dark:border-white/5 light:border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-purple-300 dark:text-purple-300 light:text-purple-600 flex items-center">
                                      <span className="w-2 h-2 rounded-full bg-purple-400 dark:bg-purple-400 light:bg-purple-600 mr-1.5"></span>
                                      Activities
                                    </span>
                                    <span className="text-xs font-medium text-white dark:text-white light:text-gray-800">{activities}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-black/95 dark:bg-black/95 light:bg-white/95 border-t border-l border-white/10 dark:border-white/10 light:border-gray-200 -rotate-45 -z-10"></div>
                          </div>
                        )}

                        <div className="relative w-full h-full flex items-end justify-center group" style={{ minWidth: '28px' }}>
                          <div 
                            className="relative w-6 mx-auto transition-all duration-300 group-hover:w-7"
                            style={{
                              height: `${Math.max(totalHeight, 5)}%`,
                              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-white/10 light:from-gray-200/40 to-black/20 dark:to-black/20 light:to-gray-300/40 rounded-t-lg overflow-hidden border border-white/10 dark:border-white/10 light:border-gray-300 transition-all duration-200 group-hover:border-white/20 dark:group-hover:border-white/20 light:group-hover:border-gray-400 shadow-sm">
                              {pending > 0 && (
                                <div 
                                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-500 dark:from-rose-500 light:from-rose-600 to-rose-400 dark:to-rose-400 light:to-rose-500 transition-all duration-300 shadow-sm shadow-rose-500/40"
                                  style={{
                                    height: `${(pending / total) * 100}%`,
                                    borderTop: '1px solid rgba(236, 72, 153, 0.4)'
                                  }}
                                ></div>
                              )}
                              
                              <div 
                                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-emerald-400 dark:from-emerald-400 light:from-emerald-600 to-emerald-500 dark:to-emerald-500 light:to-emerald-700 transition-all duration-300 shadow-sm shadow-emerald-500/40"
                                style={{
                                  height: `${(completed / total) * 100}%`,
                                  borderTopLeftRadius: '0.5rem',
                                  borderTopRightRadius: '0.5rem'
                                }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 dark:from-white/20 light:from-white/30 to-transparent opacity-40"></div>
                              </div>
                              
                              {activities > 0 && (
                                <div 
                                  className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-t from-purple-500 dark:from-purple-500 light:from-purple-600 to-purple-400 dark:to-purple-400 light:to-purple-500 transition-all duration-300 group-hover:from-purple-400 dark:group-hover:from-purple-400 light:group-hover:from-purple-500 group-hover:to-purple-300 dark:group-hover:to-purple-300 light:group-hover:to-purple-400 shadow-sm shadow-purple-500/40"
                                  style={{
                                    bottom: `${(activities / total) * 100}%`
                                  }}
                                ></div>
                              )}
                            </div>
                            
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute inset-0 bg-gradient-to-b from-white/10 dark:from-white/10 light:from-gray-200/40 to-transparent rounded-t-lg"></div>
                            </div>
                          </div>
                          
                          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full text-center">
                            <span className="text-[10px] font-medium text-white/40 dark:text-white/40 light:text-gray-500 group-hover:text-white/70 dark:group-hover:text-white/70 light:group-hover:text-gray-700 transition-colors select-none">
                              {day.slice(0, 1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 dark:bg-white/5 light:bg-gray-100 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white/30 dark:text-white/30 light:text-gray-400" />
                    </div>
                    <p className="text-sm text-white/60 dark:text-white/60 light:text-gray-500 text-center max-w-[200px]">
                      No activity data available for this week
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between px-0.5 mt-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                  <div key={i} className="w-7 text-center">
                    <span className="text-[10px] text-white/30 dark:text-white/30 light:text-gray-400 select-none">{day}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs pt-1">
              <div className="flex items-center space-x-2 text-white/50 dark:text-white/50 light:text-gray-600">
                <Activity className="h-3 w-3 text-white/60 dark:text-white/60 light:text-gray-500" />
                <span className="text-white/70 dark:text-white/70 light:text-gray-700">Weekly Activity</span>
              </div>
              <div className="text-white/50 dark:text-white/50 light:text-gray-600 font-medium">
                {energyGraphData ? energyGraphData.reduce((sum, day) => sum + (day.activities || 0), 0) : 0} activities
              </div>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <motion.button
            type="button"
            onClick={() => setIsStreakDetailsOpen(true)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
            className="text-left rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/30 via-white/5 p-5 backdrop-blur hover:border-indigo-400/70 cursor-pointer focus:outline-none"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Focus Score</p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-2xl font-semibold">Max Streak: {maxStreak}</p>
                <p className="text-lg font-medium text-indigo-300/80">Current: {currentStreak}</p>
              </div>
            </div>
            <p className="mt-1 text-sm text-white/70">Keep the streak going! (tap to view details)</p>
          </motion.button>
          
          {[
            {
              title: "Deep Work Avg",
              value: formatMinutesToHours(deepWorkStats.averageMinutes || 0),
              meta: `Goal: ${formatMinutesToHours(deepWorkStats.dailyGoalMinutes || 0)}`,
              accent: "from-cyan-500/30 via-white/5",
            },
            {
              title: "Pending Reviews",
              value: String(pendingTasksCount).padStart(2, "0"),
              meta: `${pendingTasksCount} due today`,
              accent: "from-rose-500/20 via-white/5",
            },
          ].map(({ title, value, meta, accent }, idx) => {
            const isDeepWork = title === "Deep Work Avg";
            const isPendingReviews = title === "Pending Reviews";
            return (
              <motion.button
                key={title}
                type="button"
                onClick={() => {
                  if (isDeepWork) setIsFocusTimerOpen(true);
                  if (isPendingReviews) setIsPendingTasksOpen(true);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (idx + 1) * 0.1 }}
                className={`text-left rounded-2xl border border-white/10 bg-gradient-to-br ${accent} p-5 backdrop-blur focus:outline-none hover:border-indigo-400/70 cursor-pointer`}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">{title}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
                <p className="mt-1 text-sm text-white/70">{meta}</p>
                {isDeepWork && (
                  <p className="mt-3 text-xs text-indigo-100/80">
                    Timer: {formattedFocusTime} · {isFocusRunning ? "Running" : "Idle"} (tap card to open controls)
                  </p>
                )}
                {isPendingReviews && (
                  <p className="mt-3 text-xs text-rose-100/80">
                    Tap to view and manage tasks
                  </p>
                )}
              </motion.button>
            );
          })}
        </section>

        {isFocusTimerOpen && (
          <section className="rounded-3xl border border-indigo-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Deep Work Session</p>
                <h2 className="text-xl font-semibold mt-1">Custom focus timer</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsFocusTimerOpen(false)}
                className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                close
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Remaining</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{formattedFocusTime}</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-white/60" htmlFor="focus-minutes">
                  Session length (minutes)
                </label>
                <input
                  id="focus-minutes"
                  type="number"
                  min={1}
                  max={180}
                  value={focusMinutes}
                  onChange={(e) => setFocusMinutes(Number(e.target.value) || 0)}
                  className="w-28 rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartFocus}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition"
              >
                <Clock4 className="h-4 w-4" />
                Start
              </button>
              <button
                type="button"
                onClick={handlePauseFocus}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
              >
                {isFocusRunning ? "Pause" : "Resume"}
              </button>
              <button
                type="button"
                onClick={handleResetFocus}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                Reset
              </button>
            </div>

            <p className="text-xs text-white/50">
              When the timer hits zero, you&apos;ll get a completion alert so you can log or celebrate your deep work
              sprint.
            </p>
          </section>
        )}

        {isStreakDetailsOpen && (
          <section className="rounded-3xl border border-indigo-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">Streak Details</p>
                <h2 className="text-xl font-semibold mt-1">Your Focus Streak</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsStreakDetailsOpen(false)}
                className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Current Streak</p>
                <p className="mt-2 text-4xl font-semibold text-indigo-300">{currentStreak}</p>
                <p className="mt-1 text-sm text-white/60">days in a row</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-black/50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Max Streak</p>
                <p className="mt-2 text-4xl font-semibold text-purple-300">{maxStreak}</p>
                <p className="mt-1 text-sm text-white/60">best record</p>
              </div>
            </div>

            {lastActivityDate && (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">Last Activity</p>
                <p className="mt-2 text-sm text-white/80">{new Date(lastActivityDate).toLocaleDateString()}</p>
              </div>
            )}

            <p className="text-xs text-white/50">
              Your streak increases when you open or edit something in the app. Keep it going!
            </p>
          </section>
        )}

        {isPendingTasksOpen && (
          <section className="rounded-3xl border border-rose-500/40 bg-black/40 backdrop-blur-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-rose-200/70">Pending Tasks</p>
                <h2 className="text-xl font-semibold mt-1">Tasks Due Today</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPendingTasksOpen(false)}
                className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
              >
                close
              </button>
            </div>

            {pendingTasks.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-8 text-center">
                <p className="text-lg text-white/60">No pending tasks for today!</p>
                <p className="text-sm text-white/40 mt-2">Great job staying on top of things.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pendingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-white/60 mt-1">{task.description}</p>
                        )}
                        <p className="text-xs text-white/40 mt-2">
                          Due: {new Date(task.dueDate).toLocaleString()}
                        </p>
                      </div>
                      <span className={`text-xs uppercase tracking-[0.3em] px-3 py-1 rounded-full ${
                        task.priority === "high" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                        task.priority === "medium" ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" :
                        "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-white/50">
              {pendingTasksCount} task{pendingTasksCount !== 1 ? "s" : ""} pending for today
            </p>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
            ref={overviewRef}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Overview</p>
                <h2 className="text-2xl font-semibold mt-1">Learning Blueprint</h2>
              </div>
              <button
                onClick={handleShuffleOverview}
                className="text-xs uppercase tracking-[0.3em] text-white/60 border border-white/15 rounded-full px-3 py-1 hover:text-white"
              >
                rotate
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {overview.map(({ label, value, id }) => (
                <div key={id || label} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{label}</p>
                  <p className="mt-2 text-lg text-white/90">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr,2fr,auto] items-end">
              <input
                id="overview-label-input"
                value={newOverviewLabel}
                onChange={(e) => setNewOverviewLabel(e.target.value)}
                placeholder="Label (e.g., Secondary Focus)"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <input
                value={newOverviewValue}
                onChange={(e) => setNewOverviewValue(e.target.value)}
                placeholder="Value"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <button
                type="button"
                onClick={handleAddOverview}
                className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
              >
                Add
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-black/20 to-black/40 backdrop-blur-xl p-7"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Schedules</p>
                <h2 className="text-xl font-semibold mt-1">Today&apos;s Flow</h2>
              </div>
              <button
                onClick={handleAddSchedule}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
              >
                <ListPlus className="h-4 w-4" />
                Add
              </button>
            </div>
            <div className="space-y-3">
              {scheduleItems.map(({ title, time, detail, id, taskId }, idx) => (
                <div key={id || `${title}-${idx}`} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <div className="flex items-center justify-between text-sm text-white/60">
                    <span>{time}</span>
                    <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-[0.3em] text-white/40">slot</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCompleteSchedule(id, taskId)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition"
                          title="Mark as done"
                        >
                          <Check className="h-4 w-4 text-emerald-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(id, taskId)}
                          className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-rose-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-lg font-medium">{title}</p>
                  <p className="text-sm text-white/60">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[0.9fr,1.2fr,auto] items-end">
              <input
                value={newScheduleTime}
                onChange={(e) => setNewScheduleTime(e.target.value)}
                placeholder="Time (e.g., 18:00 - 19:30)"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <input
                value={newScheduleTitle}
                onChange={(e) => setNewScheduleTitle(e.target.value)}
                placeholder="Title & detail"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <input
                value={newScheduleDetail}
                onChange={(e) => setNewScheduleDetail(e.target.value)}
                placeholder="Notes (optional)"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 md:col-span-3 lg:col-span-1"
              />
            </div>
          </motion.div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Milestones</p>
                <h2 className="text-2xl font-semibold mt-1">Next commitments</h2>
              </div>
              <Calendar className="h-5 w-5 text-white/60" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {milestones.map(({ title, detail, state, id }) => (
                <div key={id || title} className="rounded-2xl border border-white/10 bg-black/30 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/40">{state}</p>
                  <p className="mt-2 text-lg font-semibold">{title}</p>
                  <p className="text-sm text-white/60">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-[1fr,1.2fr,0.8fr,auto] items-end">
              <input
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="Milestone title"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <input
                value={newMilestoneDetail}
                onChange={(e) => setNewMilestoneDetail(e.target.value)}
                placeholder="Detail (date · context)"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <input
                value={newMilestoneState}
                onChange={(e) => setNewMilestoneState(e.target.value)}
                placeholder="State (Ready / Draft / Planned)"
                className="rounded-xl border border-white/20 bg-black/40 px-3 py-2 text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
              <button
                type="button"
                onClick={handleAddMilestone}
                className="rounded-full bg-white/90 text-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-white"
              >
                Add
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 rounded-3xl border border-white/10 bg-gradient-to-b from-indigo-600/20 via-black/40 to-black/70 backdrop-blur-xl p-7 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">AI Copilot</p>
                <h2 className="text-2xl font-semibold mt-1">Notes to Summary</h2>
              </div>
              <Sparkles className="h-5 w-5 text-indigo-200" />
            </div>

            <p className="text-sm text-white/70">
              Paste lecture dumps, research snippets, or meeting scribbles. The AI trims noise and surfaces what you
              actually need to remember.
            </p>

            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (e.target.value.trim()) updateStreak();
              }}
              placeholder={aiPlaceholder}
              rows={6}
              className="w-full rounded-2xl border border-white/15 bg-black/40 p-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 resize-none"
            />

            <input
              ref={attachInputRef}
              type="file"
              accept=".txt,.md,text/plain"
              className="hidden"
              onChange={handleAttachFileChange}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleSummarize}
                disabled={isSummarizing}
                className="inline-flex items-center gap-2 rounded-full bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                {isSummarizing ? "Summarizing..." : "Summarize"}
              </button>
              <button
                type="button"
                onClick={handleAttachClick}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 hover:text-white"
              >
                <Upload className="h-4 w-4" />
                Attach
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 min-h-[140px]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">AI Summary</p>
              {isSummarizing ? (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating summary with AI...</span>
                </div>
              ) : (
              <pre className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                {summary || "Your condensed insights will appear here right after the AI finishes crafting them."}
              </pre>
              )}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}

