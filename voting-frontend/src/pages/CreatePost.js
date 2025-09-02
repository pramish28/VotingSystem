// // voting-frontend/src/pages/CreatePost.js
// import React, { useState } from 'react';
// import './CreatePost.css';
// import api from '../api';

// const CreatePost = () => {
//   const [postContent, setPostContent] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [successMessage, setSuccessMessage] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     setLoading(true);
//     setSuccessMessage('');

//     const formData = new FormData();
//     formData.append('content', postContent);
//     formData.append('category', selectedCategory);
//     if (selectedFile) formData.append('image', selectedFile); // must match upload.single('image')

//     try {
//       const res = await api.post('/api/post', formData, {
//         // DO NOT set Content-Type; browser will add the proper multipart boundary
//         timeout: 30000, // safety timeout so UI always recovers
//       });

//       setSuccessMessage(res.data.message || 'Post submitted!');
//       setPostContent('');
//       setSelectedCategory('');
//       setSelectedFile(null);
//     } catch (error) {
//       const msg = error?.response?.data?.error || error.message || 'Failed to submit post.';
//       console.error('Error submitting post:', error);
//       alert(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="background"></div>

//       <div className="election-hub-container">
//         <div className="header">
//           <div className="header-content">
//             <div className="logo-section">
//               <div className="megaphone-icon">📢</div>
//               <h1>College Election Hub</h1>
//               <div className="verified-badge">✓</div>
//             </div>
//             <p className="tagline">
//               Share your ideas and <span className="highlight-green">campaign updates</span> with the <span className="highlight-purple">college community</span>
//             </p>
//           </div>
//         </div>

//         <form className="form-container" onSubmit={handleSubmit}>
//           <div className="form-header">
//             <span className="edit-icon">✏️</span>
//             <h2>Create Election Post</h2>
//           </div>

//           <div className="form-group">
//             <div className="form-label">Post Content</div>
//             <textarea
//               value={postContent}
//               onChange={(e) => setPostContent(e.target.value)}
//               placeholder="Share your campaign ideas, election updates, or candidate information..."
//               rows={6}
//               required
//             />
//           </div>

//           <div className="form-group">
//             <div className="form-label">Category</div>
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               required
//             >
//               <option value="">Select a category</option>
//               <option value="campaign">Campaign Updates</option>
//               <option value="candidate">Candidate Information</option>
//               <option value="debate">Debate Topics</option>
//               <option value="announcement">Announcements</option>
//               <option value="voting">Voting Information</option>
//             </select>
//           </div>

//           <div className="form-group">
//             <div className="form-label">Attach Image</div>
//             <div className="file-upload-area">
//               <input
//                 type="file"
//                 onChange={(e) => setSelectedFile(e.target.files[0] || null)}
//                 accept=".jpg,.jpeg,.png"  // backend only allows images; remove .pdf/.doc to avoid server error
//               />
//               <div className="file-upload-text">
//                 <span className="attachment-icon">📎</span>
//                 Choose JPG or PNG (max 5MB)
//               </div>
//             </div>
//           </div>

//           <button type="submit" className="submit-button" disabled={loading}>
//             {loading ? 'Submitting...' : 'Post to Election Hub'}
//           </button>

//           {successMessage && (
//             <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>
//           )}
//         </form>
//       </div>
//     </>
//   );
// };

// export default CreatePost;

// voting-frontend/src/pages/CreatePost.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreatePost.css';
import api from '../api';
import { useAuth } from '../AuthContext';

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const backPath = user?.role === 'admin'
    ? '/admin-dashboard'
    : user
    ? '/student-dashboard'
    : '/login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('category', selectedCategory);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      const res = await api.post('/api/post', formData, { timeout: 30000 });
      setSuccessMessage(res.data.message || 'Post submitted!');
      setPostContent('');
      setSelectedCategory('');
      setSelectedFile(null);

      // Redirect to AllPostsPage
      navigate('/view-posts', { replace: true });
    } catch (error) {
      const msg = error?.response?.data?.error || error.message || 'Failed to submit post.';
      console.error('Error submitting post:', error);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Back button fixed at top-left */}
      <button
        type="button"
        className="back-floating-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="background"></div>

      <div className="election-hub-container">
        <div className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="megaphone-icon">📢</div>
              <h1>College Election Hub</h1>
              <div className="verified-badge">✓</div>
            </div>
            <p className="tagline">
              Share your ideas and <span className="highlight-green">campaign updates</span> with the{' '}
              <span className="highlight-purple">college community</span>
            </p>
          </div>
        </div>

        <form className="form-container" onSubmit={handleSubmit}>
          <div className="form-header">
            <span className="edit-icon">✏️</span>
            <h2>Create Election Post</h2>
          </div>

          <div className="form-group">
            <div className="form-label">Post Content</div>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share your campaign ideas, election updates, or candidate information..."
              rows={6}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-label">Category</div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              <option value="campaign">Campaign Updates</option>
              <option value="candidate">Candidate Information</option>
              <option value="debate">Debate Topics</option>
              <option value="announcement">Announcements</option>
              <option value="voting">Voting Information</option>
            </select>
          </div>

          <div className="form-group">
            <div className="form-label">Attach Image</div>
            <div className="file-upload-area">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                accept=".jpg,.jpeg,.png"
              />
              <div className="file-upload-text">
                <span className="attachment-icon">📎</span>
                Choose JPG or PNG (max 5MB)
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Submitting...' : 'Post to Election Hub'}
          </button>

          {successMessage && (
            <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>
          )}
        </form>
      </div>
    </>
  );
};

export default CreatePost;
