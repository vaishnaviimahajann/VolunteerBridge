import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InviteSignupPage from "./pages/InviteSignupPage";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";

// If there's no token in localStorage, bounce to /login.
// (Simple presence check here — role-based access can be layered
// on top of this later once dashboards are built out.)
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/invite-signup" element={<InviteSignupPage />} />

          <Route
            path="/coordinator/dashboard"
            element={
              <ProtectedRoute>
                <CoordinatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/volunteer/dashboard"
            element={
              <ProtectedRoute>
                <VolunteerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback: unknown routes go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
