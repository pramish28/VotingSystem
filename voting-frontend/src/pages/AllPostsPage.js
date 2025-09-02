// import React, { useEffect, useState } from 'react';
// import api from '../api';
// import Post from '../components/Post';
// import './AllPostsPage.css';

// const AllPostsPage = () => {
//   const [allPosts, setAllPosts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         const res = await api.get('/api/post');
//         if (alive) setAllPosts(res.data || []);
//       } catch (err) {
//         console.error('Failed to load all posts:', err);
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);

//   if (loading) {
//     return (
//       <div className="posts-container">
//         <div className="loading-spinner">
//           <div className="spinner"></div>
//           <p>Loading amazing posts...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="posts-container">
//       <div className="hero-section">
//         <h1 className="main-title">
//           <span className="title-gradient">Your </span> Posts
//         </h1>
//         <p className="subtitle">Discover the latest approved content from our college election community.</p>
//       </div>

//       {allPosts.length === 0 ? (
//         <div className="empty-state">
//           <div className="empty-icon">📝</div>
//           <h3>No Posts Yet</h3>
//           <p>Be the first to share something amazing with the community!</p>
//         </div>
//       ) : (
//         <div className="posts-grid">
//           {allPosts.map((p) => (
//             <Post key={p._id} post={p} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AllPostsPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Post from '../components/Post';
import './AllPostsPage.css';

const AllPostsPage = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  const backPath = user?.role === 'admin'
    ? '/admin-dashboard'
    : user
    ? '/student-dashboard'
    : '/login';

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get('/api/post');
        if (alive) setAllPosts(res.data || []);
      } catch (err) {
        console.error('Failed to load all posts:', err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="posts-container">
        {/* Back button still visible while loading */}
        <button
          type="button"
          className="back-floating-btn"
          onClick={() => navigate(backPath)}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>

        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading amazing posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container">
      {/* Top-left back button */}
      <button
        type="button"
        className="back-floating-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="hero-section">
        <h1 className="main-title">
          <span className="title-gradient">Your </span> Posts
        </h1>
        <p className="subtitle">Discover the latest approved content from our college election community.</p>
      </div>

      {allPosts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No Posts Yet</h3>
          <p>Be the first to share something amazing with the community!</p>
        </div>
      ) : (
        <div className="posts-grid">
          {allPosts.map((p) => (
            <Post key={p._id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPostsPage;
