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
  UPDATE_LOCAL_CHAT_RESPONSE_COUNT,
} from "../constants/userConstants";

const initialState = {
  loading: false,
  isAuthorized: false,
  user: null,
  error: null,
  userId: null,
  tempUserId: null,
  email: null,
  isSchwabAuthenticated: false,
  isCheckingAuthStatus: false,
  onboardingStatus: null,
  subscription: null,
  updateSubscriptionLoading: false,
  updateSubscriptionError: null,
  referralId: null,
  chatResponseCount: 0,
  chatResponseLimit: null,
  isUnlimited: false,
  chatResponseCountLoading: false,
  chatResponseCountError: null,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case USER_REGISTER_REQUEST:
    case USER_LOGIN_REQUEST:
    case USER_DATA_REQUEST:
    case FETCH_USER_ID_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthorized: action.payload.userId < 4000,
        userId: action.payload.userId,
        tempUserId: null,
        email: action.payload.email,
        referralId: action.payload.referralId,
        error: null,
      };
    case USER_LOGIN_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthorized: action.payload.userId < 4000,
        userId: action.payload.userId,
        tempUserId: null,
        email: action.payload.email,
        error: null,
      };
    case USER_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        user: action.payload,
        error: null,
      };
    case FETCH_USER_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        userId: action.payload,
        isAuthorized: action.payload < 4000,
        tempUserId: null,
        error: null,
      };
    case USER_REGISTER_FAIL:
    case USER_LOGIN_FAIL:
    case USER_DATA_FAIL:
    case FETCH_USER_ID_FAIL:
      return {
        ...state,
        loading: false,
        isAuthorized: false,
        user: null,
        error: action.payload,
      };
    case USER_REGISTER_CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    case USER_LOGOUT:
      return {
        ...initialState,
      };
    case SET_TEMP_USER_ID:
      return {
        ...state,
        tempUserId: action.payload,
        userId: null,
        isAuthorized: false,
      };
    case SET_USER_ID:
      return {
        ...state,
        userId: action.payload,
        tempUserId: null,
        isAuthorized: action.payload < 4000,
      };
    case CLEAR_TEMP_USER_ID:
      return {
        ...state,
        tempUserId: null,
      };
    case SET_SCHWAB_AUTHENTICATION:
      return {
        ...state,
        isSchwabAuthenticated: action.payload,
      };
    case CHECK_SCHWAB_AUTH_STATUS:
      return {
        ...state,
        isCheckingAuthStatus: true,
      };
    case SET_ONBOARDING_STATUS:
      return {
        ...state,
        onboardingStatus: action.payload,
      };
    case UPDATE_USER_SUBSCRIPTION_REQUEST:
      return {
        ...state,
        updateSubscriptionLoading: true,
        updateSubscriptionError: null,
      };
    case UPDATE_USER_SUBSCRIPTION_SUCCESS:
      return {
        ...state,
        updateSubscriptionLoading: false,
        subscription: action.payload,
      };
    case UPDATE_USER_SUBSCRIPTION_FAIL:
      return {
        ...state,
        updateSubscriptionLoading: false,
        updateSubscriptionError: action.payload,
      };
    case FETCH_CHAT_RESPONSE_COUNT_REQUEST:
      return {
        ...state,
        chatResponseCountLoading: true,
      };
    case FETCH_CHAT_RESPONSE_COUNT_SUCCESS:
      return {
        ...state,
        chatResponseCount: action.payload.count,
        chatResponseLimit: action.payload.limit,
        isUnlimited: action.payload.isUnlimited,
      };
    case UPDATE_LOCAL_CHAT_RESPONSE_COUNT:
      return {
        ...state,
        chatResponseCount: action.payload,
      };
    case FETCH_CHAT_RESPONSE_COUNT_FAIL:
      return {
        ...state,
        chatResponseCountLoading: false,
        chatResponseCountError: action.payload,
      };
    default:
      return state;
  }
};