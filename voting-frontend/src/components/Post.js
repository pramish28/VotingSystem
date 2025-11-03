import React, { useCallback, useMemo, useState } from 'react';
import './Post.css';
import api from '../api';

/* --- helpers to build stable image URLs --- */
function normalizeServerPath(p) {
  if (!p) return '';
  let path = String(p).replace(/\\/g, '/');
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  if (!path.startsWith('/')) path = '/' + path;
  if (path.toLowerCase().includes('/uploads/')) return path;
  path = path.replace(/^\/+/, '');
  return '/uploads/' + path;
}
function absoluteUrl(p) {
  if (!p) return '';
  const norm = normalizeServerPath(p);
  if (/^https?:\/\//i.test(norm)) return norm;
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  return base + norm;
}

/* ---- content helpers (smart link rendering) ---- */
function isPdfUrl(url) {
  // ends with .pdf, ignoring query/hash
  return /\.pdf(?:$|[?#])/i.test(url || '');
}
function isAbsolute(url) {
  return /^https?:\/\//i.test(url || '');
}
function toAbsoluteUploadsUrl(url) {
  if (!url) return '';
  if (isAbsolute(url)) return url;
  // ensure leading slash
  const rel = url.replace(/^\/?/, '/');
  const base = (api.defaults.baseURL || '').replace(/\/$/, '');
  return base + rel;
}
function fileNameFromUrl(url) {
  try {
    const u = new URL(url, window.location.origin);
    const p = u.pathname.split('/').filter(Boolean);
    return decodeURIComponent(p[p.length - 1] || 'results.pdf');
  } catch {
    const clean = (url || '').split('?')[0].split('#')[0];
    const parts = clean.split('/').filter(Boolean);
    return decodeURIComponent(parts[parts.length - 1] || 'results.pdf');
  }
}

/* --- render post content:
      - plain text stays as text
      - any URL becomes an <a>
      - any PDF URL becomes a Download button (and hides the raw URL)
--- */
function renderContentSmart(text, onDownloadPdf) {
  const urlRx = /(https?:\/\/[^\s)]+)|((?:\/)?Uploads\/[^\s)]+)/gi;
  const parts = String(text || '').split(urlRx);
  const nodes = [];

  for (let i = 0; i < parts.length; i++) {
    const chunk = parts[i];
    if (!chunk) continue;

    const isAbs = /^https?:\/\//i.test(chunk);
    const isRel = /^\/?Uploads\//i.test(chunk);

    if (isAbs || isRel) {
      const href = isAbs ? chunk : toAbsoluteUploadsUrl('/' + chunk.replace(/^\/?/, ''));
      if (isPdfUrl(href)) {
        const fname = fileNameFromUrl(href);
        nodes.push(
          <span key={'pdf-' + i} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginRight: 8 }}>
            <button
              type="button"
              onClick={() => onDownloadPdf(href, fname)}
              className="post-download-btn"
              aria-label={'Download ' + fname}
              title={'Download ' + fname}
            >
              ⬇️ Download PDF
            </button>
            <small style={{ color: '#6b7280' }}>{fname}</small>
          </span>
        );
      } else {
        nodes.push(
          <a key={'lnk-' + i} href={href} target="_blank" rel="noopener noreferrer">
            {chunk}
          </a>
        );
      }
    } else {
      nodes.push(<span key={'txt-' + i}>{chunk}</span>);
    }
  }
  return nodes;
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

  // Robust PDF downloader (works even cross-origin by using axios + blob)
  const downloadPdf = useCallback(async (href, filename) => {
    try {
      setBusy(true);
      const url = href || '';
      // axios will keep absolute URLs as-is; relative will resolve against baseURL
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename || fileNameFromUrl(url) || 'results.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch (err) {
      console.error('PDF download failed:', err);
      // Fallback: open in new tab
      try { window.open(href, '_blank', 'noopener'); } catch (_) {}
    } finally {
      setBusy(false);
    }
  }, []);

  const like = useCallback(async () => {
    if (!canInteract) return;
    try {
      setBusy(true);
      const res = await api.post('/api/post/' + postData._id + '/like');
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
      const res = await api.post('/api/post/' + postData._id + '/dislike');
      setPostData(res.data);
    } catch (e) {
      console.error('Failed to dislike post:', e);
    } finally {
      setBusy(false);
    }
  }, [canInteract, postData._id]);

  const submitComment = useCallback(async (e) => {
    e.preventDefault();
    const text = (commentText || '').trim();
    if (!isApproved || !text || busy) return;
    try {
      setBusy(true);
      const res = await api.post('/api/post/' + postData._id + '/comment', { content: text });
      setPostData(res.data);
      setCommentText('');
    } catch (e) {
      console.error('Failed to comment:', e);
    } finally {
      setBusy(false);
    }
  }, [isApproved, commentText, busy, postData._id]);

  return (
    <div className="post-card">
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

      {/* Content with smart link/pdf handling */}
      <div className="post-body">
        {renderContentSmart(postData.content, downloadPdf)}
      </div>

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
          placeholder={isApproved ? 'Add a comment...' : 'Comments disabled for pending posts'}
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
