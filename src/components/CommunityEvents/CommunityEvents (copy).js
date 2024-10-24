import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaMapMarkerAlt, FaUserAlt, FaLink, FaPlus, FaTimes, FaUsers } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './CommunityEvents.css';

const CommunityEvents = ({ userId, isAdmin }) => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    is_digital: false,
    description: '',
    organizer_contact: '',
    is_public: true,
    event_link: ''
  });
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  useEffect(() => {
    fetchAllEvents();
  }, [userId]);

  const fetchAllEvents = async () => {
    try {
      const [personalResponse, groupResponse] = await Promise.all([
        axios.get(API_ENDPOINTS.EVENTS),
        axios.get(API_ENDPOINTS.ALL_EVENTS.replace(':userId', userId))
      ]);
      
      const personalEvents = personalResponse.data.map(event => ({ ...event, isGroupEvent: false }));
      const groupEvents = groupResponse.data.filter(event => event.is_group_event);
      
      setEvents([...personalEvents, ...groupEvents]);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_ENDPOINTS.EVENTS, newEvent);
      setNewEvent({
        title: '',
        date: '',
        location: '',
        is_digital: false,
        description: '',
        organizer_contact: '',
        is_public: true,
        event_link: ''
      });
      setShowNewEventForm(false);
      fetchAllEvents();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  return (
    <div className="community-hub">
      <h2><FaCalendarAlt /> Community Events</h2>
      
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <h3>
              {event.title}
              {event.isGroupEvent && (
                <span className="group-indicator">
                  <FaUsers title="Group Event" /> {event.group_name}
                </span>
              )}
            </h3>
            <div className="event-details">
              <p><FaCalendarAlt /> {new Date(event.date).toLocaleString()}</p>
              <p><FaMapMarkerAlt /> {event.is_digital ? 'Digital Event' : event.location || 'TBA'}</p>
              <p><FaUserAlt /> {event.organizer_contact}</p>
            </div>
            <p className="event-description">{event.description}</p>
            {event.event_link && (
              <a 
                href={event.event_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="event-link"
              >
                <FaLink /> Event Details
              </a>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="admin-section">
          <button onClick={() => setShowNewEventForm(!showNewEventForm)} className="toggle-form-button">
            {showNewEventForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Create New Event</>}
          </button>
          {showNewEventForm && (
            <form onSubmit={handleCreateEvent} className="new-event-form">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event Title"
                required
              />
              <input
                type="datetime-local"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                required
              />
              <input
                type="text"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Location"
                required
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newEvent.is_digital}
                  onChange={(e) => setNewEvent({ ...newEvent, is_digital: e.target.checked })}
                />
                Digital Event
              </label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Event Description"
                required
              />
              <input
                type="text"
                value={newEvent.organizer_contact}
                onChange={(e) => setNewEvent({ ...newEvent, organizer_contact: e.target.value })}
                placeholder="Organizer Contact"
                required
              />
              <input
                type="url"
                value={newEvent.event_link}
                onChange={(e) => setNewEvent({ ...newEvent, event_link: e.target.value })}
                placeholder="Event Link (optional)"
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newEvent.is_public}
                  onChange={(e) => setNewEvent({ ...newEvent, is_public: e.target.checked })}
                />
                Public Event
              </label>
              <button type="submit" className="submit-button">Create Event</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;