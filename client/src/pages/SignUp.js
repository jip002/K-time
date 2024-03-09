import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/SignUp.css';

export const SignUp = () => {

    const navigate = useNavigate();
    const { authState, setAuthState } = useContext(AuthContext);

    const initialValues = {
        nickname: '',
        password: '',
        email: '',
        school: '',
    };

    const onSubmit = (data) => {
        axios.post('http://localhost:3001/auth', data).then((res) => {
            console.log("Signed up!");
            if(res.data.error) alert(res.data.error);
            else {
              sessionStorage.setItem("accessToken", res.data.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
              setAuthState({
                  nickname: res.data.nickname,
                  id: res.data.id,
                  school: res.data.school,
                  email: res.data.email,
                  status: true
              });
            }
            console.log(res.data);
            navigate('/forum');
        });
    };

    const validationSchema = Yup.object().shape({
        nickname: Yup.string().min(3).max(15).required('Nickname cannot be empty'),
        email: Yup.string().required('Email cannot be empty'),
        password: Yup.string().min(7).max(20).required('You must put a password'),
        school: Yup.string().required("School cannot be empty")
    });

    return (
      <div className="SignUp">
        <h1>SignUp Page</h1>
        <Formik 
            initialValues={initialValues} 
            onSubmit = {onSubmit}
            validationSchema = {validationSchema}
        >
            <Form className = 'signUpContainer'>
                <label>Nickname: </label><br/>
                <Field 
                id = 'inputNickname' 
                name='nickname' 
                placeholder='Put your nickname here...'/>
                <br/><ErrorMessage name ='nickname'component = 'span'/><br/>
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
                autocomplete='off'
                name='password' 
                placeholder='Put your password here...'/>
                <br/><ErrorMessage name ='password'component = 'span'/><br/>
                <label>School: </label><br/>
                <Field 
                id = 'inputSchool' 
                name='school' 
                placeholder='Put your school name here...'/>
                <br/><ErrorMessage name ='school'component = 'span'/><br/>
                <button type='submit'>Sign Up!</button>
            </Form>
        </Formik>
      </div>
    );
  }