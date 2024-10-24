import { SEND_PROMPT_REQUEST, SEND_PROMPT_SUCCESS, SEND_PROMPT_FAILURE } from '../constants/chatConstants';

const initialState = {
  messages: [],
  loading: false,
  error: null,
  conversationId: null,
};

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case SEND_PROMPT_REQUEST:
      return { ...state, loading: true };
    case SEND_PROMPT_SUCCESS:
      return {
        ...state,
        loading: false,
        messages: [...state.messages, { role: 'assistant', content: action.payload.response }],
        conversationId: action.payload.conversation_id,
      };
    case SEND_PROMPT_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};