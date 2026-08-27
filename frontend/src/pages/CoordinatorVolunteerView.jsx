
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Building2,
} from "lucide-react";
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

// Read-only week card
function ReadOnlyWeekCard({ week, isOpen, onToggle }) {
  const isCurrent = !!week.isCurrentWeek;

  return (
    <div className={`week-card ${isCurrent ? "current-week" : ""}`}>
      <button className="week-header" onClick={onToggle}>
        <div className="week-header-left">
          <div className="week-title-row">
            <span className="week-title">
              Week {week.weekNumber}
            </span>

            {isCurrent && (
              <span className="this-week-badge">
                This week
              </span>
            )}
          </div>

          <span className="week-dates">
            {formatDate(week.startDate)} — {formatDate(week.endDate)}
          </span>
        </div>

        <div className="week-header-right">
          <span className="week-hours">
            {week.totalHours ?? 0} hrs
          </span>

          {isOpen ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="week-body">
          {week.tasks?.length ? (
            week.tasks.map((task) => (
              <div
                className="task-row"
                key={task.id || task.taskName}
              >
                <span className="task-name">
                  <Check
                    size={14}
                    className="task-check-icon"
                  />
                  {task.taskName}
                </span>

                <span className="task-hours-badge">
                  {task.hoursSpent} hrs
                </span>
              </div>
            ))
          ) : (
            <p className="week-no-tasks">
              No tasks logged for this week.
            </p>
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

function CoordinatorVolunteerView() {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [volunteer, setVolunteer] = useState(null);
  const [ngo, setNgo] = useState(null);
  const [collegeName, setCollegeName] = useState("");
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [openWeekId, setOpenWeekId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setLoading(true);
      setFetchError("");

      try {
        // Coordinator-specific API
        const res = await api.get(
          `/api/coordinator/volunteer-progress/${volunteerId}`
        );

        if (cancelled) return;

        const data = res.data || {};

        setVolunteer(data.volunteer || null);
        setNgo(data.ngo || null);
        setCollegeName(data.collegeName || "");
        setWeeklyProgress(data.weeklyProgress || []);

        const currentWeek = (data.weeklyProgress || []).find(
          (w) => w.isCurrentWeek
        );

        setOpenWeekId(currentWeek?.id ?? null);
      } catch (err) {
        if (cancelled) return;

        const message =
          err.response?.data?.message ||
          "Couldn't load this volunteer's dashboard.";

        setFetchError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [volunteerId]);

  // This week's hours
  const thisWeekHours =
    weeklyProgress.find((w) => w.isCurrentWeek)?.totalHours ?? 0;

  // Total hours
  const totalHours = weeklyProgress.reduce(
    (sum, w) => sum + (w.totalHours || 0),
    0
  );

  // Total tasks
  const tasksCompleted = weeklyProgress.reduce(
    (sum, w) => sum + (w.tasks?.length || 0),
    0
  );

  const handleToggleWeek = (weekId) => {
    setOpenWeekId((prev) =>
      prev === weekId ? null : weekId
    );
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
            {user?.name} ·{" "}
            <span className="vol-role">
              Coordinator
            </span>
          </span>

          <button
            className="vol-logout-btn"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </nav>

      <div className="vol-content">

        {/* LOADING */}
        {loading && (
          <p className="vol-loading">
            Loading...
          </p>
        )}

        {/* ERROR */}
        {fetchError && (
          <p className="vol-error">
            {fetchError}
          </p>
        )}

        {!loading && !fetchError && (
          <>
            {/* HEADING */}
            <div className="vol-heading">
              <h1>
                {volunteer?.name || "Volunteer"}'s Dashboard
              </h1>

              <p className="vol-subtitle">
                {collegeName || "College"}
              </p>
            </div>

            {/* STATS ROW */}
            <div className="stats-grid">

              <div className="stat-card">
                <p className="stat-label">
                  This week
                </p>

                <p className="stat-value accent">
                  {thisWeekHours} hrs
                </p>
              </div>

              <div className="stat-card">
                <p className="stat-label">
                  Total hours
                </p>

                <p className="stat-value">
                  {totalHours} hrs
                </p>
              </div>

              <div className="stat-card">
                <p className="stat-label">
                  Tasks done
                </p>

                <p className="stat-value">
                  {tasksCompleted}
                </p>
              </div>

            </div>

            {/* NGO */}
            <section className="vol-section">

              {ngo ? (
                <div className="ngo-card">

                  <div className="ngo-card-top">

                    <div className="ngo-icon">
                      <Building2 size={18} />
                    </div>

                    <span className="ngo-name">
                      {ngo.name}
                    </span>

                  </div>

                  <span className="ngo-active-badge">
                    Active
                  </span>

                </div>
              ) : (
                <div className="ngo-empty">
                  This volunteer hasn't been assigned
                  to an NGO yet.
                </div>
              )}

            </section>

            {/* WEEKLY PROGRESS */}
            <section className="vol-section">

              <h2 className="vol-section-title">
                Weekly progress
              </h2>

              {weeklyProgress.length === 0 ? (
                <div className="ngo-empty">
                  No progress logged yet.
                </div>
              ) : (
                weeklyProgress.map((week) => (
                  <ReadOnlyWeekCard
                    key={week.id}
                    week={week}
                    isOpen={openWeekId === week.id}
                    onToggle={() =>
                      handleToggleWeek(week.id)
                    }
                  />
                ))
              )}

            </section>
          </>
        )}

      </div>
    </div>
  );
}

export default CoordinatorVolunteerView;