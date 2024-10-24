import axios from 'axios';
import {
  SCHWAB_AUTH_REQUEST,
  SCHWAB_AUTH_SUCCESS,
  SCHWAB_AUTH_FAIL,
  SCHWAB_AUTH_COMPLETE_REQUEST,
  SCHWAB_AUTH_COMPLETE_SUCCESS,
  SCHWAB_AUTH_COMPLETE_FAIL,
  SCHWAB_AUTH_LOGOUT,
  SET_AUTH_STATUS
} from '../constants/authConstants';

const BASE_URL = 'http://localhost:5011';

// Initiate Schwab authentication
export const initiateSchwabAuth = () => async (dispatch) => {
  try {
    dispatch({ type: SCHWAB_AUTH_REQUEST });
    const { data } = await axios.get(
      `${BASE_URL}/initiate_auth`,
      { withCredentials: true }
    );
    dispatch({ type: SCHWAB_AUTH_SUCCESS, payload: data });
    // Store the state securely (e.g., in sessionStorage)
    sessionStorage.setItem('schwabAuthState', data.state);
    // Redirect to Schwab's authorization page
    window.location.href = data.auth_url;
  } catch (error) {
    dispatch({
      type: SCHWAB_AUTH_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const setAuthStatus = (isAuthenticated, accountInfo) => ({
  type: SET_AUTH_STATUS,
  payload: { isAuthenticated, accountInfo }
});

export const checkAuthStatus = (userId) => async (dispatch) => {
  try {
    const response = await axios.get(`${BASE_URL}/get_user_auth_status`, {
      params: { user_id: userId }
    });
    dispatch(setAuthStatus(response.data.is_authenticated, response.data.account_info));
    return response.data;
  } catch (error) {
    console.error('Error checking auth status:', error);
    return { is_authenticated: false, account_info: null };
  }
};

// Complete Schwab authentication
export const completeSchwabAuth = (code, state) => async (dispatch, getState) => {
  try {
    dispatch({ type: SCHWAB_AUTH_COMPLETE_REQUEST });
    const { userLogin: { userInfo } } = getState();
    
    // Verify the state matches what we stored earlier
    const storedState = sessionStorage.getItem('schwabAuthState');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }
    const { data } = await axios.post(
      `${BASE_URL}/callbacks`,
      { user_id: userInfo.userId, code, state }
    );
    dispatch({ type: SCHWAB_AUTH_COMPLETE_SUCCESS, payload: data });
    // Store the access token securely (e.g., in HttpOnly cookie)
    // For this example, we'll store it in localStorage (not recommended for production)
    localStorage.setItem('schwabAccessToken', data.access_token);
  } catch (error) {
    dispatch({
      type: SCHWAB_AUTH_COMPLETE_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

// Logout from Schwab
export const logoutSchwab = () => (dispatch) => {
  localStorage.removeItem('schwabAccessToken');
  sessionStorage.removeItem('schwabAuthState');
  dispatch({ type: SCHWAB_AUTH_LOGOUT });
};

// Refresh Schwab token (if needed)
export const refreshSchwabToken = () => async (dispatch, getState) => {
  try {
    const { userLogin: { userInfo } } = getState();
    const { data } = await axios.post(
      `${BASE_URL}/refresh_token`,
      { user_id: userInfo.userId }
    );
    localStorage.setItem('schwabAccessToken', data.access_token);
    return data.access_token;
  } catch (error) {
    console.error('Failed to refresh Schwab token:', error);
    dispatch(logoutSchwab());
    throw error;
  }
};

// Helper function to get Schwab token (with auto-refresh if needed)
export const getSchwabToken = () => async (dispatch, getState) => {
  let token = localStorage.getItem('schwabAccessToken');
  if (!token) {
    // If no token, try to refresh
    token = await dispatch(refreshSchwabToken());
  }
  return token;
};