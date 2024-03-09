import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoginForm from '../components/LoginForm';
import { useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Login.css';

export const Login = () => {

  const navigate = useNavigate();
  const { setAuthState } = useContext(AuthContext);

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/auth/login', data).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            sessionStorage.setItem("accessToken", res.data.token);
            setAuthState({nickname: res.data.nickname, id: res.data.id, status: true});
          }
          navigate('/forum');
        });
    };

  return (
    <div className="Login">
      <h1>Login Page</h1>
      <LoginForm onSubmit={onSubmit}/>
    </div>
  );
}