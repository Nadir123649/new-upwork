import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { signUpSchema } from "../../schemas/userSchemas";
import { signup, clearSignUpErrors } from "../../store/actions/userActions";
import Swal from "sweetalert2";
import "./SignUp.css";
import Sms from "./images/sms.png";
import Eye from "./images/eye.png";
import BtnLoader from "../../components/BtnLoader/BtnLoader";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, error, userId } = useSelector(
    (state) => state.user
  );

  const handleSignUp = async () => {
    try {
      const data = {
        email: values.email,
        password: values.password,
      };
      const userId = await dispatch(signup(data));
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        html: `
          <p>You have successfully registered!</p>
          <p><strong>Set up your payment method then proceed to unlimited access.<strong> </p>
          <a href="https://buy.stripe.com/3cs3fa7uD4SS7wQ3cc" target="_blank" rel="noopener noreferrer" class="stripe-link">Stripe Payment Setup</a>
        `,
        confirmButtonText: 'Proceed Here After Setup',
      }).then(() => {
        navigate("/chat", { state: { newUser: true, userId: userId } });
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `${error}`,
      });
    }
  };

  const handleContinueAsGuest = async () => {
    const currentDateTime = new Date().toISOString().replace(/[^0-9]/g, "");
    const guestEmail = `guest_${currentDateTime}@guest.com`;
    const guestPassword = "aaaaa";

    await dispatch(signup({ email: guestEmail, password: guestPassword }));
  };

  const { handleChange, handleBlur, values, handleSubmit, touched, errors } =
    useFormik({
      initialValues: {
        email: "",
        password: "",
        cPassword: "",
      },
      onSubmit: handleSignUp,
      validationSchema: signUpSchema,
      validateOnChange: false,
      validateOnBlur: true,
    });

  useEffect(() => {
    if (isAuthenticated && userId) {
      navigate("/chat");
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
    <div className="signup-container">
      <Header />
      <div className="signup-content">
        <Navbar />
        <div className="signup-main">
          <div className="signup-scroll-container">
            <h1 className="signup-title"></h1>
            <div className="plan-info">
              <h2>Sign Up For A Premium Plan</h2>
              <p>Enjoy unlimited Catholic AI-Efficiency queries and connect your Schwab brokerage account to invest realtime for just $30/month!</p>
              <p>
                By registering you confirm that you have read and agree to our{' '}
                <a 
                  href="https://docs.google.com/document/d/1lbq3nwlzCUtoYLNQM94qaiYvVOD1EXS_mNYbp3LQN0o/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  terms and conditions
                </a>
                .
              </p>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="label-input">
                <label htmlFor="user-email">
                  Email <span className="required-field">*</span>
                </label>
                <div className={`icon-input ${errors.email ? 'error-border' : 'simple-border'} `}>
                  <img src={Sms} alt="envelope" />
                  <input
                    type="email"
                    name="email"
                    id="user-email"
                    placeholder="Enter Your Email Address"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.email ? <span className="error-msg">{errors.email}</span> : <span className="error-msg"></span>}
              </div>
              <div className="label-input">
                <label htmlFor="user-password">
                  Password <span className="required-field">*</span>
                </label>
                <div className={`icon-input ${touched.cPassword && errors.cPassword ? 'error-border' : 'simple-border'} `} onClick={() => setShowPassword(!showPassword)}>
                  <img src={Eye} alt="Eye" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="user-password"
                    placeholder="Enter Your Password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {touched.password && errors.password && <span className="error-msg">{errors.password}</span>}
              </div>
              <div className="label-input">
                <label htmlFor="cnfrm-pass">
                  Confirm Password <span className="required-field">*</span>
                </label>
                <div className={`icon-input ${touched.cPassword && errors.cPassword ? 'error-border' : 'simple-border'} `} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <img src={Eye} alt="Eye" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="cPassword"
                    id="cnfrm-pass"
                    placeholder="Re-enter your password"
                    value={values.cPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {errors.cPassword && touched.cPassword && <span className="error-msg">{errors.cPassword}</span>}
              </div>
              <button type="submit" className="signup-submit-btn">
                {loading ? <BtnLoader /> : "Sign Up"}
              </button>
              <div className="continue-as-guest" onClick={handleContinueAsGuest}>

              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;