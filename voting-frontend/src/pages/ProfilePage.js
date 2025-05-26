import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import Post from '../components/Post';
import './ProfilePage.css';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/post/my-posts');
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="profile-container">
      <h2>{user.name}'s Profile</h2>
      <img src={user.photo} alt="Profile" className="profile-pic" />
      <p>{user.email}</p>
      <h3>My Posts</h3>
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
}

export default ProfilePage;