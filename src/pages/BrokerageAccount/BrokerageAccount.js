import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../../store/actions/userActions';
import './BrokerageAccount.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';

const AccountForm = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    contact: {
      email_address: '',
      phone_number: '',
      street_address: [''],
      unit: '',
      city: '',
      state: '',
      postal_code: '',
    },
    identity: {
      given_name: '',
      middle_name: '',
      family_name: '',
      date_of_birth: '',
      tax_id: '',
      tax_id_type: 'USA_SSN',
      country_of_citizenship: '',
      country_of_birth: '',
      country_of_tax_residence: 'USA',
      funding_source: [''],
      annual_income_min: '',
      annual_income_max: '',
      liquid_net_worth_min: '',
      liquid_net_worth_max: '',
    },
    disclosures: {
      is_control_person: false,
      is_affiliated_exchange_or_finra: false,
      is_politically_exposed: false,
      immediate_family_exposed: false,
      employment_status: '',
      employer_name: '',
      employer_address: '',
      employment_position: '',
    },
    agreements: [
      {
        agreement: 'margin_agreement',
        signed_at: '',
        ip_address: '',
      },
      {
        agreement: 'account_agreement',
        signed_at: '',
        ip_address: '',
      },
      {
        agreement: 'customer_agreement',
        signed_at: '',
        ip_address: '',
      },
    ],
    documents: [],
    trusted_contact: {
      given_name: '',
      family_name: '',
      email_address: '',
    },
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const accountDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [category, field] = name.split('.');

    if (type === 'checkbox') {
      setFormData((prevData) => ({
        ...prevData,
        [category]: {
          ...prevData[category],
          [field]: checked,
        },
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [category]: {
          ...prevData[category],
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Send data to Alpaca API
      await axios.post('https://broker-api.sandbox.alpaca.markets/v1/accounts', formData);

      // Send data to Flask backend API
      await axios.post('/api/accounts', formData);

      // Reset form data and navigate to the next page
      setFormData({
        contact: {
          email_address: '',
          phone_number: '',
          street_address: [''],
          unit: '',
          city: '',
          state: '',
          postal_code: '',
        },
        identity: {
          given_name: '',
          middle_name: '',
          family_name: '',
          date_of_birth: '',
          tax_id: '',
          tax_id_type: 'USA_SSN',
          country_of_citizenship: '',
          country_of_birth: '',
          country_of_tax_residence: 'USA',
          funding_source: [''],
          annual_income_min: '',
          annual_income_max: '',
          liquid_net_worth_min: '',
          liquid_net_worth_max: '',
        },
        disclosures: {
          is_control_person: false,
          is_affiliated_exchange_or_finra: false,
          is_politically_exposed: false,
          immediate_family_exposed: false,
          employment_status: '',
          employer_name: '',
          employer_address: '',
          employment_position: '',
        },
        agreements: [
          {
            agreement: 'margin_agreement',
            signed_at: '',
            ip_address: '',
          },
          {
            agreement: 'account_agreement',
            signed_at: '',
            ip_address: '',
          },
          {
            agreement: 'customer_agreement',
            signed_at: '',
            ip_address: '',
          },
        ],
        documents: [],
        trusted_contact: {
          given_name: '',
          family_name: '',
          email_address: '',
        },
      });

      setCurrentPage(currentPage + 1);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const renderFormPage = () => {
    switch (currentPage) {
      case 1:
        return (
          <>
            <h2>Customer Profile</h2>
            {/* Render customer profile fields */}
            <div>
              <label htmlFor="identity.given_name">Legal First Name</label>
              <input
                type="text"
                id="identity.given_name"
                name="identity.given_name"
                value={formData.identity.given_name}
                onChange={handleChange}
                required
              />
            </div>
            {/* Render other customer profile fields */}
            <button type="button" onClick={() => setCurrentPage(2)}>
              Next
            </button>
          </>
        );
      case 2:
        return (
          <>
            <h2>Financial Profile</h2>
            {/* Render financial profile fields */}
            <div>
              <label htmlFor="identity.annual_income_min">Annual Household Income (Min)</label>
              <input
                type="number"
                id="identity.annual_income_min"
                name="identity.annual_income_min"
                value={formData.identity.annual_income_min}
                onChange={handleChange}
              />
            </div>
            {/* Render other financial profile fields */}
            <button type="button" onClick={() => setCurrentPage(1)}>
              Previous
            </button>
            <button type="button" onClick={() => setCurrentPage(3)}>
              Next
            </button>
          </>
        );
      case 3:
        return (
          <>
            <h2>Affiliations and Disclosures</h2>
            {/* Render affiliations and disclosures fields */}
            <div>
              <label htmlFor="disclosures.is_affiliated_exchange_or_finra">
                Are you or an immediate family member affiliated with or employed by a stock exchange, regulatory body, member firm of an exchange, FINRA or a municipal securities broker-dealer?
              </label>
              <input
                type="checkbox"
                id="disclosures.is_affiliated_exchange_or_finra"
                name="disclosures.is_affiliated_exchange_or_finra"
                checked={formData.disclosures.is_affiliated_exchange_or_finra}
                onChange={handleChange}
              />
            </div>
            {/* Render other affiliations and disclosures fields */}
            <button type="button" onClick={() => setCurrentPage(2)}>
              Previous
            </button>
            <button type="button" onClick={() => setCurrentPage(4)}>
              Next
            </button>
          </>
        );
      case 4:
        return (
          <>
            <h2>Agreements</h2>
            {/* Render agreement fields */}
            <div>
              <label htmlFor="agreements.0.agreement">Margin Agreement</label>
              <input
                type="checkbox"
                id="agreements.0.agreement"
                name="agreements.0.agreement"
                checked={formData.agreements[0].agreement === 'margin_agreement'}
                onChange={handleChange}
                required
              />
            </div>
            {/* Render other agreement fields */}
            <button type="button" onClick={() => setCurrentPage(3)}>
              Previous
            </button>
            <button type="submit">Submit</button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="account-form">
      <div className="account-form-content">
        <Header />

        <div className="account-form-container">
          <Navbar />

          <div className="account-form-main">
            <form onSubmit={handleSubmit}>
              {renderFormPage()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountForm;