import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';


export const Login = () => {
  const [ user, setUser ] = useState([]);
  const [ profile, setProfile ] = useState([]);

  const login = useGoogleLogin({
      onSuccess: (codeResponse) => setUser(codeResponse),
      onError: (error) => console.log('Login Failed:', error)
  });

   useEffect(
      () => {
          if (user) {
              console.log(user);
              axios
                  .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                      headers: {
                          Authorization: `Bearer ${user.access_token}`,
                          Accept: 'application/json'
                      }
                  })
                  .then((res) => {
                      setProfile(res.data);
                      sendToServer(res.data);
                        navigate('/forum', {
                            state: {
                                name: res.data.name,
                                email: res.data.email,
                                picture: res.data.picture
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
    const userData = {
        name: userInfo.name,
        email: userInfo.email
    };

    axios.post('http://localhost:3001/users', userData)
        .then(response => {
            console.log('User info sent to server:', response.data);
        })
        .catch(error => {
            console.error('Error sending user info:', error);
        });
};

  return (
    <div className="Login">
      <h1>Login Page</h1>
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