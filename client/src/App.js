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
        <div className = 'navbar'>
          <Link to='/'> HOME PAGE </Link><br/>
          <Link to='/login'> LOGIN </Link><br/>
          <Link to='/createpost'> CREATE POST </Link><br/>
          <Link to='/forum'> FORUM </Link>
        </div>
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
