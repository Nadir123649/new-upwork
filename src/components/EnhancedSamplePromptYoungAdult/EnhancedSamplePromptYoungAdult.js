import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaChevronDown, FaArrowRight } from 'react-icons/fa';

const EnhancedSamplePromptYoungAdult = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isComplete, setIsComplete] = useState(false);

  const locations = [
    { id: 1, name: 'San Francisco, CA' },
    { id: 2, name: 'Los Angeles, CA' },
    { id: 3, name: 'New York, NY' },
    { id: 4, name: 'Chicago, IL' },
    { id: 5, name: 'Boston, MA' },
  ];

  const handleLocationSelect = (e) => {
    const location = locations.find(loc => loc.id === parseInt(e.target.value));
    setSelectedLocation(location);
    setIsComplete(true);
  };

  useEffect(() => {
    if (isComplete && selectedLocation) {
      onLocationSelect({
        location: selectedLocation.name
      });
    }
  }, [isComplete, selectedLocation, onLocationSelect]);

  return (
    <div className={`enhanced-sample-prompt one-dropdown ${isComplete ? 'selection-complete' : ''}`}>
      <div className="sample-prompt-header">
        <FaLightbulb /> Young Adult Events and Mass Times
      </div>
      <div className="sample-prompt-text">
        Choose a location to find young adult events and mass times
      </div>
      <div className="selection-container">
        <div className={`selection-row ${selectedLocation ? 'active' : ''}`}>
          <select 
            value={selectedLocation ? selectedLocation.id : ''} 
            onChange={handleLocationSelect}
          >
            <option value="">Select a City</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
          <FaChevronDown className="dropdown-icon" />
        </div>
      </div>
      {isComplete && (
        <div className="completion-message">
          <FaArrowRight /> Now, ask about young adult events or mass times for this location in the chat input below
        </div>
      )}
    </div>
  );
};

export default EnhancedSamplePromptYoungAdult;