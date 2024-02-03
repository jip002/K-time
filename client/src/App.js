import './App.css';
import { useState, useEffect } from 'react';
import schoolListData from './data/schoolList.json';

function App() {
  const [schools, setSchools] = useState([]);

  useEffect(() => {
    setSchools(schoolListData);
  }, []);

  return (
    <div className="App">
      <h1>K-Time</h1>
      <div className = "schoolListContainer">
        {schools.map(school => (
          <div key={school.id}>{school.name}</div>
        ))}
      </div>
    </div>
  );
}

export default App;
