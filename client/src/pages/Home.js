import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Home.css';

export const Home = () => {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/schools')
      .then((response)=>{
          setSchools(response.data);
          console.log(response.data);
    })
  }, []);

  return (
    <div className="Home">
      <h1>K-Time</h1>
      <div className = "schoolListContainer">
        <div className = "school">
        {
          schools.map(school => (
            <div onClick = {() => { navigate('/forum') }} key={school.id}>{school.schoolName}</div>
          ))
        }
        </div>
      </div>
    </div>
  );
}