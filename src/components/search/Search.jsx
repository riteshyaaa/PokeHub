import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const Search = ({ updateSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const timerRef = useRef(null);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setInputValue(value);

    // Proper debounce with useRef
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      updateSearch(value);
    }, 600);
  }, [updateSearch]);

  const handleClear = () => {
    setInputValue('');
    updateSearch('');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl px-4 mt-6"
    >
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={inputValue}
          placeholder="Search Pokémon by name or ID..."
          className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 shadow-sm hover:shadow-md transition-all"
          onChange={handleChange}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Search;
