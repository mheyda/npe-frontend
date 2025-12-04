import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AuthService } from '../../services/AuthService';

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (userMessage, { dispatch, rejectWithValue }) => {
    // Status tests
    if (userMessage === "__force_failed") {
      dispatch(addUserMessage("(TEST) forcing failed"));
      dispatch(setStatus("failed"));
      dispatch(addBotMessage("Something went wrong. Please try resending your message."));
      return rejectWithValue("forced_failed");
    }

    if (userMessage === "__force_limit") {
      dispatch(addUserMessage("(TEST) forcing limit reached"));
      dispatch(setStatus("limit_reached"));
      dispatch(addBotMessage("You've reached our monthly usage limit. Please try again next month."));
      return rejectWithValue("forced_limit");
    }

    if (userMessage === "__force_starting") {
      dispatch(addUserMessage("(TEST) forcing starting"));
      dispatch(setStatus("starting"));
      return userMessage;
    }

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

        let firstChunk = true;
        let buffer = "";
        let finalBotText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Split into complete lines
          let lines = buffer.split("\n");
          buffer = lines.pop(); // keep incomplete line

          for (const line of lines) {
            if (!line.trim()) continue;

            let eventObj;
            try {
              eventObj = JSON.parse(line);
            } catch (err) {
              console.error("Failed to parse line:", line, err);
              continue;
            }

            // Handle events from backend
            switch (eventObj.event) {
              case "starting":
                dispatch(setStatus("starting"));
                break;

              case "ready":
                dispatch(setStatus("generating"));
                break;

              case "token":
                let textToAppend = eventObj.text;

                if (firstChunk) {
                  // Trim only leading whitespace for the first chunk
                  textToAppend = textToAppend.trimStart();
                  firstChunk = false;
                }

                // Append to streaming state
                dispatch(appendStreamedText(textToAppend));

                // Always accumulate full text for final message
                finalBotText += textToAppend;
                break;

              case "error":
                if (eventObj.type === "usage_limit") {
                  dispatch(setStatus("limit_reached"));
                  dispatch(addBotMessage("You've reached our monthly usage limit. Please try again next month."));
                } else {
                  dispatch(setStatus("failed"));
                  dispatch(addBotMessage("Something went wrong. Please try resending your message."));
                }
                return rejectWithValue(eventObj.type || "error");

              case "done":
                dispatch(addBotMessage(finalBotText));
                dispatch(setStatus("succeeded"));
                break;

              default:
                console.warn("Unknown event:", eventObj);
            }
          }
        }
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
