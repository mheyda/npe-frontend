import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  sendMessage,
  selectMessages,
  selectStreamedText,
  selectStatus,
} from './chatbotSlice';
import './Chatbot.css';
import WelcomeMessage from './WelcomeMessage';
import { setScrollPosition, selectScrollPosition } from './chatbotSlice';
import EllipsisLoader from './EllipsisLoader';

const MAX_CHARS = 1000;
const MAX_TEXTAREA_HEIGHT = 300; // pixels
const BOTTOM_BUFFER_HEIGHT = 150;

const Chatbot = () => {
  const dispatch = useDispatch();
  const messages = useSelector(selectMessages);
  const streamedText = useSelector(selectStreamedText);
  // const streamedText = "some streaming text";
  const status = useSelector(selectStatus);
  // const status = "failed";
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [newMessageSent, setNewMessageSent] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true); // Track if the user is near the bottom
  const scrollPosition = useSelector(selectScrollPosition);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (status === 'loading' || status === 'starting' || status === 'generating') return;

    dispatch(sendMessage(input.trim()));
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset textarea height
      textareaRef.current.style.overflowY = 'hidden'; // Hide overflow
    }

    setNewMessageSent(true); // Flag that a new message was sent
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (status === 'loading' || status === 'starting') return;
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    let text = e.target.value;

    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
    }

    setInput(text);
    autoResizeTextarea();
  };

  const autoResizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;

    const { selectionEnd } = el;

    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT);
    el.style.height = `${newHeight}px`;

    if (el.scrollHeight > MAX_TEXTAREA_HEIGHT) {
      el.style.overflowY = 'auto';

      if (selectionEnd === input.length) {
        const style = window.getComputedStyle(el);
        const paddingBottom = parseInt(style.paddingBottom, 10);
        el.scrollTop = el.scrollHeight - el.clientHeight + paddingBottom;
      }
    } else {
      el.style.overflowY = 'hidden';
    }
  };

  const checkIfNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < BOTTOM_BUFFER_HEIGHT;
    setIsNearBottom(isNear);
  };

  // Check if the user is near the bottom when the messages or scroll position change
  useEffect(() => {
    checkIfNearBottom(); // Check when new messages are added
  }, [messages]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Add event listener for scroll changes
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (!container) return;

      checkIfNearBottom();

      dispatch(setScrollPosition(container.scrollTop));
    };

    // Add event listener for when the height of the container changes
    const resizeObserver = new ResizeObserver(() => {
      checkIfNearBottom();
    });

    resizeObserver.observe(container);

    container.addEventListener('scroll', handleScroll);

    // Clean up listeners on component unmount
    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // Restore previous scroll position
    container.scrollTop = scrollPosition;
  }, []);

  // Show or hide the scroll-to-bottom button
  useEffect(() => {
    if (isNearBottom) {
      setIsButtonVisible(false); // Hide the button if the user is already at the bottom
    } else {
      setIsButtonVisible(true); // Show the button if the user is not at the bottom
    }
  }, [isNearBottom]);

  // Scroll to bottom when a new message is sent (only once)
  useEffect(() => {
    if (newMessageSent) {
      // Only scroll if the button isn't showing
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      setNewMessageSent(false); // Reset the flag after scrolling once
    }
  }, [messages, newMessageSent]);

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages-container" ref={messagesContainerRef}>
        {messages.length === 0 && 
          <WelcomeMessage />
        }
        {messages.length > 0 &&
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chatbot-message ${msg.type === 'user' ? 'user-message' : 'bot-message'}`}
              >
                {msg.text}
              </div>
            ))}

            {/* Bot is typing but hasn't started streaming yet */}
            {(status === 'loading' || status === 'generating') && !streamedText && (
              <div className="chatbot-message bot-message loading-bubble">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            {/* Streaming response in progress */}
            {status === 'generating' && streamedText && (
              <div className="chatbot-message bot-message">
                {streamedText}
                <span className="blinking-cursor">|</span>
              </div>
            )}
            
            {/* Bot is typing but hasn't started streaming yet */}
            {status === 'starting' && !streamedText && (
              <div className="chatbot-message bot-message starting-message">
                <i className="fa-solid fa-circle status-icon"></i>
                <div>Starting chat server — this may take a minute<EllipsisLoader /></div>
              </div>
            )}

            <button
              className={`scroll-to-bottom-button ${isButtonVisible ? 'show' : ''}`}
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setIsButtonVisible(false);
              }}
            >
              <i className="fa-solid fa-arrow-down"></i>
            </button>
            <div className="chatbot-messages-end" />
            <div ref={messagesEndRef} />
          </div>
        }
      </div>

      <form className="chatbot-input-container" onSubmit={handleSubmit}>
        <div className="chatbot-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chatbot-textarea"
            placeholder="Ask a question..."
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            wrap="soft"
          />
          <button 
            type="submit" 
            className="chatbot-send-button" 
            disabled={status === 'loading' || status === 'starting' || status === 'generating'}
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;
