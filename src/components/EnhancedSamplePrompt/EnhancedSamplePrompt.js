import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaLightbulb, FaChevronDown, FaArrowRight } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const EnhancedSamplePrompt = ({ onResourceSelect }) => {
  const [organizations, setOrganizations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [visibleDropdowns, setVisibleDropdowns] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Updated to use API_ENDPOINTS
  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(API_ENDPOINTS.GET_ORGANIZATIONS);
        setOrganizations(response.data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setError('Failed to load organizations');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  // Updated to use API_ENDPOINTS
  useEffect(() => {
    const fetchCategories = async () => {
      if (selectedOrg) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(`${API_ENDPOINTS.GET_CATEGORIES}/${encodeURIComponent(selectedOrg.name)}`);
          setCategories(response.data);
        } catch (error) {
          console.error('Error fetching categories:', error);
          setError('Failed to load categories');
          setCategories([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [selectedOrg]);

  // Updated to use API_ENDPOINTS
  useEffect(() => {
    const fetchResources = async () => {
      if (selectedOrg && selectedCategory) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get(
            `${API_ENDPOINTS.GET_RESOURCES}/${encodeURIComponent(selectedOrg.name)}/${encodeURIComponent(selectedCategory)}`
          );
          setResources(response.data);
        } catch (error) {
          console.error('Error fetching resources:', error);
          setError('Failed to load resources');
          setResources([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResources([]);
      }
    };
    fetchResources();
  }, [selectedOrg, selectedCategory]);

  const handleOrgSelect = (e) => {
    const org = organizations.find(org => org.name === e.target.value);
    setSelectedOrg(org);
    setSelectedCategory(null);
    setSelectedResource(null);
    setIsComplete(false);
    setVisibleDropdowns(org ? 2 : 1);
  };

  const handleCategorySelect = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setSelectedResource(null);
    setIsComplete(false);
    setVisibleDropdowns(category ? 3 : 2);
  };


  const handleResourceSelect = (e) => {
    const resource = resources.find(res => res.id === parseInt(e.target.value));
    setSelectedResource(resource);
    setIsComplete(true);

    // Pass selected data to parent without modifying the prompt
    if (selectedOrg && selectedCategory && resource) {
      onResourceSelect({
        organization: selectedOrg.id,
        orgName: selectedOrg.name,
        category: selectedCategory,
        resource: resource.name
      });
    }
  };

  const getDropdownClass = () => {
    if (visibleDropdowns === 3) return 'three-dropdowns';
    if (visibleDropdowns === 2) return 'two-dropdowns';
    return 'one-dropdown';
  };

  if (error) {
    return (
      <div className="enhanced-sample-prompt error">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className={`enhanced-sample-prompt ${isComplete ? 'selection-complete' : ''} ${getDropdownClass()}`}>
      <div className="sample-prompt-header">
        <FaLightbulb /> Scructured Spiritual Lessons
      </div>
      <div className="sample-prompt-text">
        Choose a lesson; enter a prompt to reflect on it.
      </div>
      <div className="selection-container">
        {/* Organization Dropdown */}
        <div className={`selection-row ${selectedOrg ? 'active' : ''}`}>
          <select 
            value={selectedOrg ? selectedOrg.name : ''} 
            onChange={handleOrgSelect}
            disabled={isLoading}
          >
            <option value="">Select A Prebuilt Lesson</option>
            {organizations.map(org => (
              <option key={org.id} value={org.name}>{org.name}</option>
            ))}
          </select>
          <FaChevronDown className="dropdown-icon" />
        </div>

        {/* Category Dropdown */}
        {selectedOrg && (
          <div className={`selection-row ${selectedCategory ? 'active' : ''}`}>
            <select
              value={selectedCategory || ''}
              onChange={handleCategorySelect}
              disabled={isLoading}
            >
              <option value="">Select a Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <FaChevronDown className="dropdown-icon" />
          </div>
        )}

        {/* Resource Dropdown */}
        {selectedCategory && (
          <div className={`selection-row ${selectedResource ? 'active' : ''}`}>
            <select
              value={selectedResource ? selectedResource.id : ''}
              onChange={handleResourceSelect}
              disabled={isLoading}
            >
              <option value="">Select a Resource</option>
              {resources.map(resource => (
                <option key={resource.id} value={resource.id}>{resource.name}</option>
              ))}
            </select>
            <FaChevronDown className="dropdown-icon" />
          </div>
        )}

        {isLoading && (
          <div className="loading-indicator">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
      
      {isComplete && (
        <div className="completion-message">
          <FaArrowRight /> Now, ask your question about this resource in the chat input below
        </div>
      )}
    </div>
  );
};

export default EnhancedSamplePrompt;