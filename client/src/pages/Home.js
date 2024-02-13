import { useState, useEffect } from 'react';
import axios from 'axios';

export const Home = () => {
  const [schools, setSchools] = useState([]);


  useEffect(() => {
    axios.get('http://localhost:3001/schools')
      .then((response)=>{
          setSchools(response.data);
    })
  }, []);

  return (
    <div className="Home">
      <h1>K-Time</h1>
      <div className = "schoolListContainer">
        <div className = "school">
        {
          schools.map(school => (
            <div key={school.id}>{school.schoolName}</div>
          ))
        }
        </div>
      </div>
    </div>
  );
}