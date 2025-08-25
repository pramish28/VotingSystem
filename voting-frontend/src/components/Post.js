import React, { useCallback, useMemo, useState } from 'react';
import './Post.css';
import api from '../api';

/* --- helpers to build stable image URLs --- */
function normalizeServerPath(p) {
  if (!p) return '';
  let path = String(p).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (!path.startsWith('/')) path = `/${path}`;
  if (path.toLowerCase().includes('/uploads/')) return path;
  path = path.replace(/^\/+/, '');
  return `/uploads/${path}`;
}
function absoluteUrl(p) {
  if (!p) return '';
  const norm = normalizeServerPath(p);
  if (/^https?:\/\//i.test(norm)) return norm;
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  return `${base}${norm}`;
}

function Post({ post }) {
  // Localize all mutations so parent does not re-fetch → prevents remount flickers
  const [postData, setPostData] = useState(post);
  const [commentText, setCommentText] = useState('');
  const [busy, setBusy] = useState(false);

  const isApproved = !!postData.isApproved;

  const likeCount = postData.likes?.length ?? 0;
  const dislikeCount = postData.dislikes?.length ?? 0;
  const comments = postData.comments ?? [];

  const authorName = postData.userId?.name || 'User';

  const authorPhotoUrl = useMemo(() => {
    const raw = postData.userId?.photo || postData.userId?.profilePhoto || '';
    const url = absoluteUrl(raw);
    return url || '/default-profile.png';
  }, [postData.userId]);

  const postImageUrl = useMemo(() => {
    if (!postData.image) return '';
    return absoluteUrl(postData.image);
  }, [postData.image]);

  const canInteract = isApproved && !busy;

  const like = useCallback(async () => {
    if (!canInteract) return;
    try {
      setBusy(true);
      const res = await api.post(`/api/post/${postData._id}/like`);
      setPostData(res.data); // backend returns populated post (userId + comments.userId)
    } catch (e) {
      console.error('Failed to like post:', e);
    } finally {
      setBusy(false);
    }
  }, [canInteract, postData._id]);

  const dislike = useCallback(async () => {
    if (!canInteract) return;
    try {
      setBusy(true);
      const res = await api.post(`/api/post/${postData._id}/dislike`);
      setPostData(res.data);
    } catch (e) {
      console.error('Failed to dislike post:', e);
    } finally {
      setBusy(false);
    }
  }, [canInteract, postData._id]);

  const submitComment = useCallback(async (e) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!isApproved || !text || busy) return;
    try {
      setBusy(true);
      const res = await api.post(`/api/post/${postData._id}/comment`, { content: text });
      setPostData(res.data);
      setCommentText('');
    } catch (e) {
      console.error('Failed to comment:', e);
    } finally {
      setBusy(false);
    }
  }, [isApproved, commentText, busy, postData._id]);

  return (
    <div className="post-card">{/* no entrance animations */}
      <div className="post-header">
        <img
          src={authorPhotoUrl}
          alt={authorName}
          className="post-profile-pic"
          onError={(e) => { e.currentTarget.src = '/default-profile.png'; }}
        />
        <h4>{authorName}</h4>
        {!isApproved && <span className="post-badge pending">Pending…</span>}
      </div>

      <p>{postData.content}</p>

      {postImageUrl && (
        // Reserve space so loading doesn’t shift layout (no “blink”)
        <div className="post-image-wrap">
          <img
            src={postImageUrl}
            alt="Post"
            className="post-image"
            loading="lazy"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="post-actions">
        <button onClick={like} disabled={!canInteract}>👍 Like ({likeCount})</button>
        <button onClick={dislike} disabled={!canInteract}>👎 Dislike ({dislikeCount})</button>
        <span>💬 Comments ({comments.length})</span>
      </div>

      <div className="comments">
        {comments.map((c) => (
          <div key={c._id} className="comment">
            <strong>{c.userId?.name || 'User'}:</strong><span> {c.content}</span>
          </div>
        ))}
      </div>

      <form onSubmit={submitComment} className="comment-form">
        <input
          type="text"
          placeholder={isApproved ? "Add a comment..." : "Comments disabled for pending posts"}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!isApproved || busy}
          required
        />
        <button type="submit" disabled={!isApproved || busy}>Comment</button>
      </form>
    </div>
  );
}

export default React.memo(Post);
