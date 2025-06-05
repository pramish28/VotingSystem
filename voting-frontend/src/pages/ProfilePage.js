// import React, { useState, useEffect, useContext } from 'react';
// import { AuthContext } from '../AuthContext';
// import api from '../api';
// import { Link } from 'react-router-dom';
// import './ProfilePage.css';

// function ProfilePage() {
//   const { user } = useContext(AuthContext);
//   const [userProfile, setUserProfile] = useState(null);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const res = await api.get('/api/auth/me'); // Changed to /me
//         setUserProfile(res.data);
//       } catch (err) {
//         setError('Failed to fetch user profile');
//         console.error('Failed to fetch user profile:', err);
//       }
//     };
//     if (user) {
//       fetchUserProfile();
//     }
//   }, [user]);

//   if (!user) {
//     return <div>Please log in</div>;
//   }

//   return (
//     <div className="profile-container">
//       <h2>User Profile</h2>
//       {error && <p className="error">{error}</p>}
//       {userProfile ? (
//         <div className="profile-details">
//           <img src={userProfile.photo} alt="Profile" className="profile-pic" />
//           <p><strong>Name:</strong> {userProfile.name}</p>
//           <p><strong>Email:</strong> {userProfile.email}</p>
//           <p><strong>Address:</strong> {userProfile.address}</p>
//           <p><strong>Degree:</strong> {userProfile.degree}</p>
//           <p><strong>Faculty:</strong> {userProfile.faculty}</p>
//           <p><strong>Program:</strong> {userProfile.program}</p>
//           <p><strong>Major:</strong> {userProfile.major || 'N/A'}</p>
//           <p><strong>Year/Semester:</strong> {userProfile.yearOrSemester}</p>
//           <p><strong>Symbol Number:</strong> {userProfile.symbolNumber}</p>
//           <p><strong>Phone Number:</strong> {userProfile.phoneNumber}</p>
//           <p><strong>Voter ID:</strong> {userProfile.voterId}</p>
//           <p><strong>Verification Status:</strong> {userProfile.isVerified ? 'Verified' : 'Not Verified'}</p>
//           <Link to="/student-dashboard" className="back-link">Back to Dashboard</Link>
//         </div>
//       ) : (
//         <p>Loading profile...</p>
//       )}
//     </div>
//   );
// }

// export default ProfilePage;

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/api/auth/me');
        setUserProfile(res.data);
      } catch (err) {
        setError('Failed to fetch user profile');
        console.error('Failed to fetch user profile:', err);
      }
    };
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {error && <p className="error">{error}</p>}

      {!userProfile ? (
        // Skeleton Loader Section
        <div className="profile-details">
          <div className="skeleton skeleton-pic"></div>
          {Array.from({ length: 11 }).map((_, index) => (
            <div key={index} className="skeleton skeleton-text"></div>
          ))}
        </div>
      ) : (
        // Actual Profile Data
        <div className="profile-details">
          <img src={userProfile.photo} alt="Profile" className="profile-pic" />
          <p><strong>Name:</strong> {userProfile.name}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Address:</strong> {userProfile.address}</p>
          <p><strong>Degree:</strong> {userProfile.degree}</p>
          <p><strong>Faculty:</strong> {userProfile.faculty}</p>
          <p><strong>Program:</strong> {userProfile.program}</p>
          <p><strong>Major:</strong> {userProfile.major || 'N/A'}</p>
          <p><strong>Year/Semester:</strong> {userProfile.yearOrSemester}</p>
          <p><strong>Symbol Number:</strong> {userProfile.symbolNumber}</p>
          <p><strong>Phone Number:</strong> {userProfile.phoneNumber}</p>
          <p><strong>Voter ID:</strong> {userProfile.voterId}</p>
          <p><strong>Verification Status:</strong> {userProfile.isVerified ? 'Verified' : 'Not Verified'}</p>
          <Link to="/student-dashboard" className="back-link">Back to Dashboard</Link>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
