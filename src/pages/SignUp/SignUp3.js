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
  const [subscriptionType, setSubscriptionType] = useState("research");


  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, isAuthenticated, error, userId } = useSelector(
    (state) => state.user
  );
  const handleSignUp = async (values) => {
    try {
      const data = {
        email: values.email,
        password: values.password,
        subscriptionType: subscriptionType,
        watchlistCompanies: subscriptionType === "research" ? values.watchlistCompanies : null,
        watchlistSector: subscriptionType === "research" ? values.watchlistSector : null,
      };
      const userId = await dispatch(signup(data));
      const stripeLink = subscriptionType === "research" 
        ? "https://buy.stripe.com/7sI8zu7uD4SSbN65kl" 
        : "https://buy.stripe.com/3cs3fa7uD4SS7wQ3cc";
      
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        html: `
          <p>You have successfully registered!</p>
          <p><strong>Set up your payment method then proceed to unlimited access.</strong></p>
          <a href="${stripeLink}" target="_blank" rel="noopener noreferrer" class="stripe-link">Stripe Payment Setup</a>
        `,
        confirmButtonText: 'Proceed Here After Setup',
      }).then(() => {
        if (subscriptionType === "realtime-trading") {
          navigate("/invest", { state: { newUser: true, userId: userId } });
        } else {
          navigate("/chat", { state: { newUser: true, userId: userId } });
        }
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
        watchlistCompanies: "",
        watchlistSector: "",
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
              <h2>Choose Your Subscription Plan</h2>
              <div>
                <label>
                  <input
                    type="radio"
                    name="subscriptionType"
                    value="research"
                    checked={subscriptionType === "research"}
                    onChange={() => setSubscriptionType("research")}
                  />
                  Research Setting ($20/month)
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    name="subscriptionType"
                    value="realtime-trading"
                    checked={subscriptionType === "realtime-trading"}
                    onChange={() => setSubscriptionType("realtime-trading")}
                  />
                  Realtime Investing ($40/month)
                </label>
              </div>
              <p>
                {subscriptionType === "realtime-trading" 
                  ? "Enjoy unlimited Catholic AI-Efficiency queries and connect your Schwab brokerage account to invest realtime for just $40/month!" 
                  : "Get access to our research tools and watchlist features for just $20/month!"}
              </p>
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
              {subscriptionType === "research" && (
                <>
                  <div className="label-input">
                    <label htmlFor="watchlist-companies">
                      Add 3 companies to your watchlist (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="watchlistCompanies"
                      id="watchlist-companies"
                      placeholder="e.g., Intuit, Tesla, Goldman Sachs"
                      value={values.watchlistCompanies}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="watchlist-input"
                    />
                  </div>
                  <div className="label-input">
                    <label htmlFor="watchlist-sector">
                      Add 1 sector for your watchlist
                    </label>
                    <input
                      type="text"
                      name="watchlistSector"
                      id="watchlist-sector"
                      placeholder="e.g., Technology"
                      value={values.watchlistSector}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="watchlist-input"
                    />
                  </div>
                </>
              )}
              <button type="submit" className="signup-submit-btn">
                {loading ? <BtnLoader /> : "Sign Up"}
              </button>
              <div className="continue-as-guest" onClick={handleContinueAsGuest}>
                {/* Content for guest option if needed */}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;