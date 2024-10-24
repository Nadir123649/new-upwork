import axios from 'axios';
import {
  FETCH_ONBOARDING_STATUS_REQUEST,
  FETCH_ONBOARDING_STATUS_SUCCESS,
  FETCH_ONBOARDING_STATUS_FAIL,
  SET_ONBOARDING_STEP,
  UPDATE_ONBOARDING_STATUS,
  SET_ONBOARDING_STATUS,
  COMPLETE_ONBOARDING,
  UPDATE_ONBOARDING_RESPONSE,
  ONBOARDING_ERROR
} from '../constants/onboardingConstants';

export const setOnboardingStatus = (status) => ({
  type: SET_ONBOARDING_STATUS,
  payload: status
});

export const fetchOnboardingStatus = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_ONBOARDING_STATUS_REQUEST });
    const { data } = await axios.get('http://localhost:5052/get_onboarding_status', {
      params: { user_id: userId }
    });
    dispatch({ 
      type: FETCH_ONBOARDING_STATUS_SUCCESS, 
      payload: { 
        step: data.current_step, 
        question: data.current_question,
        completed: data.completed
      }
    });
    return data;
  } catch (error) {
    dispatch({
      type: FETCH_ONBOARDING_STATUS_FAIL,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
  }
};

export const setOnboardingStep = (step) => ({
  type: SET_ONBOARDING_STEP,
  payload: step,
});

export const completeOnboarding = () => ({
  type: COMPLETE_ONBOARDING,
});

export const updateOnboardingResponse = (step, response, userId) => async (dispatch) => {
  try {
    const { data } = await axios.post('http://localhost:5052/chat', {
      message: response,
      user_id: userId,
      is_onboarding: true,
      onboarding_step: step
    });
    
    if (data.status === 'in_progress') {
      dispatch({
        type: UPDATE_ONBOARDING_RESPONSE,
        payload: { 
          step: data.onboarding_step, 
          response: data.response, 
          nextStep: data.onboarding_step, 
          nextQuestion: data.response.split('\n\n').pop()
        }
      });
    } else if (data.status === 'completed') {
      dispatch(completeOnboarding());
    } else if (data.status === 'invalid_input') {
      dispatch({
        type: ONBOARDING_ERROR,
        payload: data.response
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error updating onboarding response:', error);
    dispatch({
      type: ONBOARDING_ERROR,
      payload: error.response && error.response.data.message
        ? error.response.data.message
        : error.message,
    });
    throw error;
  }
};

export const retryOnboardingStep = (step, userId) => (dispatch) => {
  dispatch(setOnboardingStep(step));
  dispatch(fetchOnboardingStatus(userId));
};


export const updateOnboardingStatus = (step) => ({
  type: UPDATE_ONBOARDING_STATUS,
  payload: step
});