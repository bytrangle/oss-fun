import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/event-stream');
      const data = await response.json();
      
      if (data.message === 'success') {
        setEvents(data.data);
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      setError('Error connecting to API: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>OSS Fun</h1>
        <p>Highlighting what is happening on Github and the cool folks behind it.</p>
        
        {/* <button onClick={fetchEvents} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh Events'}
        </button>
        
        {error && (
          <div className="error">
            <p>Error: {error}</p>
          </div>
        )}
        
        <div className="events-container">
          <h2>Recent GitHub Events ({events.length})</h2>
          
          {events.length === 0 && !loading && (
            <p>No events available</p>
          )}
          
          {events.map((event, index) => (
            <div key={index} className="event-card">
              <div className="event-type">{event.type}</div>
              <div className="event-details">
                <p><strong>Repository:</strong> {event.repo_name || 'N/A'}</p>
                <p><strong>Actor:</strong> {event.actor_login || 'N/A'}</p>
                {event.action && <p><strong>Action:</strong> {event.action}</p>}
              </div>
            </div>
          ))}
        </div> */}
      </header>
    </div>
  );
}

export default App;
