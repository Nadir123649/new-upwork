import {
  SCHWAB_AUTH_REQUEST,
  SCHWAB_AUTH_SUCCESS,
  SCHWAB_AUTH_FAIL,
  SCHWAB_AUTH_COMPLETE_REQUEST,
  SCHWAB_AUTH_COMPLETE_SUCCESS,
  SCHWAB_AUTH_COMPLETE_FAIL,
  SET_AUTH_STATUS,
} from '../constants/authConstants';

const initialState = {
  loading: false,
  isAuthenticated: false,
  schwabAuthorized: false,
  accountInfo: null,
  error: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SCHWAB_AUTH_REQUEST:
    case SCHWAB_AUTH_COMPLETE_REQUEST:
      return { ...state, loading: true };
    case SCHWAB_AUTH_SUCCESS:
      return { ...state, loading: false };
    case SCHWAB_AUTH_COMPLETE_SUCCESS:
      return { ...state, loading: false, schwabAuthorized: true };
    case SCHWAB_AUTH_FAIL:
    case SCHWAB_AUTH_COMPLETE_FAIL:
      return { ...state, loading: false, error: action.payload };
    case SET_AUTH_STATUS:
      return {
        ...state,
        isAuthenticated: action.payload.isAuthenticated,
        accountInfo: action.payload.accountInfo,
      };
    default:
      return state;
  }
};