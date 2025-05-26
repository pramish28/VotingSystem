import React, { useState } from 'react';
import api from '../api';
import './Post.css';

function Post({ post }) {
  const [likes, setLikes] = useState(post.likes.length);
  const [comments, setComments] = useState(post.comments);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const res = await api.post(`/post/${post._id}/like`);
      setLikes(res.data.likes.length);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/post/${post._id}/comment`, { content: commentText });
      setComments(res.data.comments);
      setCommentText('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  return (
    <div className="post-container">
      <div className="post-header">
        <img src={post.userId.photo} alt="User" className="post-profile-pic" />
        <h4>{post.userId.name}</h4>
      </div>
      <p>{post.content}</p>
      {post.image && <img src={post.image} alt="Post" className="post-image" />}
      <div className="post-actions">
        <button onClick={handleLike}>Like ({likes})</button>
        <span>Comments ({comments.length})</span>
      </div>
      <div className="comments">
        {comments.map((comment) => (
          <div key={comment._id}>
            <strong>{comment.userId.name}:</strong> {comment.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleComment}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment"
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}

export default Post;