# VolunteerBridge 🌱

A full-stack NGO volunteer management platform that eliminates WhatsApp-based updates and brings coordinators, managers, and volunteers onto one unified system.

> Built with the MERN stack — deployed with Docker and CI/CD pipeline.

---

## 🚀 Live Demo

🔗 https://volunteerbridge-1.onrender.com

---

## 📌 Project Overview

VolunteerBridge is a real-world solution built to solve a genuine problem faced during an NGO internship — volunteers had to manually send WhatsApp updates to their student manager every day. There was no central system to track attendance, hours, NGO assignments, or weekly progress.

This platform replaces that scattered workflow with a role-based web application where every user sees exactly what they need — nothing more, nothing less.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, React Router, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Authentication | JWT (JSON Web Tokens) |
| Email Service | Nodemailer with Gmail SMTP |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render |

---

## ✨ Key Features

- **Multi-college support** — Each college gets its own completely separate workspace. Data never mixes between colleges.
- **Role-based access control (RBAC)** — Three roles with different permissions: Coordinator, Student Manager, and Volunteer.
- **Invite-only system** — No one can self-register except coordinators. Managers and volunteers join only through secure email invite links.
- **One-click attendance** — Volunteers mark attendance with a single click. Manager sees updates instantly — no WhatsApp needed.
- **Weekly progress tracking** — Volunteers log their weekly tasks and hours worked. Displayed in a clean week-by-week format.
- **Event planning with auto-notification** — Coordinator plans an event and all managers and volunteers of that college see it immediately.
- **Secure invite tokens** — Invite links expire in 24 hours and can only be used once.
- **JWT authentication** — Stateless, secure authentication with role embedded in token.

---

## 👥 Three Roles — Three Dashboards

### 👑 Coordinator
- Registers the college on the platform
- Invites student managers via email
- Adds NGOs and assigns managers to them
- Plans events — visible to everyone in the college
- Views all managers, all volunteers, and overall progress

### 📋 Student Manager
- Joins via coordinator's email invite
- Invites volunteers to their team
- Views their own volunteers and their progress
- Sees upcoming events planned by coordinator

### 🙋 Volunteer
- Joins via manager's email invite
- Sees their allocated NGO, start date, and end date
- Marks attendance for events in one click
- Logs weekly tasks with hours spent
- Tracks total hours contributed week by week

---

## 🗂️ Repository Structure

```
volunteerbrige/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # All roles in one schema
│   │   ├── College.js            # Multi-college support
│   │   ├── NGO.js                # NGO details
│   │   ├── Event.js              # Events + attendance
│   │   ├── WeeklyProgress.js     # Volunteer weekly tasks
│   │   └── InviteToken.js        # Secure invite tokens
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── coordinator.routes.js
│   │   ├── manager.routes.js
│   │   └── volunteer.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── coordinator.controller.js
│   │   ├── manager.controller.js
│   │   └── volunteer.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification
│   │   └── role.middleware.js    # RBAC enforcement
│   ├── utils/
│   │   ├── sendEmail.js          # Nodemailer invite emails
│   │   └── generateToken.js      # Unique invite token generator
│   ├── .env
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── CoordinatorDashboard.jsx
│       │   ├── ManagerDashboard.jsx
│       │   └── VolunteerDashboard.jsx
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── InviteModal.jsx
│       │   ├── ManagerCard.jsx
│       │   ├── VolunteerCard.jsx
│       │   ├── WeeklyProgressBox.jsx
│       │   └── EventCard.jsx
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth + role state
│       ├── utils/
│       │   └── api.js            # Axios setup
│       └── App.jsx
│
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Auth (Public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Coordinator registers college |
| POST | `/api/auth/login` | All users login |
| POST | `/api/auth/invite-signup` | Invited user sets password |

### Coordinator (Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/coordinator/dashboard` | Get all managers, NGOs, events |
| POST | `/api/coordinator/invite-manager` | Send manager invite email |
| POST | `/api/coordinator/add-ngo` | Add new NGO |
| POST | `/api/coordinator/plan-event` | Plan event — notifies everyone |
| GET | `/api/coordinator/managers` | Get all managers with volunteer count |

### Manager (Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/manager/dashboard` | Get volunteers + events |
| POST | `/api/manager/invite-volunteer` | Send volunteer invite email |
| GET | `/api/manager/volunteer-progress/:id` | View specific volunteer's progress |

### Volunteer (Protected)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/volunteer/dashboard` | Get NGO, progress, events |
| POST | `/api/volunteer/mark-attendance` | Mark attendance for an event |
| POST | `/api/volunteer/add-task` | Add weekly task with hours |
| GET | `/api/volunteer/weekly-progress` | Get all weeks of progress |

---

## 🗄️ Database Collections

| Collection | Purpose |
|---|---|
| `users` | All roles — coordinator, manager, volunteer |
| `colleges` | Each college's workspace |
| `ngos` | NGO details + manager assignment |
| `events` | Events created by coordinator + attendees |
| `weeklyprogress` | Volunteer weekly tasks and hours |
| `invitetokens` | Secure invite links with 24hr expiry |

---



## 💡 Why This Project

This project was born from a real problem experienced during an NGO internship — volunteers had no proper system to update their managers. Everything happened over WhatsApp, which was scattered and hard to track. VolunteerBridge was built to solve exactly that problem, with the goal of being actually used by the NGO after deployment.

---

## 👩‍💻 Team


## 📄 License

This project is open source and available under the MIT License.
