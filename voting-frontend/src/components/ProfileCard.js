import React from 'react';
import './ProfileCard.css';

function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <img src={user.photo} alt="Profile" className="profile-pic" />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  );
}

export default ProfileCard;