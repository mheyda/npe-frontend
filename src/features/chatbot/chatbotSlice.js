import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (userMessage, { dispatch, rejectWithValue }) => {
    try {
      // Immediately add user's message
      dispatch(addUserMessage(userMessage));
      dispatch(clearStreamedText());
      dispatch(setStatus('loading'));

      // --- Make request to production API ---
      const response = await AuthService.makeRequest({
        urlExtension: 'api/ask',
        method: 'POST',
        body: { question: userMessage, debug: 0 },
        stream: true,
      });

      // --- Handle streaming response ---
      if (response.streamed && response.data) {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          let chunk = decoder.decode(value, { stream: true });

          if (firstChunk) {
            chunk = chunk.trimStart();
            firstChunk = false;
          }

          fullText += chunk;
          dispatch(appendStreamedText(chunk));
        }

        dispatch(addBotMessage(fullText));
        dispatch(setStatus('succeeded'));
      } 
      // --- Handle normal JSON response (non-streaming fallback) ---
      else if (response.data && !response.streamed) {
        const botText = response.data.answer || response.data.response || 'Sorry, something went wrong.';
        dispatch(addBotMessage(botText));
        dispatch(setStatus('succeeded'));
      } 
      else if (response.error) {
        dispatch(setStatus('failed'));
        return rejectWithValue(response.error);
      }

      return userMessage;
    } catch (error) {
      console.error('[Chatbot Error]', error);
      dispatch(setStatus('failed'));
      return rejectWithValue(error.message);
    }
  }
);

export const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    messages: [], // Array of { type: 'user' | 'bot', text: string }
    streamedText: '',
    status: 'idle', // idle | loading | succeeded | failed
    error: null,
    scrollPosition: 0,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ type: 'user', text: action.payload });
    },
    addBotMessage: (state, action) => {
      state.messages.push({ type: 'bot', text: action.payload });
      state.streamedText = '';
    },
    appendStreamedText: (state, action) => {
      state.streamedText += action.payload;
    },
    clearStreamedText: (state) => {
      state.streamedText = '';
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setScrollPosition: (state, action) => {
      state.scrollPosition = action.payload;
    },
  },
});

export const {
  addUserMessage,
  addBotMessage,
  appendStreamedText,
  clearStreamedText,
  setStatus,
  setScrollPosition,
} = chatbotSlice.actions;

export const selectMessages = (state) => state.chatbot.messages;
export const selectStreamedText = (state) => state.chatbot.streamedText;
export const selectStatus = (state) => state.chatbot.status;
export const selectScrollPosition = (state) => state.chatbot.scrollPosition;

export default chatbotSlice.reducer;
