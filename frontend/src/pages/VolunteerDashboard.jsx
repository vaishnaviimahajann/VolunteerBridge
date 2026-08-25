import { useState, useEffect } from "react";
import { LogOut, ChevronDown, ChevronUp, Check, Lock, Building2 } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./VolunteerDashboard.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function WeekCard({ week, isOpen, onToggle, onAddTask, ngoCompleted }) {
  const [taskName, setTaskName] = useState("");
  const [taskHours, setTaskHours] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);
  const isCurrent = !!week.isCurrentWeek;

  const handleAdd = async () => {
    setAddError("");
    if (!taskName.trim()) { setAddError("Enter a task description"); return; }
    const hours = parseFloat(taskHours);
    if (!taskHours || Number.isNaN(hours) || hours <= 0) { setAddError("Enter valid hours"); return; }
    setAdding(true);
    try {
      await onAddTask(week.id, taskName.trim(), hours);
      setTaskName("");
      setTaskHours("");
    } catch (err) {
      setAddError(err.response?.data?.message || "Couldn't add task. Try again.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`week-card ${isCurrent ? "current-week" : ""}`}>
      <button className="week-header" onClick={onToggle}>
        <div className="week-header-left">
          <div className="week-title-row">
            <span className="week-title">Week {week.weekNumber}</span>
            {isCurrent && <span className="this-week-badge">This week</span>}
          </div>
          <span className="week-dates">
            {formatDate(week.startDate)} — {formatDate(week.endDate)}
          </span>
        </div>
        <div className="week-header-right">
          <span className="week-hours">{week.totalHours ?? 0} hrs</span>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="week-body">
          {week.tasks?.length ? (
            week.tasks.map((task) => (
              <div className="task-row" key={task.id || task.taskName}>
                <span className="task-name">{task.taskName}</span>
                <span className="task-hours-badge">{task.hoursSpent} hrs</span>
              </div>
            ))
          ) : (
            <p className="week-no-tasks">No tasks logged for this week.</p>
          )}

          {isCurrent && !ngoCompleted && (
            <>
              {addError && <p className="add-task-error">{addError}</p>}
              <div className="add-task-row">
                <input
                  type="text"
                  placeholder="Task description"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="eg. 2 hrs"
                  value={taskHours}
                  onChange={(e) => setTaskHours(e.target.value)}
                />
                <button
                  className="add-task-btn"
                  onClick={handleAdd}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "+ Add"}
                </button>
              </div>
            </>
          )}

          {isCurrent && ngoCompleted && (
            <div className="task-locked-row">
              <Lock size={14} />
              <span>Task logging is locked — your NGO internship is marked complete.</span>
            </div>
          )}

          <div className="week-footer-row">
            <span>
              {week.tasks?.length || 0} task
              {week.tasks?.length === 1 ? "" : "s"} this week
            </span>
            <span className="week-total">Total: {week.totalHours ?? 0} hrs</span>
          </div>
        </div>
      )}
    </div>
  );
}

function VolunteerDashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [ngo, setNgo] = useState(null);
  const [ngoStatus, setNgoStatus] = useState("active");
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [events, setEvents] = useState([]);
  const [collegeName, setCollegeName] = useState(user?.collegeName || "");
  const [openWeekId, setOpenWeekId] = useState("current");
  const [markingEventId, setMarkingEventId] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completing, setCompleting] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("/api/volunteer/dashboard");
      const data = res.data || {};
      setNgo(data.ngo || null);
      setNgoStatus(data.ngoStatus || "active");
      setWeeklyProgress(data.weeklyProgress || []);
      setEvents(data.events || []);
      if (data.collegeName) setCollegeName(data.collegeName);
      const currentWeek = (data.weeklyProgress || []).find((w) => w.isCurrentWeek);
      setOpenWeekId(currentWeek?.id ?? "current");
    } catch (err) {
      const message = err.response?.data?.message || "Couldn't load dashboard data. Please try again.";
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  const thisWeekHours = weeklyProgress.find((w) => w.isCurrentWeek)?.totalHours ?? 0;
  const totalHours = weeklyProgress.reduce((sum, w) => sum + (w.totalHours || 0), 0);
  const tasksCompleted = weeklyProgress.reduce((sum, w) => sum + (w.tasks?.length || 0), 0);

  const handleToggleWeek = (weekId) => {
    setOpenWeekId((prev) => (prev === weekId ? null : weekId));
  };

  const handleAddTask = async (weekId, taskName, hoursSpent) => {
    await api.post("/api/volunteer/add-task", { taskName, hoursSpent });
    await loadDashboard();
    setOpenWeekId(weekId);
  };

  const handleMarkAttended = async (eventId) => {
    setMarkingEventId(eventId);
    try {
      await api.post("/api/volunteer/mark-attendance", { eventId });
      setEvents((prev) =>
        prev.map((ev) => (ev.id === eventId ? { ...ev, attended: true } : ev))
      );
    } catch (err) {
    } finally {
      setMarkingEventId(null);
    }
  };

  const handleConfirmComplete = async () => {
    setCompleting(true);
    try {
      await api.post("/api/volunteer/complete-ngo");
      setNgoStatus("completed");
      setShowCompleteModal(false);
    } catch (err) {
    } finally {
      setCompleting(false);
    }
  };

  const defaultCurrentWeek = {
    id: "current",
    weekNumber: 1,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    tasks: [],
    totalHours: 0,
    isCurrentWeek: true,
  };

  return (
    <div className="vol-page">
      {/* NAVBAR */}
      <nav className="vol-navbar">
        <div className="vol-logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
        <div className="vol-nav-right">
          <span className="vol-user-info">
            {user?.name} · <span className="vol-role">Volunteer</span>
          </span>
          <button className="vol-logout-btn" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </nav>

      <div className="vol-content">
        {/* HEADING */}
        <div className="vol-heading">
          <h1>My dashboard</h1>
          <p className="vol-subtitle">{collegeName || "Your College"}</p>
        </div>

        {loading && <p className="vol-loading">Loading...</p>}
        {fetchError && <p className="vol-error">{fetchError}</p>}

        {!loading && (
          <>
            {/* STATS ROW */}
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">This week</p>
                <p className="stat-value accent">{thisWeekHours} hrs</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Total hours</p>
                <p className="stat-value">{totalHours} hrs</p>
              </div>
              <div className="stat-card">
                <p className="stat-label">Tasks done</p>
                <p className="stat-value">{tasksCompleted}</p>
              </div>
            </div>

            {/* MY NGO */}
            <section className="vol-section">
              {ngo ? (
                <div className="ngo-card">
                  <div className="ngo-card-top">
                    <div className="ngo-icon">
                      <Building2 size={18} />
                    </div>
                    <span className="ngo-name">{ngo.name}</span>
                  </div>
                  <div className="ngo-status-row">
                    <button
                      className={`ngo-status-btn ${ngoStatus === "active" ? "active" : ""}`}
                      disabled
                    >
                      Active
                    </button>
                    <button
                      className={`ngo-status-btn ${ngoStatus === "completed" ? "completed" : ""}`}
                      onClick={() => setShowCompleteModal(true)}
                      disabled={ngoStatus === "completed"}
                    >
                      {ngoStatus === "completed" ? "Completed" : "Mark as completed"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ngo-empty">You haven't been assigned to an NGO yet.</div>
              )}
            </section>

            {/* WEEKLY PROGRESS */}
            <section className="vol-section">
              <h2 className="vol-section-title">Weekly progress</h2>

              {weeklyProgress.length === 0 ? (
                <WeekCard
                  week={defaultCurrentWeek}
                  isOpen={openWeekId === "current"}
                  onToggle={() => handleToggleWeek("current")}
                  onAddTask={handleAddTask}
                  ngoCompleted={ngoStatus === "completed"}
                />
              ) : (
                weeklyProgress.map((week) => (
                  <WeekCard
                    key={week.id}
                    week={week}
                    isOpen={openWeekId === week.id}
                    onToggle={() => handleToggleWeek(week.id)}
                    onAddTask={handleAddTask}
                    ngoCompleted={ngoStatus === "completed"}
                  />
                ))
              )}
            </section>

            {/* UPCOMING EVENTS */}
            <section className="vol-section">
              <h2 className="vol-section-title">Upcoming events</h2>
              {events.length === 0 ? (
                <div className="events-empty">No upcoming events yet.</div>
              ) : (
                <div className="events-card">
                  {events.map((ev) => (
                    <div className="event-row" key={ev.id}>
                      <div className="event-info">
                        <span className="event-name">{ev.name}</span>
                        <span className="event-date">
                          {formatDate(ev.date)}
                          {ev.isToday ? " · 10:00 AM" : ""}
                        </span>
                      </div>
                      {ev.isToday ? (
                        ev.attended ? (
                          <span className="event-marked-badge">
                            <Check size={14} /> Marked
                          </span>
                        ) : (
                          <button
                            className="mark-attended-btn"
                            onClick={() => handleMarkAttended(ev.id)}
                            disabled={markingEventId === ev.id}
                          >
                            {markingEventId === ev.id ? "Marking..." : "Mark attended"}
                          </button>
                        )
                      ) : (
                        <span className="event-upcoming-badge">Upcoming</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* CONFIRM COMPLETE MODAL */}
      {showCompleteModal && (
        <div
          className="confirm-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !completing) setShowCompleteModal(false);
          }}
        >
          <div className="confirm-card">
            <div className="confirm-icon">
              <Check size={20} />
            </div>
            <p className="confirm-title">Is your NGO internship completed?</p>
            <p className="confirm-sub">You won't be able to log tasks after this.</p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel-btn"
                onClick={() => setShowCompleteModal(false)}
                disabled={completing}
              >
                Cancel
              </button>
              <button
                className="confirm-ok-btn"
                onClick={handleConfirmComplete}
                disabled={completing}
              >
                {completing ? "..." : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VolunteerDashboard;
