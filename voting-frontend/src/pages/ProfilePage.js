// import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../AuthContext";
// import api from "../api";
// import { Link } from "react-router-dom";
// import "./ProfilePage.css";

// function ProfilePage() {
//   const { user } = useContext(AuthContext);
//   const [userProfile, setUserProfile] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const res = await api.get("/api/auth/me");
//         console.log(res.data);
//         setUserProfile(res.data);
//       } catch (err) {
//         setError("Failed to fetch user profile");
//         console.error("Failed to fetch user profile:", err);
//       }
//     };
//     if (user) {
//       fetchUserProfile();
//     }
//   }, [user]);

//   if (!user) {
//     return <div className="profile-page">Please log in</div>;
//   }

//   return (
//     <div className="profile-page">
//       <div className="header">
//         <div className="header-left">
//           <h1>User Profile</h1>
//         </div>
//       </div>

//       {error && <p className="error-message">{error}</p>}

//       <div className="main-content">
//         <div className="profile-card">
//           {!userProfile ? (
//             // Skeleton Loader Section
//             <div className="profile-details">
//               <div className="skeleton skeleton-pic"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//               <div className="skeleton skeleton-text"></div>
//             </div>
//           ) : (
//             // Actual Profile Data
//             <div className="profile-details">
//               <div className="profile-header">
//                 <img
//                   src={`http://localhost:5000/${userProfile.photo}`}
//                   alt="Profile"
//                   className="profile-pic"
//                   id="profile-pic"
//                 />
//                 <div className="profile-info">
//                   <h2 className="profile-name">{userProfile.name}</h2>
//                   <p className="profile-status">
//                     {userProfile.isVerified ? "Verified" : "Not Verified"}
//                   </p>
//                 </div>
//               </div>
//               <div className="profile-body">
//                 <div className="detail-row">
//                   <span className="detail-label">Email:</span>
//                   <span className="detail-value">{userProfile.email}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Address:</span>
//                   <span className="detail-value">{userProfile.address}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Degree:</span>
//                   <span className="detail-value">{userProfile.degree}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Faculty:</span>
//                   <span className="detail-value">{userProfile.faculty}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Program:</span>
//                   <span className="detail-value">{userProfile.program}</span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Major:</span>
//                   <span className="detail-value">
//                     {userProfile.major || "N/A"}
//                   </span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Year/Semester:</span>
//                   <span className="detail-value">
//                     {userProfile.yearOrSemester}
//                   </span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Symbol Number:</span>
//                   <span className="detail-value">
//                     {userProfile.symbolNumber}
//                   </span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Phone Number:</span>
//                   <span className="detail-value">
//                     {userProfile.phoneNumber}
//                   </span>
//                 </div>
//                 <div className="detail-row">
//                   <span className="detail-label">Voter ID:</span>
//                   <span className="detail-value">{userProfile.voterId}</span>
//                 </div>
//               </div>
//               <div className="profile-footer">
//                 <Link to="/student-dashboard" className="action-btn back-btn">
//                   <span className="btn-content">
//                     <span className="btn-icon">←</span>
//                     <span className="btn-text">Back to Dashboard</span>
//                   </span>
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProfilePage;
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import api from "../api";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get("/api/auth/me");
        console.log(res.data);
        setUserProfile(res.data);
      } catch (err) {
        setError("Failed to fetch user profile");
        console.error("Failed to fetch user profile:", err);
      }
    };
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  if (!user) {
    return <div className="profile-page">Please log in</div>;
  }

  return (
    <div className="profile-page">
      <div className="header">
        <div className="header-left">
          <Link to="/student-dashboard" className="back-btn-header">
            <span className="btn-content">
              <span className="btn-icon">←</span>
              <span className="btn-text">Back to Dashboard</span>
            </span>
          </Link>
          <h1>User Profile</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="main-content">
        <div className="profile-card">
          {!userProfile ? (
            // Skeleton Loader Section
            <div className="profile-details">
              <div className="skeleton skeleton-pic"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          ) : (
            // Actual Profile Data
            <div className="profile-details">
              <div className="profile-header">
                <img
                  src={`http://localhost:5000/${userProfile.photo}`}
                  alt="Profile"
                  className="profile-pic"
                  id="profile-pic"
                />
                <div className="profile-info">
                  <h2 className="profile-name">{userProfile.name}</h2>
                  <p className="profile-status">
                    <span className={`status-indicator ${userProfile.isVerified ? 'verified' : 'not-verified'}`}></span>
                    {userProfile.isVerified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
              <div className="profile-body">
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{userProfile.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Address:</span>
                  <span className="detail-value">{userProfile.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Degree:</span>
                  <span className="detail-value">{userProfile.degree}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Faculty:</span>
                  <span className="detail-value">{userProfile.faculty}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Program:</span>
                  <span className="detail-value">{userProfile.program}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Major:</span>
                  <span className="detail-value">
                    {userProfile.major || "N/A"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Year/Semester:</span>
                  <span className="detail-value">
                    {userProfile.yearOrSemester}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Symbol Number:</span>
                  <span className="detail-value">
                    {userProfile.symbolNumber}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone Number:</span>
                  <span className="detail-value">
                    {userProfile.phoneNumber}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Voter ID:</span>
                  <span className="detail-value">{userProfile.voterId}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;