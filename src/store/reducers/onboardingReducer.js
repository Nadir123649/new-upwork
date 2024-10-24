// onboardingReducer.js
import {
  FETCH_ONBOARDING_STATUS_REQUEST,
  FETCH_ONBOARDING_STATUS_SUCCESS,
  FETCH_ONBOARDING_STATUS_FAIL,
  SET_ONBOARDING_STEP,
  SET_ONBOARDING_STATUS,
  COMPLETE_ONBOARDING,
  UPDATE_ONBOARDING_RESPONSE,
  UPDATE_ONBOARDING_STATUS,
  ONBOARDING_ERROR
} from '../constants/onboardingConstants';

const initialState = {
  loading: false,
  step: null,
  question: null,
  error: null,
  completed: false,
  responses: {}
};

export const onboardingReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ONBOARDING_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    case UPDATE_ONBOARDING_STATUS:
      return {
        ...state,
        step: action.payload,
        loading: false,
        error: null
      };
    case FETCH_ONBOARDING_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        step: action.payload.step,
        question: action.payload.question,
        completed: action.payload.completed,
        error: null
      };
    case FETCH_ONBOARDING_STATUS_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case SET_ONBOARDING_STEP:
      return {
        ...state,
        step: action.payload,
        error: null
      };
    case SET_ONBOARDING_STATUS:
      return {
        ...state,
        ...action.payload,
        loading: false,
        error: null
      };
    case COMPLETE_ONBOARDING:
      return {
        ...state,
        completed: true,
        loading: false,
        error: null
      };
    case UPDATE_ONBOARDING_RESPONSE:
      return {
        ...state,
        responses: {
          ...state.responses,
          [action.payload.step]: action.payload.response
        },
        step: action.payload.nextStep,
        question: action.payload.nextQuestion,
        loading: false,
        error: null
      };
    case ONBOARDING_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};