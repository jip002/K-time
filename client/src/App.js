import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './helpers/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { CreatePost } from './pages/CreatePost';
import { Forum } from './pages/Forum';
import { Post } from './pages/Post';
import { SignUp } from './pages/SignUp';
import { Profile } from './pages/Profile';
import { ChangePW } from './pages/ChangePW';
import { ChatBox } from './pages/ChatBox';
import Navbar from './components/Navbar';
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
        status: true
      });
    })
  }, []);

  return (
    <div className="App">
      <AuthContext.Provider value={{authState, setAuthState}}>
        <BrowserRouter>
        <Navbar />
          <Routes>
            <Route index element={<Home/>}></Route>
            <Route path='/login' element={<Login/>}></Route>
            <Route path='/signup' element={<SignUp/>}></Route>
            <Route path='/profile/:id' element={<Profile/>}></Route>
            <Route path='/createpost' element={<CreatePost/>}></Route>
            <Route path='/forum' element={<Forum/>}></Route>
            <Route path='/post/:id' element={<Post/>}></Route>
            <Route path='/changepw' element={<ChangePW/>}></Route>
            <Route path='/chatbox' element={<ChatBox/>}></Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
