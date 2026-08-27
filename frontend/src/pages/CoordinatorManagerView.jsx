import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LogOut, ArrowLeft, BarChart3 } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./CoordinatorDashboard.css";

function CoordinatorManagerView() {
  const { managerId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [manager, setManager] = useState(null);
  const [ngoName, setNgoName] = useState("");
  const [volunteers, setVolunteers] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadManager() {
      setLoading(true);
      setFetchError("");

      try {
        const res = await api.get(
          `/api/coordinator/manager/${managerId}`
        );

        if (cancelled) return;

        const data = res.data || {};

        setManager(data.manager || null);
        setNgoName(data.ngoName || "");
        setVolunteers(data.volunteers || []);
      } catch (err) {
        if (cancelled) return;

        const message =
          err.response?.data?.message ||
          "Couldn't load manager data.";

        setFetchError(message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadManager();

    return () => {
      cancelled = true;
    };
  }, [managerId]);

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
          </span>

          <button
            className="btn-outline"
            onClick={logout}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dash-content">

        {/* BACK BUTTON */}
        <button
          className="btn-outline"
          onClick={() =>
            navigate("/coordinator/dashboard")
          }
        >
          <ArrowLeft size={15} />
          Back to Coordinator Dashboard
        </button>

        {/* LOADING */}
        {loading ? (
          <div className="dash-loading">
            Loading manager data...
          </div>
        ) : fetchError ? (
          <div className="dash-fetch-error">
            {fetchError}
          </div>
        ) : (
          <>
            <h1 style={{ marginTop: "20px" }}>
              {manager?.name}'s Volunteers
            </h1>

            <p
              className="section-heading"
              style={{
                marginTop: "4px",
                marginBottom: "24px",
              }}
            >
              {ngoName}
            </p>

            {volunteers.length ? (
              <table className="volunteer-table">

                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Total hours</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {volunteers.map((v) => (
                    <tr key={v.id}>

                      {/* VOLUNTEER NAME */}
                      <td>
                        {v.name}
                      </td>

                      {/* TOTAL HOURS */}
                      <td>
                        {v.totalHours ?? 0} hrs
                      </td>

                      {/* OPEN DASHBOARD */}
                      <td>
                        <button
                          className="btn-outline"
                          onClick={() =>
                            navigate(
                              `/coordinator/volunteer/${v.id}`
                            )
                          }
                        >
                          <BarChart3 size={14} />
                          Open dashboard
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            ) : (
              <div className="empty-state">
                No volunteers under this manager yet.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CoordinatorManagerView;