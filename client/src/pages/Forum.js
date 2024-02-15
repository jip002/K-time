import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Forum.css';

export const Forum = () => {
  const [posts, setPosts] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/posts')
    .then((response)=>{
      setPosts(response.data);
    })
  }, []);

  return (
    <div className="Forum">
      <h1>UCSD Forum</h1>
      <div className="postListContainer">
        {posts.map(post => (
          <div key={post.id} className="post" onClick={() => navigate(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
            {post.title}
            {/* TODO postTitle --> title */}
          </div>
        ))}
      </div>
    </div>
  );
}