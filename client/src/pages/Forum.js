import { useState, useEffect } from 'react';
import PostList from '../components/PostList';
import axios from 'axios';
import '../styles/Forum.css';

export const Forum = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/posts')
    .then((response)=>{
      setPosts(response.data);
    })
  }, []);

  return (
    <div className="Forum">
      <h1>UCSD Forum</h1>
      <PostList posts={posts} />
    </div>
  );
}