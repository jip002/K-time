import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import SignUpForm from '../components/SignUpForm';
import '../styles/SignUp.css';

export const SignUp = () => {

    const navigate = useNavigate();

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/auth', data).then((res) => {
            console.log("Signed up!");
            navigate('/forum');
        });
    };

    return (
      <div className="SignUp">
        <h1>SignUp Page</h1>
            <SignUpForm onSubmit={onSubmit}/>
      </div>
    );
  }