import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Eye, EyeOff, MoreHorizontal } from "lucide-react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import "./AuthShared.css";

const checkpoints = [
  "Free to use — no credit card needed",
  "Your college data stays completely separate",
  "Invite managers and volunteers instantly after signup",
  "Only coordinators can register — managers and volunteers join by invite",
];

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    collegeName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the field-specific error as soon as the user edits it
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.collegeName.trim())
      errors.collegeName = "College name is required";

    if (!formData.email.trim()) {
      errors.email = "College email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        password: formData.password,
        collegeName: formData.collegeName.trim(),
        phone: formData.phone.trim(),
      });

      // Backend returns { message, token, user }
      login(res.data);
      navigate("/coordinator/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* NAVBAR */}
      <nav className="auth-navbar">
        <div className="auth-logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
        <div className="auth-nav-right">
          <span>Already have an account?</span>
          <Link to="/login">Login</Link>
          <div className="auth-nav-icon">
            <MoreHorizontal size={16} />
          </div>
        </div>
      </nav>

      <div className="auth-layout">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <h1>Register your college</h1>
          <p className="auth-left-subtext">
            Set up your college's volunteer management system in under 2
            minutes.
          </p>
          <ul className="checkpoint-list">
            {checkpoints.map((text) => (
              <li key={text}>
                <span className="check-circle">
                  <Check size={13} strokeWidth={3} />
                </span>
                <span className="checkpoint-text">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SIDE — FORM CARD */}
        <div className="auth-card">
          <h2>Create coordinator account</h2>
          <p className="auth-card-subtext">
            You will be the admin of your college's workspace
          </p>

          {formError && <div className="form-error-banner">{formError}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Anjali"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={fieldErrors.firstName ? "input-error" : ""}
                />
                {fieldErrors.firstName && (
                  <p className="field-error">{fieldErrors.firstName}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Sharma"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={fieldErrors.lastName ? "input-error" : ""}
                />
                {fieldErrors.lastName && (
                  <p className="field-error">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="collegeName">College name</label>
              <input
                id="collegeName"
                name="collegeName"
                type="text"
                placeholder="eg. K.K. Wagh College, Nashik"
                value={formData.collegeName}
                onChange={handleChange}
                className={fieldErrors.collegeName ? "input-error" : ""}
              />
              {fieldErrors.collegeName ? (
                <p className="field-error">{fieldErrors.collegeName}</p>
              ) : (
                <p className="helper-text">
                  This will be your organization name on the platform
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">College email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="anjali@kkwagh.edu.in"
                value={formData.email}
                onChange={handleChange}
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email ? (
                <p className="field-error">{fieldErrors.email}</p>
              ) : (
                <p className="helper-text">
                  Use your official college email if possible
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
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
                  value={formData.password}
                  onChange={handleChange}
                  className={fieldErrors.password ? "input-error" : ""}
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
              {fieldErrors.password ? (
                <p className="field-error">{fieldErrors.password}</p>
              ) : (
                <p className="helper-text">Must be at least 8 characters</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <div className="password-field">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={fieldErrors.confirmPassword ? "input-error" : ""}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="field-error">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="legal-text">
              By registering you agree to our{" "}
              <a href="#terms">Terms of Service</a> and{" "}
              <a href="#privacy">Privacy Policy</a>
            </p>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-bottom-link">
            Already registered? <Link to="/login">Login to your account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
