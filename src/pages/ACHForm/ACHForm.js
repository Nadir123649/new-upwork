import React, { useState } from 'react';
import axios from 'axios';
import './ACHForm.css';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';

const ACHForm = () => {
  const [formData, setFormData] = useState({
    account_owner_name: '',
    bank_account_type: '',
    bank_account_number: '',
    bank_routing_number: '',
    nickname: '',
    processor_token: '',
    instant: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const accountId = localStorage.getItem('accountId');
      await axios.post(
        `https://broker-api.sandbox.alpaca.markets/v1/accounts/${accountId}/ach_relationships`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Basic YOUR_BASE64_ENCODED_API_KEY_SECRET',
          },
        }
      );

      // Reset form data
      setFormData({
        account_owner_name: '',
        bank_account_type: '',
        bank_account_number: '',
        bank_routing_number: '',
        nickname: '',
        processor_token: '',
        instant: false,
      });

      // TODO: Display success message or redirect to a success page
    } catch (error) {
      console.error('Error submitting form:', error);
      // TODO: Display error message to the user
    }
  };

  return (
    <div className="ach-form">
      <div className="ach-form-content">
        <Header />

        <div className="ach-form-container">
          <Navbar />

          <div className="ach-form-main">
            <h2>Create ACH Relationship</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="account_owner_name">Account Owner Name</label>
                <input
                  type="text"
                  id="account_owner_name"
                  name="account_owner_name"
                  value={formData.account_owner_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="bank_account_type">Bank Account Type</label>
                <select
                  id="bank_account_type"
                  name="bank_account_type"
                  value={formData.bank_account_type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an account type</option>
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                </select>
              </div>
              <div>
                <label htmlFor="bank_account_number">Bank Account Number</label>
                <input
                  type="text"
                  id="bank_account_number"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="bank_routing_number">Bank Routing Number</label>
                <input
                  type="text"
                  id="bank_routing_number"
                  name="bank_routing_number"
                  value={formData.bank_routing_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="nickname">Nickname</label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="processor_token">Processor Token</label>
                <input
                  type="text"
                  id="processor_token"
                  name="processor_token"
                  value={formData.processor_token}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="instant">Instant</label>
                <input
                  type="checkbox"
                  id="instant"
                  name="instant"
                  checked={formData.instant}
                  onChange={handleChange}
                />
              </div>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ACHForm;