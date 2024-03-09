import React from 'react';
import { useNavigate } from 'react-router-dom';

const PostList = ({ posts }) => {
  let navigate = useNavigate();

  return (
    <div className="postListContainer">
      {posts.map(post => (
        <div key={post.id} className="post" onClick={() => navigate(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
          <div className='postTitle'>{post.postTitle}</div>
          <div className='postLikes'>{`♥ ${post.PostLikes.length}`}</div>
          <div className='postAuthor'>{post.postAuthor}</div>
        </div>
      ))}
    </div>
  );
}

export default PostList;