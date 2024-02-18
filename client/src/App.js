import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './helpers/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { CreatePost } from './pages/CreatePost';
import { Forum } from './pages/Forum';
import { Post } from './pages/Post';
import { SignUp } from './pages/SignUp';
import './App.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [authState, setAuthState] = useState({nickname: '', id: 0, status: false});

  useEffect(() => {
    axios.get('http://localhost:3001/auth/verify', {
      headers: { 
        accessToken: sessionStorage.getItem('accessToken')
      }
    }).then((res) => {
      if(res.data.error) setAuthState({...authState, status: false});
      else setAuthState({
        nickname: res.data.nickname,
        id: res.data.id,
        school: res.data.school,
        email: res.data.email,
        status: true
      });
    })
  }, []);

  const logout = () => {
    sessionStorage.removeItem('accessToken');
    setAuthState({nickname: '', id: 0, status: false});
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{authState, setAuthState}}>
        <BrowserRouter>
          <div className = 'navbar'>
            <Link to='/'> HOME PAGE </Link><br/>
            {!authState.status ? (
              <>
                <Link to='/login'> LOGIN </Link><br/>
                <Link to='/signup'> SIGN UP </Link><br/>
              </>
            ) : <>
              <Link to='/' onClick={logout} >LOG OUT</Link>
              <Link to='/createpost'> CREATE A POST </Link><br/>
              <Link to='/forum'> FORUM </Link>
              <div className='navNickname'>{`Welcome, ${authState.nickname}`}</div>
              </>
            }
          </div>
          <Routes>
            <Route index element={<Home/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/signup' element={<SignUp/>}></Route>
            <Route path='/createpost' element={<CreatePost/>}></Route>
            <Route path='/forum' element={<Forum/>}></Route>
            <Route path='/post/:id' element={<Post/>}></Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
