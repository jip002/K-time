import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Link to='/login'>LOGIN</Link>
        <Routes>
          <Route index element={<Home/>}></Route>
          <Route path='/login' element={<Login/>}></Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
