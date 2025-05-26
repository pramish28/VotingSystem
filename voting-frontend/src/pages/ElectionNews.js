import React, { useState, useEffect } from 'react';
import api from '../api';
import './ElectionNews.css';

function ElectionNews() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await api.get('/post/news');
        setNews(res.data);
      } catch (err) {
        console.error('Failed to fetch news:', err);
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="news-container">
      <h2>Election News</h2>
      {news.map((post) => (
        <div key={post._id} className="news-item">
          <h4>{post.userId.name}</h4>
          <p>{post.content}</p>
          {post.image && <img src={post.image} alt="News" className="news-image" />}
        </div>
      ))}
    </div>
  );
}

export default ElectionNews;