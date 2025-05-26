import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import './CreatePost.css';

function CreatePost() {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);
    try {
      await api.post('/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(user.role === 'admin' ? 'Post created' : 'Post submitted for approval');
      setContent('');
      setImage(null);
    } catch (err) {
      setMessage('Failed to create post');
    }
  };

  return (
    <div className="create-post-container">
      <h3>Create Post</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          required
        />
        <input
          type="file"
          accept=".jpg,.png"
          onChange={(e) => setImage(e.target.files[0])}
        />
        <button type="submit">Post</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CreatePost;