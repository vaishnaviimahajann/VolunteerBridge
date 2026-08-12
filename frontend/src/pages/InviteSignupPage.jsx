import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./AuthShared.css";

const roleRedirects = {
  coordinator: "/coordinator/dashboard",
  manager: "/manager/dashboard",
  volunteer: "/volunteer/dashboard",
};

const roleLabels = {
  coordinator: "Coordinator",
  manager: "Student Manager",
  volunteer: "Volunteer",
};

function InviteSignupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  const token = searchParams.get("token");

  const [inviteInfo, setInviteInfo] = useState(null);
  const [inviteInfoError, setInviteInfoError] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoadingInvite(false);
      return;
    }

    let cancelled = false;

    async function loadInviteInfo() {
      try {
        // Fetches the email/role tied to this invite token so we can
        // show the role as a read-only field before signup.
        const res = await api.get("/api/auth/invite-info", {
          params: { token },
        });
        if (!cancelled) setInviteInfo(res.data);
      } catch (err) {
        if (!cancelled) {
          // Not fatal — the role will still be set correctly server-side
          // when invite-signup runs, we just can't preview it here.
          setInviteInfoError("Couldn't preview invite details");
        }
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    }

    loadInviteInfo();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Please enter your name");
      return;
    }
    if (!password || password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/invite-signup", {
        token,
        name: name.trim(),
        password,
      });

      // Backend returns { message, token, user: { ..., role } }
      login(res.data);

      const role = res.data.user?.role;
      navigate(roleRedirects[role] || "/");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Couldn't create your account. Please try again.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* NAVBAR — logo only */}
      <nav className="auth-navbar">
        <div className="auth-logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
      </nav>

      <div className="auth-center-layout">
        <div className="auth-card auth-center-card">
          {!token ? (
            <>
              <h2>Invalid invite link</h2>
              <p className="auth-card-subtext">
                This invite link is missing or malformed. Please ask your
                coordinator or manager to send you a new one.
              </p>
            </>
          ) : (
            <>
              <h2>Welcome!</h2>
              <p className="auth-card-subtext">
                Just set your password — your role is already assigned
              </p>

              {inviteInfoError && (
                <p
                  className="helper-text"
                  style={{ textAlign: "center", marginBottom: "16px" }}
                >
                  {inviteInfoError} — you can still continue, your role will
                  be set correctly when you submit.
                </p>
              )}

              {formError && (
                <div className="form-error-banner">{formError}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label htmlFor="name">Your name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Rohan Mehta"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    readOnly
                    value={
                      loadingInvite
                        ? "Loading..."
                        : roleLabels[inviteInfo?.role] ||
                          "Set by your invite link"
                    }
                    style={{ color: "var(--text-secondary)", cursor: "default" }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-field">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create my account"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default InviteSignupPage;
