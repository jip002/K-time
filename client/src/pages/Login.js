import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Login.css';

export const Login = () => {

  const navigate = useNavigate();
  const { authState, setAuthState } = useContext(AuthContext);

    const initialValues = {
        password: '',
        email: ''
    };

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/auth/login', data).then((res) => {
          if(res.data.error) alert(res.data.error);
          else {
            sessionStorage.setItem("accessToken", res.data.token);
            setAuthState({nickname: res.data.nickname, id: res.data.id, status: true});
          }
          console.log(res.data);
          navigate('/forum');
        });
    };

    const validationSchema = Yup.object().shape({
      email: Yup.string().required('Email cannot be empty'),
      password: Yup.string().required('You must put a password')
  });

  return (
    <div className="Login">
      <h1>Login Page</h1>
      <Formik 
            initialValues={initialValues} 
            onSubmit = {onSubmit}
            validationSchema = {validationSchema}
        >
            <Form className = 'loginContainer'>
                <label>School Email: </label><br/>
                <Field 
                id = 'inputEmail' 
                name='email' 
                placeholder='Put your school email here...'/>
                <br/><ErrorMessage name ='email'component = 'span'/><br/>
                <label>Password: </label><br/>
                <Field 
                id = 'inputPassword' 
                type='password'
                autoComplete='off'
                name='password' 
                placeholder='Put your password here...'/>
                <br/><ErrorMessage name ='password'component = 'span'/><br/>
                <button type='submit'>Login</button>
            </Form>
        </Formik>
    </div>
  );
}