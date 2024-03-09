import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Yup from 'yup';
import { useContext } from 'react';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Login.css';
import { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import schoolList from '../static/schoolList.json';


export const Login = () => {
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);
  const navigate = useNavigate();

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

   useEffect(
      () => {
          if (user) {
            //   console.log(user);
              axios
                  .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                      headers: {
                          Authorization: `Bearer ${user.access_token}`,
                          Accept: 'application/json'
                      }
                  })
                  .then((res) => {
                      console.log(res.data);
                      setProfile(res.data);
                      sendToServer(res.data, schoolList);
                  })
                  .catch((err) => console.log(err));
          }
      },
      [ user ]
  );
  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
      googleLogout();
      setProfile(null);
  };

  const sendToServer = (userInfo, schoolList) => {
    // Instead of fetching, use the provided schoolList directly
    // const schoolList = [...]; // Assume this is provided somewhere else in your code

    // Now 'schoolList' is the array of schools
    console.log(schoolList);
    const matchedSchool = schoolList.find(school => school.hd === userInfo.hd);
    const school = matchedSchool ? matchedSchool.name : null;
    const userData = {
        email: userInfo.email,
        school: school
    };
    axios.post('http://localhost:3001/auth/glogin', userData)
        .then(res => {
            console.log('User info sent to server:', res.data);
            if(res.data.error) alert(res.data.error);
            else {
              sessionStorage.setItem("accessToken", res.data.token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
              setAuthState({
                  id: res.data.id,
                  school: res.data.school,
                  email: res.data.email,
                  status: true
              });
              navigate('/forum');
            }
        })
        .catch(error => {
            console.error('Error sending user info:', error);
        });
}
  
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
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setAuthState({
                nickname: res.data.nickname,
                id: res.data.id,
                school: res.data.school,
                email: res.data.email,
                status: true
            });
            navigate('/forum');
          }
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
        <AuthContext.Provider value={{authState, setAuthState}}>
        <h2>React Google Login</h2>
            <br />
            <br />
            {authState.status ? (
                <div>
                    <img src={profile.picture} alt="user image" />
                    <h3>User Logged in</h3>
                    <p>Name: {profile.name}</p>
                    <p>Email Address: {profile.email}</p>
                    <br />
                    <br />
                    <button onClick={logOut}>Log out</button>
                </div>
            ) : (
                <button onClick={() => login()}>Sign in with Google 🚀 </button>
            )} 
        </AuthContext.Provider>
    </div>
  );
}