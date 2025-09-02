import React from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();

  return (
    <div className="settings-container">
      <div className="header-section">
        <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
        <p className="settings-description">Manage candidates, elections, and verified students.</p>
      </div>

      <div className="settings-grid">
        <div className="setting-card delete-candidate" onClick={() => navigate("/delete-candidate")}>
          <h3>Delete Candidate</h3>
          <p>Remove a candidate from the election.</p>
        </div>

        <div className="setting-card update-candidate" onClick={() => navigate("/update-candidate")}>
          <h3>Update Candidate</h3>
          <p>Edit candidate details or position.</p>
        </div>

        <div className="setting-card delete-election" onClick={() => navigate("/delete-election")}>
          <h3>Delete Election</h3>
          <p>Remove an entire election.</p>
        </div>

        <div className="setting-card delete-verified-student" onClick={() => navigate("/delete-student")}>
          <h3>Delete Verified Student</h3>
          <p>Remove a verified student from the database.</p>
        </div>

        <div className="setting-card update-verified-student" onClick={() => navigate("/update-student")}>
          <h3>Update Verified Student</h3>
          <p>Edit details of verified students.</p>
        </div>

        <div className="setting-card delete-approved-posts" onClick={() => navigate("/delete-approved-posts")}>
          <h3>Delete Approved Posts</h3>
          <p>Remove approved posts from the feed.</p>
         </div>

         <div className="setting-card reset-user-password" onClick={() => navigate("/reset-user-password")}>
           <h3>Reset User Password</h3>
           <p>Send a new password to the user by email.</p>
          </div>


      </div>
    </div>
  );
};

export default Settings;