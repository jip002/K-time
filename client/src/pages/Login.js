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
                      sendToServer(res.data);
                        navigate('/login', {
                            state: {
                                name: res.data.name,
                                email: res.data.email,
                                // picture: res.data.picture
                            }
                        });
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

  const sendToServer = (userInfo) => {
    fetch('../data/schoolList.json') // Fetch the JSON file from the public folder
        .then(response => response)
        .then(schoolList => {
            // Find the school name corresponding to userInfo.hd
            const matchedSchool = schoolList.find(school => school.hd === userInfo.hd);
            const school = matchedSchool ? matchedSchool.name : null;
            const userData = {
                email: userInfo.email,
                school: school
            };
            axios.post('http://localhost:3001/auth/login', userData)
                .then(response => {
                    console.log('User info sent to server:', response.data);
                })
                .catch(error => {
                    console.error('Error sending user info:', error);
                });
        })
        .catch(error => {
            console.error('Error fetching school list:', error);
        });
  };
//   const { authState, setAuthState } = useContext(AuthContext);

//     const initialValues = {
//         password: '',
//         email: ''
//     };

//     const onSubmit = (data) => {
//         axios.post('http://localhost:3001/auth/login', data).then((res) => {
//           if(res.data.error) alert(res.data.error);
//           else {
//             sessionStorage.setItem("accessToken", res.data.token);
//             setAuthState({
//                 nickname: res.data.nickname,
//                 id: res.data.id,
//                 school: res.data.school,
//                 email: res.data.email,
//                 status: true
//             });
//           }
//           console.log(res.data);
//           navigate('/login');
//         });
//     };

    const validationSchema = Yup.object().shape({
      email: Yup.string().required('Email cannot be empty'),
      password: Yup.string().required('You must put a password')
  });

  return (
    <div className="Login">
      <h1>Login Page</h1>

      {/* <Formik 
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
        </Formik> */}

       <h2>React Google Login</h2>
            <br />
            <br />
            {profile ? (
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
    </div>
  );
}