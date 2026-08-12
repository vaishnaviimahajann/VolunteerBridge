import { useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  MoreHorizontal,
  Check,
  LayoutDashboard,
  Mail,
  FileText,
} from "lucide-react";
import "./LandingPage.css";

const steps = [
  {
    number: 1,
    title: "Coordinator registers",
    description:
      "Your college coordinator creates an account and sets up the organization",
  },
  {
    number: 2,
    title: "Invite managers",
    description:
      "Coordinator sends email invites to student managers — they join instantly",
  },
  {
    number: 3,
    title: "Managers invite volunteers",
    description:
      "Each manager builds their own team by inviting volunteers via email",
  },
  {
    number: 4,
    title: "Track everything",
    description:
      "Attendance, hours, NGO assignments — all updated in real time",
  },
];

const roles = [
  {
    badge: "Coordinator",
    badgeClass: "badge-coordinator",
    title: "Full visibility",
    bullets: [
      "Manage all NGOs",
      "Invite & oversee managers",
      "View overall impact reports",
      "Track all volunteers",
    ],
  },
  {
    badge: "Student Manager",
    badgeClass: "badge-manager",
    title: "Team control",
    bullets: [
      "Invite your volunteers",
      "Create & manage events",
      "Track attendance daily",
      "View team progress",
    ],
  },
  {
    badge: "Volunteer",
    badgeClass: "badge-volunteer",
    title: "Simple updates",
    bullets: [
      "Mark attendance in one click",
      "View your NGO assignment",
      "Track your total hours",
      "See your event history",
    ],
  },
];

const features = [
  {
    icon: Check,
    iconClass: "icon-green",
    title: "One-click attendance",
    description:
      "No more WhatsApp updates — volunteers mark themselves present instantly",
  },
  {
    icon: LayoutDashboard,
    iconClass: "icon-purple",
    title: "Live dashboards",
    description:
      "Real-time view of who's present, total hours, and NGO status",
  },
  {
    icon: Mail,
    iconClass: "icon-coral",
    title: "Invite by email",
    description:
      "Managers and volunteers join securely through email invite links",
  },
  {
    icon: FileText,
    iconClass: "icon-amber",
    title: "Auto reports",
    description:
      "Monthly impact reports generated automatically — no manual work",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          Volunteer<span className="accent">Bridge</span>
        </div>
        <div className="nav-actions">
          <button className="btn" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="btn" onClick={() => navigate("/register")}>
            Register as Coordinator
          </button>
          <button className="btn-icon" aria-label="More options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <h1>
          Manage your NGO volunteers
          <span className="accent-line">without the WhatsApp chaos</span>
        </h1>
        <p className="hero-subtext">
          VolunteerBridge brings coordinators, managers, and volunteers onto
          one platform — track attendance, hours, and NGO assignments all in
          one place.
        </p>
        <p className="hero-subtext-small">
          Designed for college NGO programs across India
        </p>
        <div className="hero-actions">
          <button className="btn" onClick={() => navigate("/register")}>
            Get started — it's free
          </button>
          <button
            className="btn"
            onClick={() =>
              document
                .getElementById("how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            See how it works
          </button>
        </div>
        <div className="scroll-arrow">
          <ArrowDown size={18} />
        </div>
      </section>

      <div className="divider" />

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <h2 className="section-title">How it works</h2>
        <p className="section-subtitle">
          Four simple steps to get your entire team on board
        </p>
        <div className="steps-grid">
          {steps.map((step) => (
            <div className="card" key={step.number}>
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <div className="scroll-arrow">
          <ArrowDown size={18} />
        </div>
      </section>

      <div className="divider" />

      {/* ONE PLATFORM, THREE ROLES */}
      <section className="section">
        <h2 className="section-title">One platform, three roles</h2>
        <p className="section-subtitle">
          Every person sees only what they need
        </p>
        <div className="roles-grid">
          {roles.map((role) => (
            <div className="role-card" key={role.badge}>
              <span className={`badge ${role.badgeClass}`}>
                {role.badge}
              </span>
              <h3>{role.title}</h3>
              <ul>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>
                    <ArrowRight size={14} className="arrow" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* EVERYTHING YOUR TEAM NEEDS */}
      <section className="section">
        <h2 className="section-title">Everything your team needs</h2>
        <div className="features-grid">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div className="card" key={feature.title}>
                <div className={`feature-icon ${feature.iconClass}`}>
                  <Icon size={20} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to bring your NGO team online?</h2>
        <p>Register your college today — free to use, no credit card needed</p>
        <button className="btn" onClick={() => navigate("/register")}>
          Register as Coordinator
        </button>
        <p className="cta-login-text">
          Already have an account?{" "}
          <a
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              navigate("/login");
            }}
          >
            Login here
          </a>
        </p>
      </section>
    </div>
  );
}

export default LandingPage;
