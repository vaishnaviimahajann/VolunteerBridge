import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, Users, X, Bell, ArrowRight, Trash2 } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./CoordinatorDashboard.css";

// Cycled across manager avatars since the backend doesn't send a color
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

function CoordinatorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [managers, setManagers] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [collegeName, setCollegeName] = useState(
    user?.collegeName || user?.college?.name || ""
  );
  const [deletingEventId, setDeletingEventId] = useState(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const [eventForm, setEventForm] = useState({ name: "", date: "" });
  const [eventError, setEventError] = useState("");
  const [eventLoading, setEventLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setLoading(true);
      setFetchError("");
      try {
        const res = await api.get("/api/coordinator/dashboard");
        if (cancelled) return;

        const data = res.data || {};
        setManagers(data.managers || []);
        setUpcomingEvents(data.upcomingEvents || []);
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

  const handleOpenManagerDashboard = (managerId) => {
    navigate(`/coordinator/manager/${managerId}`);
  };

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
      await api.post("/api/coordinator/invite-manager", {
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

  const handleEventChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
    if (eventError) setEventError("");
  };

  const handlePlanEvent = async (e) => {
    e.preventDefault();
    setEventError("");

    if (!eventForm.name.trim() || !eventForm.date) {
      setEventError("Please enter an event name and date");
      return;
    }

    setEventLoading(true);
    try {
      const res = await api.post("/api/coordinator/plan-event", {
        name: eventForm.name.trim(),
        date: eventForm.date,
      });

      const newEvent = res.data?.event || {
        id: Date.now().toString(),
        name: eventForm.name.trim(),
        date: eventForm.date,
        notified: true,
      };

      setUpcomingEvents((prev) => [newEvent, ...prev]);
      setEventForm({ name: "", date: "" });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Couldn't plan event. Please try again.";
      setEventError(message);
    } finally {
      setEventLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Delete this event? This can't be undone.")) return;

    setDeletingEventId(eventId);
    try {
      await api.delete(`/api/coordinator/event/${eventId}`);
      setUpcomingEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err) {
      const message =
        err.response?.data?.message || "Couldn't delete event. Please try again.";
      alert(message);
    } finally {
      setDeletingEventId(null);
    }
  };

  return (
    <div className="dash-page">
      {/* NAVBAR */}
      <nav className="dash-navbar">
        <div className="dash-logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
        <div className="dash-nav-right">
          <span className="dash-user-info">
            {user?.name}
            {collegeName && <span className="muted"> · {collegeName}</span>}
          </span>
          <button className="btn-outline" onClick={logout}>
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dash-content">
        {/* TOP ROW */}
        <div className="dash-top-row">
          <h1>Coordinator Dashboard</h1>
          <button
            className="btn-outline"
            onClick={() => setShowInviteModal(true)}
          >
            <Plus size={15} />
            Invite Manager
          </button>
        </div>

        {loading ? (
          <div className="dash-loading">Loading dashboard...</div>
        ) : fetchError ? (
          <div className="dash-fetch-error">{fetchError}</div>
        ) : (
          <>
            {/* MANAGERS SECTION */}
            <h2 className="section-heading">Managers &amp; their volunteers</h2>

            {managers.length === 0 ? (
              <div className="empty-state" style={{ marginBottom: "32px" }}>
                No managers yet — invite your first manager to get started.
              </div>
            ) : (
              <div className="managers-grid">
                {managers.map((manager, index) => {
                  const colors = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  return (
                    <div className="manager-card" key={manager.id}>
                      <div
                        className="avatar-circle"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.color,
                        }}
                      >
                        {getInitials(manager.name)}
                      </div>
                      <h3>{manager.name}</h3>
                      <p className="manager-ngo">{manager.ngoName}</p>
                      <p className="manager-volunteer-count">
                        <Users size={14} />
                        {manager.volunteerCount ?? 0} volunteers
                      </p>
                      <button
                        className="open-dashboard-btn"
                        onClick={() => handleOpenManagerDashboard(manager.id)}
                      >
                        Open dashboard
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="dash-divider" />

            {/* PLAN AN EVENT */}
            <h2 className="section-heading">Plan an event</h2>
            <div className="event-card">
              {eventError && (
                <p
                  className="field-error"
                  style={{ marginBottom: "12px" }}
                >
                  {eventError}
                </p>
              )}

              <form onSubmit={handlePlanEvent}>
                <div className="event-form-row">
                  <div className="event-form-group">
                    <label htmlFor="eventName">Event name</label>
                    <input
                      id="eventName"
                      name="name"
                      type="text"
                      placeholder="eg. Tree Plantation Drive"
                      value={eventForm.name}
                      onChange={handleEventChange}
                    />
                  </div>
                  <div className="event-form-group">
                    <label htmlFor="eventDate">Date</label>
                    <input
                      id="eventDate"
                      name="date"
                      type="date"
                      value={eventForm.date}
                      onChange={handleEventChange}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn-primary-green"
                    disabled={eventLoading}
                  >
                    {eventLoading ? "Planning..." : "Plan event"}
                  </button>
                </div>
              </form>

              <p className="notify-hint">
                <Bell size={14} />
                All managers and volunteers will be notified automatically
                when you plan an event
              </p>

              <h3 className="upcoming-title">Upcoming events</h3>
              {upcomingEvents.length === 0 ? (
                <div className="empty-state">No upcoming events yet.</div>
              ) : (
                upcomingEvents.map((event) => (
                  <div className="event-row" key={event.id || event.name}>
                    <div>
                      <p className="event-name">{event.name}</p>
                      <p className="event-date">{formatDate(event.date)}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {event.notified !== false && (
                        <span className="notified-badge">All notified</span>
                      )}
                      <button
                        className="btn-outline"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={deletingEventId === event.id}
                        aria-label="Delete event"
                        title="Delete event"
                      >
                        <Trash2 size={14} />
                        {deletingEventId === event.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* INVITE MANAGER MODAL */}
      {showInviteModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowInviteModal(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3>Invite Manager</h3>
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
                  placeholder="Rohan Mehta"
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
                  placeholder="rohan@example.com"
                  value={inviteForm.email}
                  onChange={handleInviteChange}
                />
              </div>
              <button
                type="submit"
                className="modal-submit-btn"
                disabled={inviteLoading}
              >
                {inviteLoading ? "Sending invite..." : "Invite Manager"}
              </button>
            </form>

            <p className="modal-hint">
              Manager will get a secure link · Expires in 24 hours
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CoordinatorDashboard;
