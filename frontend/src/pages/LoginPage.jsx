import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./AuthShared.css";

// Where each role should land after a successful login
const roleRedirects = {
  coordinator: "/coordinator/dashboard",
  manager: "/manager/dashboard",
  volunteer: "/volunteer/dashboard",
};

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.email.trim() || !formData.password) {
      setFormError("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      // Backend returns { message, token, user: { ..., role } }
      login(res.data);

      const role = res.data.user?.role;
      navigate(roleRedirects[role] || "/");
    } catch (err) {
      const status = err.response?.status;
      const message =
        status === 400
          ? "Invalid email or password"
          : err.response?.data?.message ||
            "Something went wrong. Please try again.";
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
          <h2>Welcome back</h2>
          <p className="auth-card-subtext">Login to your dashboard</p>

          {formError && <div className="form-error-banner">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@college.edu.in"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="auth-bottom-link" style={{ marginTop: "20px" }}>
            New coordinator? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
