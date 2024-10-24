// counterReducer.js
import {
  INCREMENT_COUNTER_REQUEST,
  INCREMENT_COUNTER_SUCCESS,
  INCREMENT_COUNTER_FAILURE,
} from '../actions/counterActions';

const initialState = {
  loading: false,
  error: null,
};

export const counterReducer = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_COUNTER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case INCREMENT_COUNTER_SUCCESS:
      return {
        ...state,
        loading: false,
      };
    case INCREMENT_COUNTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
};