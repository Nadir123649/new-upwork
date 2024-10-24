import {
  SEND_PROMPT_REQUEST,
  SEND_PROMPT_SUCCESS,
  SEND_PROMPT_FAILURE,
} from '../constants/chatConstants';
import axios from 'axios';

export const sendPrompt = (prompt, userId, isAuthenticated) => async (dispatch) => {
  try {
    dispatch({
      type: SEND_PROMPT_REQUEST,
      payload: {
        role: 'user',
        content: prompt,
      },
    });

    const { data } = await axios.post('http://localhost:5052/chat', { 
      message: prompt,
      user_id: userId,
      is_authenticated: isAuthenticated
    });

    dispatch({
      type: SEND_PROMPT_SUCCESS,
      payload: {
        role: 'assistant',
        content: data.response,
      },
    });
  } catch (error) {
    dispatch({
      type: SEND_PROMPT_FAILURE,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};