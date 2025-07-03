// import React, { useState } from 'react';
// import api from '../api';
// import './Post.css';

// function Post({ post }) {
//   const [likes, setLikes] = useState(post.likes.length);
//   const [comments, setComments] = useState(post.comments);
//   const [commentText, setCommentText] = useState('');

//   const handleLike = async () => {
//     try {
//       const res = await api.post(`/post/${post._id}/like`);
//       setLikes(res.data.likes.length);
//     } catch (err) {
//       console.error('Failed to like post:', err);
//     }
//   };

//   const handleComment = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await api.post(`/post/${post._id}/comment`, { content: commentText });
//       setComments(res.data.comments);
//       setCommentText('');
//     } catch (err) {
//       console.error('Failed to comment:', err);
//     }
//   };

//   return (
//     <div className="post-container">
//       <div className="post-header">
//         <img src={post.userId.photo} alt="User" className="post-profile-pic" />
//         <h4>{post.userId.name}</h4>
//       </div>
//       <p>{post.content}</p>
//       {post.image && <img src={post.image} alt="Post" className="post-image" />}
//       <div className="post-actions">
//         <button onClick={handleLike}>👍 Like ({likes})</button>
//         <span> 💬 Comments ({comments.length})</span>
//       </div>
//       <div className="comments">
//         {comments.map((comment) => (
//           <div key={comment._id}>
//             <strong>{comment.userId.name}:</strong> {comment.content}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleComment}>
//         <input
//           type="text"
//           value={commentText}
//           onChange={(e) => setCommentText(e.target.value)}
//           placeholder="Add a comment"
//         />
//         <button type="submit">Comment</button>
//       </form>
//     </div>
//   );
// }

// export default Post;

// import React, { useState } from 'react';
// import api from '../api';
// import './Post.css';

// function Post({ post }) {
//   const [likes, setLikes] = useState(post.likes.length || 0);
//   const [dislikes, setDislikes] = useState(post.dislikes?.length || 0);
//   const [comments, setComments] = useState(post.comments || []);
//   const [commentText, setCommentText] = useState('');

//   const handleLike = async () => {
//     try {
//       const res = await api.post(`/post/${post._id}/like`);
//       setLikes(res.data.likes.length);
//     } catch (err) {
//       console.error('Failed to like post:', err);
//     }
//   };

//   const handleDislike = async () => {
//     try {
//       const res = await api.post(`/post/${post._id}/dislike`);
//       setDislikes(res.data.dislikes.length);
//     } catch (err) {
//       console.error('Failed to dislike post:', err);
//     }
//   };

//   const handleComment = async (e) => {
//     e.preventDefault();
//     if (!commentText.trim()) return;

//     try {
//       const res = await api.post(`/post/${post._id}/comment`, { content: commentText });
//       setComments(res.data.comments);
//       setCommentText('');
//     } catch (err) {
//       console.error('Failed to comment:', err);
//     }
//   };

//   return (
//     <div className="post-container">
//       <div className="post-header">
//         <img
//           src={post.userId.photo || '/default-profile.png'}
//           alt="User"
//           className="post-profile-pic"
//         />
//         <h4>{post.userId.name}</h4>
//       </div>

//       <p>{post.content}</p>

//       {post.image && (
//         <img
//           src={`/uploads/${post.image}`}
//           alt="Post"
//           className="post-image"
//         />
//       )}

//       <div className="post-actions">
//         <button onClick={handleLike}>👍 Like ({likes})</button>
//         <button onClick={handleDislike}>👎 Dislike ({dislikes})</button>
//         <span>💬 Comments ({comments.length})</span>
//       </div>

//       <div className="comments">
//         {comments.map((comment) => (
//           <div key={comment._id} className="comment">
//             <strong>{comment.userId?.name || 'User'}:</strong> {comment.content}
//           </div>
//         ))}
//       </div>

//       <form onSubmit={handleComment} className="comment-form">
//         <input
//           type="text"
//           value={commentText}
//           onChange={(e) => setCommentText(e.target.value)}
//           placeholder="Add a comment..."
//           required
//         />
//         <button type="submit">Comment</button>
//       </form>
//     </div>
//   );
// }

// export default Post;

import React, { useState } from 'react';
import './Post.css';
import api from '../api';
import AuthContext from '../AuthContext';


function Post({ post }) {
  const [likes, setLikes] = useState(post.likes.length || 0);
  const [dislikes, setDislikes] = useState(post.dislikes?.length || 0);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');

  const handleLike = async () => {
    try {
      const res = await api.post(`/post/${post._id}/like`);
      setLikes(res.data.likes.length);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleDislike = async () => {
    try {
      const res = await api.post(`/post/${post._id}/dislike`);
      setDislikes(res.data.dislikes.length);
    } catch (err) {
      console.error('Failed to dislike post:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/post/${post._id}/comment`, { content: commentText });
      setComments(res.data.comments);
      setCommentText('');
    } catch (err) {
      console.error('Failed to comment:', err);
    }
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img
          src={post.userId.photo || '/default-profile.png'}
          alt="User"
          className="post-profile-pic"
        />
        <h4>{post.userId.name}</h4>
      </div>

      <p>{post.content}</p>

      {post.image && (
        <img
          src={`/uploads/${post.image}`}
          alt="Post"
          className="post-image"
        />
      )}

      <div className="post-actions">
        <button onClick={handleLike}>👍 Like ({likes})</button>
        <button onClick={handleDislike}>👎 Dislike ({dislikes})</button>
        <span>💬 Comments ({comments.length})</span>
      </div>

      <div className="comments">
        {comments.map((comment) => (
          <div key={comment._id} className="comment">
            <strong>{comment.userId?.name || 'User'}:</strong> {comment.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleComment} className="comment-form">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          required
        />
        <button type="submit">Comment</button>
      </form>
    </div>
  );
}

export default Post;