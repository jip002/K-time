import { useState, useEffect, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import PostList from '../components/PostList';
import axios from 'axios';
import '../styles/Profile.css';

export const Profile = () => {
  const navigate = useNavigate();
  const {authState, setAuthState} = useContext(AuthContext);
  const { id } = useParams();
  const [userInfo, setUserInfo] = useState({});
  const [userPosts, setUserPosts] = useState([]);
  const [changeNickName, setChangeNickName] = useState(false);
  const [nickName, setNickName] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3001/auth/${id}`).then((res) => {
        setUserInfo(res.data);
        console.log(res.data)
    });
    axios.get(`http://localhost:3001/posts/byUser/${id}`).then((res) => {
        setUserPosts(res.data);
    });
  }, [])

  const onConfirm = (data) => {
    console.log(data)
    axios.put(`http://localhost:3001/auth/nickname/${id}`, {
      id: id,
      nickname: data
    }, {
      headers: {
        accessToken: sessionStorage.getItem('accessToken')
      }
    }).then((res) => {
        console.log(res.data);
        setUserInfo({...userInfo, nickname: res.data.nickname});
        sessionStorage.setItem("accessToken", res.data.token);
        setAuthState({nickname: res.data.nickname, id: res.data.id, status: true});
        setChangeNickName(false);
      }
    )
  }

  return (
    <div className="ProfileContainer">
        <h1>Hello, {userInfo.nickname}</h1>
        <div className='profileInfo'>
            {!changeNickName
            ? <>
                <p>Nickname: {userInfo.nickname}</p>
                <button onClick={()=>{setChangeNickName(true)}}>Change nickname</button>
              </>
            : <>
                <input
                  type="text"
                  value={nickName}
                  onChange={(event) => setNickName(event.target.value)}
                />
                <button onClick={()=>{onConfirm(nickName)}}>Confirm</button><br/>
                <button onClick={()=>{setChangeNickName(false)}}>Cancel</button>
              </>
            }
            <p>Email Address: {userInfo.email}</p>
            <p>School: {userInfo.school}</p>
            <button onClick={()=>navigate('/changepw')}>Change password</button>
        </div>

        <PostList posts={userPosts} />
    </div>
  );
}