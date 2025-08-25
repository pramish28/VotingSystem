import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VotingPage from "./pages/VotingPage";
import ResultPage from "./pages/ResultPage";
import ElectionNews from "./pages/ElectionNews";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";
import VerifiedUsers from "./components/VerifiedUsers";
import ApproveStudents from "./components/ApproveStudents";
import CreatePost from "./pages/CreatePost";
import ApprovePosts from './pages/ApprovePosts';
import AllPostsPage from './pages/AllPostsPage';
import PendingPostsPage from './pages/PendingPostsPage';
import ApprovedPostsPage from './pages/ApprovedPostsPage';
import ElectionForm from './components/ElectionForm';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute render:", { user, loading, allowedRole });
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) {
    console.log("Role mismatch, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  console.log("ProtectedRoute access granted:", { user, allowedRole });
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Results are public and on /result (not /results) */}
          <Route path="/result" element={<ResultPage />} />
          {/* Optional: keep old path working by redirecting */}
          <Route path="/results" element={<Navigate to="/result" replace />} />

          <Route path="/news" element={<ElectionNews />} />
          <Route path="/create-post" element={<CreatePost />} />

          {/* Admin-only */}
          <Route
            path="/verified-users"
            element={
              <ProtectedRoute allowedRole="admin">
                <VerifiedUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approve-students"
            element={
              <ProtectedRoute allowedRole="admin">
                <ApproveStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approve-posts"
            element={
              <ProtectedRoute allowedRole="admin">
                <ApprovePosts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-election"
            element={
              <ProtectedRoute allowedRole="admin">
                <ElectionForm />
              </ProtectedRoute>
            }
          />

          {/* Auth-required (any role) */}
          <Route
            path="/posts"
            element={
              <ProtectedRoute>
                <AllPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pending-posts"
            element={
              <ProtectedRoute>
                <PendingPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approved-posts"
            element={
              <ProtectedRoute>
                <ApprovedPostsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vote"
            element={
              <ProtectedRoute allowedRole="student">
                <VotingPage />
              </ProtectedRoute>
            }
          />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404 — Not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
