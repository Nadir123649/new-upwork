import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import {
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_REGISTER_CLEAR_ERRORS,
  USER_DATA_REQUEST,
  USER_DATA_SUCCESS,
  USER_DATA_FAIL,
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  SET_TEMP_USER_ID,
  SET_USER_ID,
  FETCH_USER_ID_REQUEST,
  FETCH_USER_ID_SUCCESS,
  FETCH_USER_ID_FAIL,
  SET_SCHWAB_AUTHENTICATION,
  CHECK_SCHWAB_AUTH_STATUS,
  CLEAR_TEMP_USER_ID,
  SET_ONBOARDING_STATUS,
  UPDATE_USER_SUBSCRIPTION_REQUEST,
  UPDATE_USER_SUBSCRIPTION_SUCCESS,
  UPDATE_USER_SUBSCRIPTION_FAIL,
  FETCH_CHAT_RESPONSE_COUNT_REQUEST,
  FETCH_CHAT_RESPONSE_COUNT_SUCCESS,
  FETCH_CHAT_RESPONSE_COUNT_FAIL,
  UPDATE_LOCAL_CHAT_RESPONSE_COUNT

} from "../constants/userConstants";

export const loadUserData = (email) => async (dispatch) => {
  try {
    dispatch({ type: USER_DATA_REQUEST });
    const { data } = await axios.post(API_ENDPOINTS.USER_INFORMATION, { email });
    dispatch({ type: USER_DATA_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: USER_DATA_FAIL, payload: error.response?.data?.error || error.message });
  }
};




export const signIn = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    const response = await axios.post(API_ENDPOINTS.LOGIN, userData);
    dispatch({ 
      type: USER_LOGIN_SUCCESS, 
      payload: { 
        email: userData.email, 
        userId: response.data.user_id
      } 
    });
    dispatch(fetchUserId(userData.email));
  } catch (error) {
    dispatch({ type: USER_LOGIN_FAIL, payload: error.response?.data?.error || error.message });
  }
};


export const clearSignUpErrors = () => (dispatch) => {
  dispatch({ type: USER_REGISTER_CLEAR_ERRORS });
};

export const fetchUserId = (email) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_USER_ID_REQUEST });
    const { data } = await axios.post(API_ENDPOINTS.GET_USER_ID, { email });
    dispatch({ type: FETCH_USER_ID_SUCCESS, payload: data.user_id });
  } catch (error) {
    dispatch({ type: FETCH_USER_ID_FAIL, payload: error.response?.data?.error || error.message });
  }
};

// userActions.js
export const signup = (userData) => async (dispatch) => {
  console.log("Starting signup process", userData);
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    console.log("Sending registration request to server");
    const response = await axios.post(API_ENDPOINTS.SIGNUP, {
      fullName: userData.fullName, // Add this line
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      subscriptionType: userData.subscriptionType,
      personal: userData.personal,
      professional: userData.professional,
      referralId: userData.referralId,
    });
    console.log("Registration response received:", response.data);
    dispatch({ 
      type: USER_REGISTER_SUCCESS, 
      payload: { 
        fullName: userData.fullName, // Add this line
        email: userData.email,
        phone: userData.phone,
        userId: response.data.user_id
      } 
    });
    console.log("USER_REGISTER_SUCCESS dispatched");
    return response.data.user_id;
  } catch (error) {
    console.error("Error during signup:", error);
    console.error("Error response:", error.response?.data);
    dispatch({ type: USER_REGISTER_FAIL, payload: error.response?.data?.error || error.message });
    throw error;
  }
};

export const logout = () => (dispatch) => {
  dispatch({ type: USER_LOGOUT });
  dispatch({ type: CLEAR_TEMP_USER_ID });
};

export const initializeUserId = () => (dispatch, getState) => {
  const { user } = getState();
  if (!user.userId && !user.tempUserId) {
    dispatch(setTempUserId());
  }
};

export const setUserId = (userId) => ({
  type: SET_USER_ID,
  payload: userId,
});

export const setTempUserId = () => (dispatch) => {
  const tempUserId = Math.floor(Math.random() * (6000 - 4000 + 1) + 4000);
  dispatch({ type: SET_TEMP_USER_ID, payload: tempUserId });
};

export const checkSchwabAuthStatus = (userId) => async (dispatch) => {
  dispatch({ type: CHECK_SCHWAB_AUTH_STATUS });
  try {
    const response = await axios.get(API_ENDPOINTS.GET_USER_AUTH_STATUS, {
      params: { user_id: userId }
    });
    dispatch(setSchwabAuthentication(response.data.is_authenticated));
  } catch (error) {
    console.error('Error checking Schwab auth status:', error);
    dispatch(setSchwabAuthentication(false));
  }
};

export const setSchwabAuthentication = (isAuthenticated) => ({
  type: SET_SCHWAB_AUTHENTICATION,
  payload: isAuthenticated,
});

export const checkAndSetUserId = () => (dispatch, getState) => {
  const { user } = getState();
  if (!user.userId) {
    dispatch(setTempUserId());
  }
};

export const setOnboardingStatus = (status) => ({
  type: SET_ONBOARDING_STATUS,
  payload: status,
});


export const updateUserSubscription = (userId, subscriptionType) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_SUBSCRIPTION_REQUEST });

    const response = await axios.post(API_ENDPOINTS.UPDATE_SUBSCRIPTION, {
      userId,
      subscriptionType
    });

    dispatch({
      type: UPDATE_USER_SUBSCRIPTION_SUCCESS,
      payload: response.data.subscription
    });
  } catch (error) {
    dispatch({
      type: UPDATE_USER_SUBSCRIPTION_FAIL,
      payload: error.response?.data?.error || error.message
    });
  }
};

export const fetchChatResponseCount = (userId) => async (dispatch) => {
  console.log('Fetching chat response count for userId:', userId);
  try {
    dispatch({ type: FETCH_CHAT_RESPONSE_COUNT_REQUEST });
    const response = await axios.get(`${API_ENDPOINTS.CHAT_RESPONSE_COUNT}/${userId}`);
    console.log('Chat response count API response:', response.data);
    dispatch({
      type: FETCH_CHAT_RESPONSE_COUNT_SUCCESS,
      payload: {
        count: response.data.count,
        limit: response.data.limit,
        isUnlimited: response.data.isUnlimited
      }
    });
    console.log('Updated chat response count in Redux:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('Error fetching chat response count:', error);
    dispatch({
      type: FETCH_CHAT_RESPONSE_COUNT_FAIL,
      payload: error.response?.data?.error || error.message
    });
  }
};


export const updateLocalChatResponseCount = (count) => ({
  type: UPDATE_LOCAL_CHAT_RESPONSE_COUNT,
  payload: count,
});
