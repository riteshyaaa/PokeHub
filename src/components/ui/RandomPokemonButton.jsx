import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getRandomPokemonId } from '../../utils/pokemonApi';

/**
 * RandomPokemonButton - "I'm Feeling Lucky" with Pokeball animation
 * Feature 15: Random Pokemon Button
 */
const RandomPokemonButton = ({ className = '' }) => {
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (animating) return;
    setAnimating(true);

    // Pokeball throw animation then navigate
    setTimeout(() => {
      const randomId = getRandomPokemonId();
      navigate(`/pokemon/${randomId}`);
      setAnimating(false);
    }, 800);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`relative group ${className}`}
      disabled={animating}
      title="Random Pokémon"
    >
      <AnimatePresence>
        {animating && (
          <motion.div
            initial={{ scale: 1, y: 0, rotate: 0 }}
            animate={{
              scale: [1, 1.3, 0.8, 1],
              y: [0, -20, 0],
              rotate: [0, 360, 720],
            }}
            exit={{ scale: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-2xl">⚡</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={animating ? { rotate: [0, 15, -15, 10, -10, 0], scale: [1, 1.1, 0.9, 1] } : {}}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-white/30"
      >
        {/* Pokeball design */}
        <div className="relative w-8 h-8">
          {/* Top half (red) */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-red-600 rounded-t-full border-b border-white/50" />
          {/* Bottom half (white) */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-b-full" />
          {/* Center line */}
          <div className="absolute top-[14px] left-0 right-0 h-[4px] bg-gray-800" />
          {/* Center button */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800" />
        </div>
      </motion.div>

      {/* Tooltip */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Random Pokémon
      </span>
    </motion.button>
  );
};

export default RandomPokemonButton;
