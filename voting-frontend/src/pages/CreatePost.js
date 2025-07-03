// import React, { useState } from 'react';
// import './CreatePost.css';
// import api from '../api'; 

// const CreatePost = () => {
//   const [postContent, setPostContent] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedFile, setSelectedFile] = useState(null);

//    const handleSubmit = async (e) => {
//   e.preventDefault();
//   const formData = new FormData();
//   formData.append('content', postContent);
//   formData.append('category', selectedCategory);
//   if (selectedFile) {
//     formData.append('image', selectedFile);
//   }

//   try {
//     const res = await api.post('/api/post', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     alert(res.data.message);
//     setPostContent('');
//     setSelectedCategory('');
//     setSelectedFile(null);
//   } catch (error) {
//     console.error('Error submitting post:', error);
//   }
// };

    
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

//         {/* Main Form */}
//         <div className="form-container">
//           <div className="form-header">
//             <span className="edit-icon">✏️</span>
//             <h2>Create Election Post</h2>
//           </div>

//           <div className="election-form" onSubmit={handleSubmit}>
//             <div className="form-group">
//               <div className="form-label">Post Content</div>
//               <textarea
//                 value={postContent}
//                 onChange={(e) => setPostContent(e.target.value)}
//                 placeholder="Share your campaign ideas, election updates, or candidate information..."
//                 rows={6}
//                 required
//               />
//             </div>

//             <div className="form-group">
//               <div className="form-label">Category</div>
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//               >
//                 <option value="">Select a category</option>
//                 <option value="campaign">Campaign Updates</option>
//                 <option value="candidate">Candidate Information</option>
//                 <option value="debate">Debate Topics</option>
//                 <option value="announcement">Announcements</option>
//                 <option value="voting">Voting Information</option>
//               </select>
//             </div>

//             <div className="form-group">
//               <div className="form-label">Attach Files</div>
//               <div className="file-upload-area">
//                 <input
//                   type="file"
//                   onChange={(e) => setSelectedFile(e.target.files[0])}
//                   accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
//                 />
//                 <div className="file-upload-text">
//                   <span className="attachment-icon">📎</span>
//                   Choose images, PDFs, or documents
//                 </div>
//               </div>
//             </div>

//             <button type="submit" className="submit-button">
//               Post to Election Hub
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CreatePost;

import React, { useState } from 'react';
import './CreatePost.css';
import api from '../api'; 

const CreatePost = () => {
  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    
    const formData = new FormData();
    formData.append('content', postContent);
    formData.append('category', selectedCategory);
    if (selectedFile) {
      formData.append('image', selectedFile); // Must match backend's `upload.single('image')`
    }

    try {
      const res = await api.post('/api/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMessage(res.data.message || 'Post submitted!');
      setPostContent('');
      setSelectedCategory('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to submit post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              Share your ideas and <span className="highlight-green">campaign updates</span> with the <span className="highlight-purple">college community</span>
            </p>
          </div>
        </div>

        {/* ✅ ✅ Use actual <form> element here */}
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
            <div className="form-label">Attach Files</div>
            <div className="file-upload-area">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <div className="file-upload-text">
                <span className="attachment-icon">📎</span>
                Choose images, PDFs, or documents
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
