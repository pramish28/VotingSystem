import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";

import Settings from "./pages/Settings";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VotingPage from "./pages/VotingPage";
import ResultPage from "./pages/ResultPage";
import ElectionNews from "./pages/ElectionNews";
import ProfilePage from "./pages/ProfilePage";
import DeleteCandidate from "./components/DeleteCandidate";
import "./App.css";
import DeleteElection from "./pages/DeleteElection";
import DeleteApprovedPosts from "./pages/DeleteApprovedPosts";


import VerifiedUsers from "./components/VerifiedUsers";
import ApproveStudents from "./components/ApproveStudents";
import CreatePost from "./pages/CreatePost";
import ApprovePosts from "./pages/ApprovePosts";
import AllPostsPage from "./pages/AllPostsPage";
import PendingPostsPage from "./pages/PendingPostsPage";
import ApprovedPostsPage from "./pages/ApprovedPostsPage";
import ElectionForm from "./components/ElectionForm";
import ProbabilityPage from "./pages/ProbabilityPage";
import CandidatesList from "./components/Candidates";
import UpdateCandidate from "./pages/UpdateCandidate";
import DeleteStudent from "./components/DeleteStudent";
import UpdateStudent from "./components/UpdateStudent";
import ResetUserPassword from "./pages/ResetUserPassword"; 


// Progressive guard: if user exists, don't block on loading.
const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  console.log("ProtectedRoute render:", { user, loading, allowedRole });

  // If still hydrating and we don't have a user yet, show a spinner
  if (loading && !user) return <div>Loading...</div>;

  // If we have a user, allow right away (or redirect on role mismatch)
  if (user) {
    if (allowedRole && user.role !== allowedRole) {
      const home = user.role === "admin" ? "/admin-dashboard" : "/student-dashboard";
      return <Navigate to={home} replace />;
    }
    return children;
  }

  // No user at all -> to login
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/delete-candidate" element={<DeleteCandidate />} />
          <Route path="/delete-student" element={<DeleteStudent />} />
          <Route path="/update-student" element={<UpdateStudent />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/view-posts"element={<AllPostsPage />} />

          {/* Results are public and on /result */}
          <Route path="/result" element={<ResultPage />} />
          {/* Optional redirect for old path */}
          <Route path="/results" element={<Navigate to="/result" replace />} />

          <Route path="/news" element={<ElectionNews />} />
          <Route path="/create-post" element={<CreatePost />} />

          <Route path="/candidates" element={<CandidatesList />} />

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
           path="/update-candidate" 
           element={
            <ProtectedRoute allowedRole="admin">
           <UpdateCandidate />
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
          path="/delete-election"
          element={
            <ProtectedRoute allowedRole="admin">
              <DeleteElection />
            </ProtectedRoute>
          }
        />
        
         <Route
         path="/reset-user-password"
         element={
           <ProtectedRoute allowedRole="admin">
              <ResetUserPassword />
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
           <Route
             path="/delete-approved-posts"
             element={
             <ProtectedRoute allowedRole="admin">
             <DeleteApprovedPosts />
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

          {/* Public probability page */}
          <Route path="/probability" element={<ProbabilityPage />} />

          {/* Defaults */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404 — Not found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
