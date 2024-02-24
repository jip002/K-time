import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useParams } from 'react-router-dom';
// import '../styles/Profile.css';

export const Profile = () => {
  //const [schools, setSchools] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState({});
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3001/auth/${id}`).then((res) => {
        setUserInfo(res.data);
    });
    axios.get(`http://localhost:3001/posts/byUser/${id}`).then((res) => {
        setUserPosts(res.data);
    });
  }, [])

  return (
    <div className="ProfileContainer">
        <h1>Hello, {userInfo.nickname}</h1>
        <div className='profileInfo'>
            <p>Nickname: {userInfo.nickname}</p>
            <p>Email Address: {userInfo.email}</p>
            <p>School: {userInfo.school}</p>
        </div>
        <div className="postListContainer">
        {userPosts.map(post => (
          <>
            <div key={post.id} className="post" onClick={() => navigate(`/post/${post.id}`)} style={{ cursor: 'pointer' }}>
              {post.postTitle}
              <div>{`♥ ${post.PostLikes.length}`}</div>
            </div>
          </>
        ))}
      </div>
    </div>
  );
}