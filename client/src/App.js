import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { CreatePost } from './pages/CreatePost';
import { Forum } from './pages/Forum';
import { Post } from './pages/Post';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Link to='/'> Home Page </Link><br/>
        <Link to='/login'> Login </Link><br/>
        <Link to='/createpost'> Create Post </Link><br/>
        <Link to='/forum'> Forum </Link>
        <Routes>
          <Route index element={<Home/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/createpost' element={<CreatePost/>}></Route>
          <Route path='/forum' element={<Forum/>}></Route>
          <Route path='/post/:id' element={<Post/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
