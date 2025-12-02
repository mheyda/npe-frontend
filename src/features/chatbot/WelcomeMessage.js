import React, { useState, useEffect } from 'react';
import './WelcomeMessage.css';

const suggestions = [
  'campgrounds',
  'hiking trails',
  'park weather',
  'activities',
  'park hours',
  'entrance fees',
  'safety tips'
];

const WelcomeMessage = () => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const maxLength = Math.max(...suggestions.map(s => s.length));

  useEffect(() => {
    const fullText = suggestions[currentIndex];
    let timeout;

    if (isDeleting) {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length - 1));
      }, 50);
    } else {
      timeout = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
      }, 100);
    }

    if (!isDeleting && displayedText === fullText) {
      timeout = setTimeout(() => setIsDeleting(true), 1000); // Pause before deleting
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setCurrentIndex((prev) => (prev + 1) % suggestions.length); // Next suggestion
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentIndex]);

  return (
    <div className='welcome-container'>
      <div className='welcome-text'>
        <h1>
          Welcome to Guide<sup> AI</sup>
        </h1>
        <p className='welcome-description'>
          Your personal guide to America's national parks.
        </p>
        <p className='dynamic-text'> Try asking me about{' '}
          <span 
            className="typewriter" 
            style={{ minWidth: `${maxLength}ch` }}
          >
            {displayedText}<span className='cursor'>&nbsp;</span>
          </span>
        </p>
      </div>
    </div>
  );
};

export default WelcomeMessage;
