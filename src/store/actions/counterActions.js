// counterActions.js
import axios from 'axios';

export const INCREMENT_COUNTER_REQUEST = 'INCREMENT_COUNTER_REQUEST';
export const INCREMENT_COUNTER_SUCCESS = 'INCREMENT_COUNTER_SUCCESS';
export const INCREMENT_COUNTER_FAILURE = 'INCREMENT_COUNTER_FAILURE';

export const incrementCounter = (userId) => async (dispatch) => {
  try {
    dispatch({ type: INCREMENT_COUNTER_REQUEST });

    await axios.post('http://localhost:5000/counter', { user_id: userId });

    dispatch({ type: INCREMENT_COUNTER_SUCCESS });
  } catch (error) {
    dispatch({ type: INCREMENT_COUNTER_FAILURE, payload: error.message });
  }
};