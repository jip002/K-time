import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import { useAuth } from '../hooks/useAuth';
// import Logo from '../Logo1.svg';
// import './NavBar.css';
// import { SlHome } from "react-icons/sl";
// import { SlCompass } from "react-icons/sl";
// import { SlBubbles } from "react-icons/sl";
// import { googleLogout } from '@react-oauth/google';
// import { useNavigate } from 'react-router-dom';
// import { SlPlus } from "react-icons/sl";

const NavBar = () => {
    const { authState } = useContext(AuthContext);
    const { logout } = useAuth();
    return (
        <div className='navbar'>
          <Link to='/'>HOME PAGE</Link><br/>
          {!authState.status ? (
            <>
              <Link to='/login'>LOGIN</Link><br/>
              <Link to='/signup'>SIGN UP</Link><br/>
            </>
          ) : (
            <>
              <Link to='/' onClick={logout}>LOG OUT</Link><br/>
              <Link to='/createpost'>CREATE A POST</Link><br/>
              <Link to='/forum'>FORUM</Link><br/>
              <Link to={`/profile/${authState.id}`}>My Profile</Link><br/>
            </>
          )}
        </div>
      );
    };
    
export default NavBar;