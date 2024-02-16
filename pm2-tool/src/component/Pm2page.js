import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Pm2page= () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const response = await axios.get('http://localhost:4000/logs/success');
    setLogs(response.data);
  };


  return (
    <div>
      <h1>Pm2 Log</h1>
      <p>{logs}</p>
      {/* <ul>
        {logs.map((log) => (
          <li key={log.id}>
            {log.title} by {log.author}
          </li>
        ))}
      </ul> */}
      
    </div>
  );
};

export default Pm2page;
