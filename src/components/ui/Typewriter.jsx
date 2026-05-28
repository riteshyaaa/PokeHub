import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Typewriter - Displays text with a character-by-character typing animation
 * Feature 9: Pokédex Entry with Typewriter Effect
 */
const Typewriter = ({ text, speed = 30, className = '', onComplete, cursor = true }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (!text || currentIndex >= text.length) {
      if (text && currentIndex >= text.length) {
        setIsComplete(true);
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      setCurrentIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, onComplete]);

  const skipToEnd = () => {
    setDisplayedText(text);
    setCurrentIndex(text.length);
    setIsComplete(true);
    onComplete?.();
  };

  return (
    <div className={`relative ${className}`} onClick={skipToEnd}>
      <span>{displayedText}</span>
      {cursor && !isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block ml-0.5"
        >
          |
        </motion.span>
      )}
      {!isComplete && (
        <span className="text-xs text-white/30 block mt-1 italic">Click to skip</span>
      )}
    </div>
  );
};

export default Typewriter;
