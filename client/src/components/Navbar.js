import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { authState, setAuthState } = useContext(AuthContext);

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setAuthState({ nickname: '', id: 0, status: false });
  };

  return (
    <div className='navbar'>
      <div className="links-container">
        <Link to='/'> HOME PAGE </Link>
        {!authState.status ? (
          <>
            <Link to='/login'> LOGIN </Link>
            <Link to='/signup'> SIGN UP </Link>
          </>
        ) : (
          <>
            <Link to='/' onClick={logout}> LOG OUT </Link>
            <Link to='/createpost'> CREATE A POST </Link>
            <Link to='/forum'> FORUM </Link>
            <Link to='/chatbox'> CHATBOX </Link>
          </>
        )}
      </div>
      {authState.status && <Link to={`/profile/${authState.id}`}> MY PROFILE </Link>}
    </div>
  );
};

export default Navbar;