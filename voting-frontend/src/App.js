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

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user,loading } = useAuth();
  console.log("ProtectedRoute render:",{user, loading,allowedRole});
  if(loading){
    return <div>Loading...</div>; // Show a loading state while checking auth
  }
  if (!user) {
    return <Navigate to="/login" replace/>;
  }
  if (allowedRole && user.role !== allowedRole) {
    console.log("Role mismatch, redirecting to login");
    return <Navigate to="/login" replace/>;
  }
  console.log("ProtectedRoute access granted:", { user, allowedRole });
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route path="/register" element={<Register />} />
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute allowedRole="student">
                <StudentDashboard />
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
            path="/vote"
            element={
              <ProtectedRoute allowedRole="student">
                <VotingPage />
              </ProtectedRoute>
            }
          />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/news" element={<ElectionNews />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
