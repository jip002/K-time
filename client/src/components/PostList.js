import React from 'react';
import { useNavigate } from 'react-router-dom';

const PostList = ({ posts }) => {
  let navigate = useNavigate();

  return (
    <div className="postListContainer">
      {posts.map(post => (
        <div key={post.id} className="post" onClick={() => navigate(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
          <div>{post.postTitle}</div>
          <div>{`♥ ${post.PostLikes.length}`}</div>
          <div>{post.postAuthor}</div>
        </div>
      ))}
    </div>
  );
}

export default PostList;