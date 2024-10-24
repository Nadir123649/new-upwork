import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendar } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const GroupEvents = ({ groupId }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });

  useEffect(() => {
    fetchGroupEvents();
  }, [groupId]);

  const fetchGroupEvents = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GROUP_EVENTS}/${groupId}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching group events:', error);
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.GROUP_EVENTS}/${groupId}`, newEvent);
      setNewEvent({ title: '', date: '', description: '' });
      fetchGroupEvents();
    } catch (error) {
      console.error('Error submitting group event:', error);
    }
  };

  return (
    <div className="group-events">
      <h2><FaCalendar /> Group Events</h2>
      <form onSubmit={handleSubmitEvent}>
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          required
        />
        <input
          type="datetime-local"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          required
        />
        <textarea
          placeholder="Event Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          required
        ></textarea>
        <button type="submit">Create Event</button>
      </form>
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <h3>{event.title}</h3>
            <p>{new Date(event.date).toLocaleString()}</p>
            <p>{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupEvents;