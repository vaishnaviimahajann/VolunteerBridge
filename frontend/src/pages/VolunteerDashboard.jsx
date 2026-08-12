import { useState, useEffect } from "react";
import { LogOut, ChevronDown, ChevronUp, Check } from "lucide-react";
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

function WeekCard({ week, isOpen, onToggle, onAddTask }) {
  const [taskName, setTaskName] = useState("");
  const [taskHours, setTaskHours] = useState("");
  const [addError, setAddError] = useState("");
  const [adding, setAdding] = useState(false);

  const isCurrent = !!week.isCurrentWeek;

  const handleAdd = async () => {
    setAddError("");

    if (!taskName.trim()) {
      setAddError("Enter a task description");
      return;
    }
    const hours = parseFloat(taskHours);
    if (!taskHours || Number.isNaN(hours) || hours <= 0) {
      setAddError("Enter valid hours");
      return;
    }

    setAdding(true);
    try {
      await onAddTask(week.id, taskName.trim(), hours);
      setTaskName("");
      setTaskHours("");
    } catch (err) {
      setAddError(
        err.response?.data?.message || "Couldn't add task. Try again."
      );
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
            {formatDate(week.startDate)} – {formatDate(week.endDate)}
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
                <span className="task-hours-badge">
                  {task.hoursSpent} hrs
                </span>
              </div>
            ))
          ) : (
            <p className="week-no-tasks">No tasks logged for this week.</p>
          )}

          {isCurrent && (
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

          <div className="week-footer-row">
            <span>
              {week.tasks?.length || 0} task
              {week.tasks?.length === 1 ? "" : "s"} this week
            </span>
            <span className="week-total">
              Total: {week.totalHours ?? 0} hrs
            </span>
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
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [events, setEvents] = useState([]);
  const [collegeName, setCollegeName] = useState(user?.collegeName || "");
  const [managerName, setManagerName] = useState("");

  const [openWeekId, setOpenWeekId] = useState(null);
  const [markingEventId, setMarkingEventId] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await api.get("/api/volunteer/dashboard");
      const data = res.data || {};

      setNgo(data.ngo || null);
      setWeeklyProgress(data.weeklyProgress || []);
      setEvents(data.events || []);
      if (data.collegeName) setCollegeName(data.collegeName);
      if (data.managerName) setManagerName(data.managerName);

      const currentWeek = (data.weeklyProgress || []).find(
        (w) => w.isCurrentWeek
      );
      setOpenWeekId(currentWeek?.id ?? null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Couldn't load dashboard data. Please try again.";
      setFetchError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalHours = weeklyProgress.reduce(
    (sum, w) => sum + (w.totalHours || 0),
    0
  );
  const tasksCompleted = weeklyProgress.reduce(
    (sum, w) => sum + (w.tasks?.length || 0),
    0
  );

  const handleToggleWeek = (weekId) => {
    setOpenWeekId((prev) => (prev === weekId ? null : weekId));
  };

  const handleAddTask = async (weekId, taskName, hoursSpent) => {
    await api.post("/api/volunteer/add-task", { taskName, hoursSpent });
    // Refresh weekly progress + totals from the server after adding
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
      // Keeping this simple for now — could surface a toast/error banner
      // here if the app grows a notification system later.
    } finally {
      setMarkingEventId(null);
    }
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
            {user?.name}
            <span className="muted"> · Volunteer</span>
          </span>
          <button className="btn-outline-sm" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="vol-content">
        <h1>My Dashboard</h1>
        <p className="vol-subtitle">
          {collegeName}
          {managerName && ` · Manager: ${managerName}`}
        </p>

        {loading ? (
          <div className="vol-loading">Loading dashboard...</div>
        ) : fetchError ? (
          <div className="vol-fetch-error">{fetchError}</div>
        ) : (
          <>
            {/* MY NGO */}
            <h2 className="vol-section-heading">My NGO</h2>
            {ngo ? (
              <div className="ngo-card">
                <div className="ngo-top-row">
                  <h3>{ngo.name}</h3>
                  <span
                    className={`pill-badge ${
                      ngo.status === "active"
                        ? "pill-active"
                        : "pill-upcoming"
                    }`}
                  >
                    {ngo.status === "active" ? "Active" : "Upcoming"}
                  </span>
                </div>
                <div className="ngo-date-row">
                  <div className="ngo-date-box">
                    <p className="ngo-date-label">Starting date</p>
                    <p className="ngo-date-value">
                      {formatDate(ngo.startDate)}
                    </p>
                  </div>
                  <div className="ngo-date-box">
                    <p className="ngo-date-label">Ending date</p>
                    <p className="ngo-date-value">
                      {formatDate(ngo.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="ngo-card">
                <div className="vol-empty">
                  You haven't been assigned to an NGO yet.
                </div>
              </div>
            )}

            {/* WEEKLY PROGRESS */}
            <h2 className="vol-section-heading">My Weekly Progress</h2>
            {weeklyProgress.length === 0 ? (
              <div className="vol-empty" style={{ marginBottom: "24px" }}>
                No weekly progress logged yet.
              </div>
            ) : (
              <div className="week-list">
                {weeklyProgress.map((week) => (
                  <WeekCard
                    key={week.id}
                    week={week}
                    isOpen={openWeekId === week.id}
                    onToggle={() => handleToggleWeek(week.id)}
                    onAddTask={handleAddTask}
                  />
                ))}
              </div>
            )}

            {/* TOTALS */}
            <div className="totals-card">
              <div>
                <p className="totals-label">Total hours so far</p>
                <p className="totals-value">{totalHours} hrs</p>
              </div>
              <div className="totals-right">
                <p className="totals-label">Tasks completed</p>
                <p className="totals-value">{tasksCompleted} tasks</p>
              </div>
            </div>

            {/* UPCOMING EVENTS */}
            <h2 className="vol-section-heading">Upcoming Events</h2>
            {events.length === 0 ? (
              <div className="list-card">
                <div className="vol-empty">No upcoming events yet.</div>
              </div>
            ) : (
              <div className="list-card">
                {events.map((event) => (
                  <div className="event-row" key={event.id}>
                    <div>
                      <p className="event-name">{event.name}</p>
                      <p className="event-meta">
                        {event.isToday
                          ? `Today${event.time ? ` · ${event.time}` : ""}`
                          : formatDate(event.date)}
                      </p>
                    </div>
                    {event.attended ? (
                      <span className="marked-badge">
                        <Check size={14} />
                        Marked
                      </span>
                    ) : event.isToday ? (
                      <button
                        className="btn-outline-sm"
                        onClick={() => handleMarkAttended(event.id)}
                        disabled={markingEventId === event.id}
                      >
                        {markingEventId === event.id
                          ? "Marking..."
                          : "Mark attended"}
                      </button>
                    ) : (
                      <span className="pill-badge pill-upcoming">
                        Upcoming
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VolunteerDashboard;
