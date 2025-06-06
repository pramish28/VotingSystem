import React, { useState } from 'react';
import './CreatePost.css';

const CreatePost = () => {
  const [postContent, setPostContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Post submitted:', { postContent, selectedCategory, selectedFile });
    // Handle form submission logic here
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  return (
    <>
      {/* ADD THIS DIV - This was missing! */}
      <div className="background"></div>
      
      <div className="election-hub-container">
        {/* Header */}
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

        {/* Main Form */}
        <div className="form-container">
          <div className="form-header">
            <span className="edit-icon">✏️</span>
            <h2>Create Election Post</h2>
          </div>

          <div className="election-form">
            <div className="form-group">
              <div className="form-label">Post Content</div>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your campaign ideas, election updates, or candidate information..."
                rows={6}
              />
            </div>

            <div className="form-group">
              <div className="form-label">Category</div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
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
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                />
                <div className="file-upload-text">
                  <span className="attachment-icon">📎</span>
                  Choose images, PDFs, or documents
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} className="submit-button">
              Post to Election Hub
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;