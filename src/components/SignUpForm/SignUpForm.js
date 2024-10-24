import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import { signUpSchema } from '../../schemas/userSchemas';
import { signup } from '../../store/actions/userActions';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import BtnLoader from '../../components/BtnLoader/BtnLoader';

const SignUpForm = ({ onSuccess, referralId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSignUp = async (values) => {
    setLoading(true);
    try {
      const data = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        subscriptionType: values.subscriptionType,
        personal: values.personal,
        professional: values.professional,
        referralId: referralId,
      };
      const userId = await dispatch(signup(data));
      
      setLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Signup Successful',
        text: 'Redirecting you to the Spiritual Direction page...',
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        onSuccess(userId);
      });
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: `${error}`,
      });
    }
  };

  const { handleChange, handleBlur, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      cPassword: "",
      personal: "",
      professional: "",
      subscriptionType: "standard",
    },
    onSubmit: handleSignUp,
    validationSchema: signUpSchema,
    validateOnChange: false,
    validateOnBlur: true,
  });

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="user-fullname">Full Name <span className="required-field">*</span></label>
        <div className={`input-container ${errors.email ? 'error' : ''}`}>
          <div className="icon-container">
            <FaUser />
          </div>
          <input
            type="text"
            name="fullName"
            id="user-fullname"
            placeholder="Enter your full name"
            value={values.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
        {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="user-email">Email <span className="required-field">*</span></label>
        <div className={`input-container ${errors.email ? 'error' : ''}`}>
          <div className="icon-container">
            <FaEnvelope className="icon" />
          </div>
          <input
            type="email"
            name="email"
            id="user-email"
            placeholder="Enter your email address"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-input"
          />
        </div>
        {errors.email && <span className="error-msg">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="user-phone">Phone <span className="required-field">*</span></label>
        <div className={`input-container ${errors.phone ? 'error' : ''}`}>
          <div className="icon-container">
            <FaPhone className="icon" />
          </div>
          <input
            type="tel"
            name="phone"
            id="user-phone"
            placeholder="Enter your phone number"
            value={values.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-input"
          />
        </div>
        {errors.phone && <span className="error-msg">{errors.phone}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="user-password">Password <span className="required-field">*</span></label>
        <div className={`input-container ${touched.password && errors.password ? 'error' : ''}`}>
          <div className="icon-container">
            {showPassword ? (
              <FaEyeSlash className="icon clickable" onClick={() => setShowPassword(!showPassword)} />
            ) : (
              <FaEye className="icon clickable" onClick={() => setShowPassword(!showPassword)} />
            )}
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            id="user-password"
            placeholder="Create a password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-input"
          />
        </div>
        {touched.password && errors.password && <span className="error-msg">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="cnfrm-pass">Confirm Password <span className="required-field">*</span></label>
        <div className={`input-container ${touched.cPassword && errors.cPassword ? 'error' : ''}`}>
          <div className="icon-container">
            {showConfirmPassword ? (
              <FaEyeSlash className="icon clickable" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
            ) : (
              <FaEye className="icon clickable" onClick={() => setShowConfirmPassword(!showConfirmPassword)} />
            )}
          </div>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="cPassword"
            id="cnfrm-pass"
            placeholder="Confirm your password"
            value={values.cPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className="form-input"
          />
        </div>
        {errors.cPassword && touched.cPassword && <span className="error-msg">{errors.cPassword}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="personal">Personal Background</label>
        <textarea
          name="personal"
          id="personal"
          placeholder="The AI will consider this information in its responses. Provide specifics if desiring more relevant reflections."
          value={values.personal}
          onChange={handleChange}
          onBlur={handleBlur}
          className="background-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="professional">Professional Background</label>
        <textarea
          name="professional"
          id="professional"
          placeholder="The AI will consider this information in its responses. Provide specifics if desiring more relevant reflections."
          value={values.professional}
          onChange={handleChange}
          onBlur={handleBlur}
          className="background-textarea"
        />
      </div>

      {referralId && (
        <input type="hidden" name="referralId" value={referralId} />
      )}

      <button type="submit" className="signup-submit-btn" disabled={loading}>
        {loading ? <BtnLoader /> : "Create Account"}
      </button>
    </form>
  );
};

export default SignUpForm;