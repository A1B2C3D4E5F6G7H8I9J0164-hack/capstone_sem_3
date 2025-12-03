"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import HeroBackground from "../components/HeroBackground";
import DashboardHeader from "../components/DashboardHeader";
import ActivityGraph from "../components/ActivityGraph";
import StatsCards from "../components/StatsCards";
import FocusTimer from "../components/FocusTimer";
import OverviewSection from "../components/OverviewSection";
import SchedulesSection from "../components/SchedulesSection";
import MilestonesSection from "../components/MilestonesSection";
import AISummary from "../components/AISummary";
import ProgressModal from "../components/ProgressModal";
import StreakDetails from "../components/StreakDetails";
import PendingTasks from "../components/PendingTasks";

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

  const getAuthHeaders = useCallback(() => {
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
  }, []);

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

  const handleApiError = useCallback((error, context = '') => {
    console.error(`Error ${context}:`, error);
    if (error.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/Login';
    }
    return null;
  }, []);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
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
  }, [getAuthHeaders, handleApiError]);

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
  }, [fetchWithAuth]);

  const updateStreak = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/streak/update`, {
      method: "POST"
    });
    if (data) {
      setCurrentStreak(data.currentStreak || 0);
      setMaxStreak(data.maxStreak || 0);
      setLastActivityDate(data.lastActivityDate || null);
    }
  }, [fetchWithAuth]);

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
  }, [fetchWithAuth]);

  const fetchOverview = useCallback(async () => {
    const data = await fetchWithAuth(`${API_BASE}/dashboard/overview`);
    if (data && data.length > 0) {
      setOverview(data.map((o) => ({
        label: o.label,
        value: o.value,
        id: o._id,
      })));
    }
  }, [fetchWithAuth]);

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
  }, [fetchWithAuth]);

  const fetchPendingTasks = useCallback(async () => {
    try {
      console.log("Fetching pending tasks from:", `${API_BASE}/dashboard/tasks/pending-today`);
      const data = await fetchWithAuth(`${API_BASE}/dashboard/tasks/pending-today`);
      console.log("Pending tasks data received:", data);
      
      if (data) {
        const count = data.count || 0;
        console.log("Pending tasks count updated:", count);
        setPendingTasksCount(count);
        setPendingTasks(data.tasks || []);
      } else {
        console.warn("No data received from fetchWithAuth");
        setPendingTasksCount(0);
        setPendingTasks([]);
      }
    } catch (err) {
      console.error("Error fetching pending tasks:", err);
      setPendingTasksCount(0);
      setPendingTasks([]);
    }
  }, [fetchWithAuth]);

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
  }, [getAuthHeaders, fetchWithAuth]);

  /* eslint-disable react-hooks/exhaustive-deps */
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

  }, [fetchWithAuth]);
  /* eslint-enable react-hooks/exhaustive-deps */

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
  }, [fetchWithAuth]);

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
          console.log("Task created successfully:", taskData);

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

          console.log("About to fetch pending tasks after task creation...");
          await fetchPendingTasks();
          await fetchEnergyGraphData();
        } else {
          const taskError = await taskRes.json().catch(() => ({ message: "Unknown error" }));
          console.error("Failed to create task:", taskError);
        }

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
  }, [fetchWithAuth]);

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
  }, [fetchWithAuth]);

  return (
    <div className="relative min-h-screen bg-[#030303] dark:bg-[#030303] light:bg-gray-50 text-white dark:text-white light:text-gray-900 overflow-hidden">
      <HeroBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-black/95 dark:from-black/30 dark:via-black/70 dark:to-black/95 light:from-white/40 light:via-white/60 light:to-white/80" />

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-16 space-y-10">

        <ProgressModal
          isProgressModalOpen={isProgressModalOpen}
          setIsProgressModalOpen={setIsProgressModalOpen}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          deepWorkStats={deepWorkStats}
          pendingTasksCount={pendingTasksCount}
          energyGraphData={energyGraphData}
          overview={overview}
          milestones={milestones}
          scheduleItems={scheduleItems}
          user={user}
          handleShareProgress={handleShareProgress}
          formatMinutesToHours={formatMinutesToHours}
        />

        <section className="grid gap-6 lg:grid-cols-3">
          <DashboardHeader
            user={user}
            onShuffleOverview={handleShuffleOverview}
            onUpdateBlueprint={handleUpdateBlueprintClick}
            onShareProgress={() => setIsProgressModalOpen(true)}
            deepWorkStats={deepWorkStats}
            deepWorkGoalInput={deepWorkGoalInput}
            setDeepWorkGoalInput={setDeepWorkGoalInput}
            onSaveDeepWorkGoal={handleSaveDeepWorkGoal}
            formatMinutesToHours={formatMinutesToHours}
          />

          <ActivityGraph
            energyGraphData={energyGraphData}
            hoveredDay={hoveredDay}
            setHoveredDay={setHoveredDay}
          />
        </section>

        <StatsCards
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          deepWorkStats={deepWorkStats}
          pendingTasksCount={pendingTasksCount}
          formatMinutesToHours={formatMinutesToHours}
          setIsStreakDetailsOpen={setIsStreakDetailsOpen}
          setIsFocusTimerOpen={setIsFocusTimerOpen}
          setIsPendingTasksOpen={setIsPendingTasksOpen}
          formattedFocusTime={formattedFocusTime}
          isFocusRunning={isFocusRunning}
        />

        <FocusTimer
          isFocusTimerOpen={isFocusTimerOpen}
          setIsFocusTimerOpen={setIsFocusTimerOpen}
          focusMinutes={focusMinutes}
          setFocusMinutes={setFocusMinutes}
          formattedFocusTime={formattedFocusTime}
          isFocusRunning={isFocusRunning}
          handleStartFocus={handleStartFocus}
          handlePauseFocus={handlePauseFocus}
          handleResetFocus={handleResetFocus}
        />

        <StreakDetails
          isStreakDetailsOpen={isStreakDetailsOpen}
          setIsStreakDetailsOpen={setIsStreakDetailsOpen}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          lastActivityDate={lastActivityDate}
        />

        <PendingTasks
          isPendingTasksOpen={isPendingTasksOpen}
          setIsPendingTasksOpen={setIsPendingTasksOpen}
          pendingTasks={pendingTasks}
          pendingTasksCount={pendingTasksCount}
        />

        <section className="grid gap-6 lg:grid-cols-5">
          <OverviewSection
            overview={overview}
            newOverviewLabel={newOverviewLabel}
            newOverviewValue={newOverviewValue}
            setNewOverviewLabel={setNewOverviewLabel}
            setNewOverviewValue={setNewOverviewValue}
            handleAddOverview={handleAddOverview}
            handleShuffleOverview={handleShuffleOverview}
            overviewRef={overviewRef}
          />

          <SchedulesSection
            scheduleItems={scheduleItems}
            newScheduleTime={newScheduleTime}
            newScheduleTitle={newScheduleTitle}
            newScheduleDetail={newScheduleDetail}
            handleAddSchedule={handleAddSchedule}
            handleCompleteSchedule={handleCompleteSchedule}
            handleDeleteSchedule={handleDeleteSchedule}
            setNewScheduleTime={setNewScheduleTime}
            setNewScheduleTitle={setNewScheduleTitle}
            setNewScheduleDetail={setNewScheduleDetail}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <MilestonesSection
            milestones={milestones}
            newMilestoneTitle={newMilestoneTitle}
            newMilestoneDetail={newMilestoneDetail}
            newMilestoneState={newMilestoneState}
            handleAddMilestone={handleAddMilestone}
            setNewMilestoneTitle={setNewMilestoneTitle}
            setNewMilestoneDetail={setNewMilestoneDetail}
            setNewMilestoneState={setNewMilestoneState}
          />

          <AISummary
            notes={notes}
            summary={summary}
            isSummarizing={isSummarizing}
            aiPlaceholder={aiPlaceholder}
            handleSummarize={handleSummarize}
            handleAttachClick={handleAttachClick}
            attachInputRef={attachInputRef}
            handleAttachFileChange={handleAttachFileChange}
            setNotes={setNotes}
            updateStreak={updateStreak}
          />
        </section>
      </main>
    </div>
  );
}

