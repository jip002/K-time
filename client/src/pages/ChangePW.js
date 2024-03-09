import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePWForm from '../components/ChangePWForm';
import axios from 'axios';
import '../styles/ChangePW.css';

export const ChangePW = () => {
    const navigate = useNavigate();

    const onSubmit = (data) => {
        axios.put('http://localhost:3001/auth/changepw', data, {
            headers: {
              accessToken: sessionStorage.getItem('accessToken')
            }
          }).then((res) => {
            console.log(res.data);
            navigate('/profile/1');
          })
    }

    return (
      <div className="ChangePW">
        <h1>Change Password</h1>
        <ChangePWForm onSubmit={onSubmit} />
      </div>
    );
}