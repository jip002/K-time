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
    .catch((error) => {
      console.error('Error fetching posts:', error);
    });
  }, []);

  const handleClick = (postCategory, pid) => {
    const params = encodeURIComponent(JSON.stringify({ postCategory, pid })); // Encode parameters
    navigate(`/post/${params}`);
  };

  return (
    <div className="Forum">
      <h1>UCSD Forum</h1>
        <div className="postListContainer">
          {posts.map(post => (
            <div key={`${post.postCategory}-${post.pid}`} className="post" onClick={() => handleClick(post.postCategory, post.pid)} style={{ cursor: 'pointer' }}>
              {post.title}
              <div>{`♥ ${post.numLikes}`}</div>
            </div>
          ))}
        </div>
    </div>
  );
}