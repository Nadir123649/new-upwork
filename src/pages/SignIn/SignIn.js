import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { logInSchema } from "../../schemas/userSchemas";
import { signIn, clearSignUpErrors } from "../../store/actions/userActions";
import Swal from "sweetalert2";
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import "./SignIn.css";
import BtnLoader from "../../components/BtnLoader/BtnLoader";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, error, loading, userId } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogIn = async (values) => {
    try {
      const data = {
        email: values.email,
        password: values.password,
      };
      await dispatch(signIn(data));
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error}`,
      });
    }
  };

  const { handleChange, handleBlur, values, handleSubmit, touched, errors } = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: handleLogIn,
    validationSchema: logInSchema,
    validateOnChange: false,
    validateOnBlur: true,
  });

  useEffect(() => {
    if (isAuthenticated && userId) {
      navigate("/chat", { state: { newUser: false, userId: userId } });
    }
  }, [isAuthenticated, userId, navigate]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error}`,
      });
      dispatch(clearSignUpErrors());
    }
  }, [dispatch, error]);

  return (
    <div className="signin-container">
      <Header />
      <div className="signin-content">
        <Navbar />
        <div className="signin-main">
          <div className="signin-card">
            <h1 className="signin-title">Sign In to Your Account</h1>
            <form className="signin-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="user-email">
                  Email <span className="required-field">*</span>
                </label>
                <div className={`input-container ${errors.email ? 'error' : ''}`}>
                  <div className="icon-container">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="user-email"
                    placeholder="Enter your email address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="user-password">
                  Password <span className="required-field">*</span>
                </label>
                <div className={`input-container ${touched.password && errors.password ? 'error' : ''}`}>
                  <div className="icon-container">
                    {showPassword ? (
                      <FaEyeSlash className="clickable" onClick={() => setShowPassword(!showPassword)} />
                    ) : (
                      <FaEye className="clickable" onClick={() => setShowPassword(!showPassword)} />
                    )}
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="user-password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {touched.password && errors.password && <span className="error-msg">{errors.password}</span>}
              </div>

              <button type="submit" className="signin-submit-btn" disabled={loading}>
                {loading ? <BtnLoader /> : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;