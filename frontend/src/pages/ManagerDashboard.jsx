import { useState, useEffect } from "react";
import { LogOut, Plus, X, BarChart3 } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./ManagerDashboard.css";

const AVATAR_COLORS = [
  { bg: "rgba(167, 139, 250, 0.18)", color: "#a78bfa" }, // purple
  { bg: "rgba(224, 138, 107, 0.18)", color: "#e08a6b" }, // coral
  { bg: "rgba(29, 158, 117, 0.18)", color: "#1d9e75" }, // green
  { bg: "rgba(245, 197, 106, 0.18)", color: "#f5c56a" }, // amber
  { bg: "rgba(96, 165, 250, 0.18)", color: "#60a5fa" }, // blue
];

function getInitials(name = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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

function EventBadge({ isToday }) {
  return (
    <span className={`pill-badge ${isToday ? "pill-today" : "pill-upcoming"}`}>
      {isToday ? "Today" : "Upcoming"}
    </span>
  );
}

function HistoryStatusBadge({ status }) {
  const isAttended = status === "attended";
  return (
    <span
      className={`status-badge ${
        isAttended ? "status-attended" : "status-missed"
      }`}
    >
      {isAttended ? "Attended" : "Missed"}
    </span>
  );
}

function ManagerDashboard() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [volunteers, setVolunteers] = useState([]);
  const [events, setEvents] = useState([]);
  const [ngoName, setNgoName] = useState(user?.ngoName || "");
  const [collegeName, setCollegeName] = useState(user?.collegeName || "");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [progressVolunteer, setProgressVolunteer] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setFetchError("");
      try {
        const res = await api.get("/api/manager/dashboard");
        if (cancelled) return;

        const data = res.data || {};
        setVolunteers(data.volunteers || []);
        setEvents(data.events || []);
        if (data.ngoName) setNgoName(data.ngoName);
        if (data.collegeName) setCollegeName(data.collegeName);
      } catch (err) {
        if (cancelled) return;
        const message =
          err.response?.data?.message ||
          "Couldn't load dashboard data. Please try again.";
        setFetchError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleInviteChange = (e) => {
    const { name, value } = e.target;
    setInviteForm((prev) => ({ ...prev, [name]: value }));
    if (inviteError) setInviteError("");
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteSuccess("");

    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setInviteError("Please fill in both fields");
      return;
    }

    setInviteLoading(true);
    try {
      await api.post("/api/manager/invite-volunteer", {
        name: inviteForm.name.trim(),
        email: inviteForm.email.trim(),
      });
      setInviteSuccess("Invite sent successfully!");
      setInviteForm({ name: "", email: "" });
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 1200);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Couldn't send invite. Please try again.";
      setInviteError(message);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleViewProgress = async (volunteer) => {
    setProgressVolunteer(volunteer);
    setProgressData(null);
    setProgressError("");
    setProgressLoading(true);

    try {
      const res = await api.get(
        `/api/manager/volunteer-progress/${volunteer.id}`
      );
      setProgressData(res.data);
    } catch (err) {
      const message =
        err.response?.data?.message || "Couldn't load progress data.";
      setProgressError(message);
    } finally {
      setProgressLoading(false);
    }
  };

  const closeProgressModal = () => {
    setProgressVolunteer(null);
    setProgressData(null);
    setProgressError("");
  };

  return (
    <div className="mgr-page">
      {/* NAVBAR */}
      <nav className="mgr-navbar">
        <div className="mgr-logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
        <div className="mgr-nav-right">
          <span className="mgr-user-info">
            {user?.name}
            <span className="muted"> · Manager</span>
          </span>
          <button className="btn-outline-sm" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="mgr-content">
        {/* TOP ROW */}
        <div className="mgr-top-row">
          <h1>Manager Dashboard</h1>
          <button
            className="btn-outline-sm"
            onClick={() => setShowInviteModal(true)}
          >
            <Plus size={15} />
            Invite Volunteer
          </button>
        </div>
        <p className="mgr-subtitle">
          {ngoName}
          {collegeName && ` · ${collegeName}`}
        </p>

        {loading ? (
          <div className="mgr-loading">Loading dashboard...</div>
        ) : fetchError ? (
          <div className="mgr-fetch-error">{fetchError}</div>
        ) : (
          <>
            {/* MY VOLUNTEERS */}
            <h2 className="mgr-section-heading">My Volunteers</h2>
            {volunteers.length === 0 ? (
              <div className="list-card">
                <div className="mgr-empty">
                  No volunteers yet — invite your first volunteer to get
                  started.
                </div>
              </div>
            ) : (
              <div className="list-card">
                {volunteers.map((volunteer, index) => {
                  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  return (
                    <div className="list-row" key={volunteer.id}>
                      <div className="list-row-left">
                        <div
                          className="avatar-circle"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.color,
                          }}
                        >
                          {getInitials(volunteer.name)}
                        </div>
                        <div>
                          <p className="list-row-name">{volunteer.name}</p>
                          <p className="list-row-sub">
                            {volunteer.ngoName || ngoName}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn-outline-sm"
                        onClick={() => handleViewProgress(volunteer)}
                      >
                        <BarChart3 size={14} />
                        View Progress
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* UPCOMING EVENTS */}
            <h2 className="mgr-section-heading">Upcoming Events</h2>
            {events.length === 0 ? (
              <div className="list-card">
                <div className="mgr-empty">No upcoming events yet.</div>
              </div>
            ) : (
              <div className="list-card">
                {events.map((event) => (
                  <div className="event-row" key={event.id || event.name}>
                    <div>
                      <p className="event-name">{event.name}</p>
                      <p className="event-meta">
                        {event.isToday ? "Today" : formatDate(event.date)}
                        {" · Planned by Coordinator"}
                      </p>
                    </div>
                    <EventBadge isToday={event.isToday} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* INVITE VOLUNTEER MODAL */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3>Invite Volunteer</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowInviteModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="modal-subtext">
              They will receive an email invite link to join your college
              workspace
            </p>

            {inviteError && <div className="modal-error">{inviteError}</div>}
            {inviteSuccess && (
              <div className="modal-success">{inviteSuccess}</div>
            )}

            <form onSubmit={handleInviteSubmit}>
              <div className="modal-form-group">
                <label htmlFor="inviteName">Full name</label>
                <input
                  id="inviteName"
                  name="name"
                  type="text"
                  placeholder="eg. Anjali Sharma"
                  value={inviteForm.name}
                  onChange={handleInviteChange}
                />
              </div>
              <div className="modal-form-group">
                <label htmlFor="inviteEmail">Email address</label>
                <input
                  id="inviteEmail"
                  name="email"
                  type="email"
                  placeholder="eg. anjali@gmail.com"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                />
              </div>
              <button
                type="submit"
                className="modal-submit-btn"
                disabled={inviteLoading}
              >
                {inviteLoading ? "Sending invite..." : "Invite Volunteer"}
              </button>
            </form>

            <p className="modal-hint">
              Volunteer will get a secure link · Expires in 24 hours
            </p>
          </div>
        </div>
      )}

      {/* PROGRESS MODAL */}
      {progressVolunteer && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeProgressModal();
          }}
        >
          <div className="modal-card modal-wide">
            <div className="modal-header">
              <h3>Progress</h3>
              <button
                className="modal-close-btn"
                onClick={closeProgressModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <p className="progress-name">{progressVolunteer.name}</p>

            {progressLoading ? (
              <div className="progress-loading">Loading progress...</div>
            ) : progressError ? (
              <div className="modal-error">{progressError}</div>
            ) : (
              <>
                <div className="stat-grid">
                  <div className="stat-box">
                    <p className="stat-value">
                      {progressData?.totalHours ?? 0}
                    </p>
                    <p className="stat-label">Total hours</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-value">
                      {progressData?.eventsAttended ?? 0}
                    </p>
                    <p className="stat-label">Events attended</p>
                  </div>
                  <div className="stat-box">
                    <p className="stat-value">
                      {progressData?.thisMonthHours ?? 0}
                    </p>
                    <p className="stat-label">This month</p>
                  </div>
                </div>

                <h4 className="progress-history-title">
                  Recent event history
                </h4>
                {progressData?.history?.length ? (
                  <table className="history-table">
                    <tbody>
                      {progressData.history.map((item) => (
                        <tr key={item.id || item.eventName}>
                          <td>
                            <p className="history-event-name">
                              {item.eventName}
                            </p>
                            <p className="history-event-date">
                              {formatDate(item.date)}
                            </p>
                          </td>
                          <td className="history-status">
                            <HistoryStatusBadge status={item.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="mgr-empty">No event history yet.</div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerDashboard;
