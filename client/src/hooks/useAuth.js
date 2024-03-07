// hooks/useAuth.js
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../helpers/AuthContext';

export const useAuth = () => {
  const { authState, setAuthState } = useContext(AuthContext);

  useEffect(() => {
    axios.get('http://localhost:3001/auth/verify', {
      headers: { accessToken: sessionStorage.getItem('accessToken') }
    }).then((response) => {
      if (response.data.error) {
        setAuthState({ ...authState, status: false });
      } else {
        setAuthState({
          nickname: response.data.nickname,
          id: response.data.id,
          status: true
        });
      }
    });
  }, [setAuthState]);

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setAuthState({ nickname: '', id: 0, status: false });
  };

  return { logout };
};