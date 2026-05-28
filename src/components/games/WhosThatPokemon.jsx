import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemon, getRandomPokemonId, parsePokemonData } from '../../utils/pokemonApi';
import { getGameScores, saveGameScores } from '../../utils/localStorage';

const GAME_STATES = {
  LOADING: 'loading',
  PLAYING: 'playing',
  REVEALED: 'revealed',
  GAME_OVER: 'game_over',
};

const TIMER_DURATION = 15; // seconds per round

const WhosThatPokemon = () => {
  const [gameState, setGameState] = useState(GAME_STATES.LOADING);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [options, setOptions] = useState([]);
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [highScores, setHighScores] = useState(getGameScores());
  const [mode, setMode] = useState('multiple'); // 'multiple' or 'type'

  const loadNewRound = useCallback(async () => {
    setGameState(GAME_STATES.LOADING);
    setGuess('');
    setIsCorrect(false);
    setTimeLeft(TIMER_DURATION);

    try {
      // Get the target Pokemon
      const targetId = getRandomPokemonId();
      const targetData = await fetchPokemon(targetId);
      const target = parsePokemonData(targetData);

      // Get 3 wrong options
      const wrongOptions = [];
      const usedIds = new Set([targetId]);
      while (wrongOptions.length < 3) {
        const id = getRandomPokemonId();
        if (!usedIds.has(id)) {
          usedIds.add(id);
          try {
            const data = await fetchPokemon(id);
            wrongOptions.push(parsePokemonData(data));
          } catch {
            // skip failed fetches
          }
        }
      }

      // Shuffle options
      const allOptions = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
      setCurrentPokemon(target);
      setOptions(allOptions);
      setGameState(GAME_STATES.PLAYING);
    } catch (error) {
      console.error('Failed to load round:', error);
      // Retry
      setTimeout(loadNewRound, 1000);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, round]);

  const handleTimeUp = () => {
    setIsCorrect(false);
    setStreak(0);
    setGameState(GAME_STATES.REVEALED);
  };

  const handleGuess = (selectedName) => {
    if (gameState !== GAME_STATES.PLAYING) return;

    const correct = selectedName === currentPokemon.name;
    setGuess(selectedName);
    setIsCorrect(correct);

    if (correct) {
      const timeBonus = Math.ceil(timeLeft * 10);
      const streakBonus = streak * 5;
      setScore((prev) => prev + 100 + timeBonus + streakBonus);
      setStreak((prev) => prev + 1);
    } else {
      setStreak(0);
    }

    setGameState(GAME_STATES.REVEALED);
  };

  const handleNextRound = () => {
    setRound((prev) => prev + 1);
    loadNewRound();
  };

  const handleEndGame = () => {
    const scores = getGameScores();
    const updated = {
      bestStreak: Math.max(scores.bestStreak, streak),
      totalGames: scores.totalGames + 1,
      totalCorrect: scores.totalCorrect + (isCorrect ? 1 : 0),
      highScore: Math.max(scores.highScore || 0, score),
    };
    saveGameScores(updated);
    setHighScores(updated);
    setGameState(GAME_STATES.GAME_OVER);
  };

  const handleRestart = () => {
    setScore(0);
    setStreak(0);
    setRound(1);
    loadNewRound();
  };

  const handleShare = () => {
    const text = `🎮 Who's That Pokémon?\n🏆 Score: ${score}\n🔥 Best Streak: ${streak}\n🎯 Round: ${round}\n\nCan you beat my score? Play at PokeHub!`;
    if (navigator.share) {
      navigator.share({ title: "Who's That Pokémon?", text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  useEffect(() => {
    loadNewRound();
  }, [loadNewRound]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Who's That Pokémon?
        </h1>
        <div className="flex gap-4 justify-center text-sm">
          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full">
            Score: {score}
          </span>
          <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full">
            🔥 Streak: {streak}
          </span>
          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
            Round: {round}
          </span>
        </div>
      </motion.div>

      {/* Game Area */}
      <AnimatePresence mode="wait">
        {gameState === GAME_STATES.LOADING && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 mt-4">Loading next Pokémon...</p>
          </motion.div>
        )}

        {gameState === GAME_STATES.PLAYING && currentPokemon && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center w-full max-w-lg"
          >
            {/* Timer */}
            <div className="w-full mb-4">
              <div className="flex justify-between text-sm text-white/70 mb-1">
                <span>Time Left</span>
                <span className={timeLeft <= 5 ? 'text-red-400 font-bold' : ''}>
                  {timeLeft}s
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${timeLeft <= 5 ? 'bg-red-500' : 'bg-green-500'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Silhouette */}
            <div className="relative w-64 h-64 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
              <img
                src={currentPokemon.image || currentPokemon.sprite}
                alt="Mystery Pokémon"
                className="w-48 h-48 object-contain"
                style={{ filter: 'brightness(0) saturate(100%)' }}
                draggable={false}
              />
              <div className="absolute top-2 right-2 text-3xl">❓</div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-3 w-full">
              {options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGuess(option.name)}
                  className="bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl border border-white/20 transition-colors capitalize"
                >
                  {option.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === GAME_STATES.REVEALED && currentPokemon && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center w-full max-w-lg"
          >
            {/* Result */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold mb-4 px-6 py-2 rounded-full ${
                isCorrect
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}
            >
              {isCorrect ? '✅ Correct!' : '❌ Wrong!'}
            </motion.div>

            {/* Revealed Pokemon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="bg-white/10 rounded-2xl p-6 border border-white/20 text-center mb-6"
            >
              <img
                src={currentPokemon.image || currentPokemon.sprite}
                alt={currentPokemon.name}
                className="w-40 h-40 mx-auto object-contain"
              />
              <p className="text-white text-xl font-bold capitalize mt-2">
                {currentPokemon.name}
              </p>
              <div className="flex gap-2 justify-center mt-2">
                {currentPokemon.types.map((type) => (
                  <span
                    key={type}
                    className="text-xs px-2 py-1 rounded-full bg-white/20 text-white capitalize"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNextRound}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl"
              >
                Next Round →
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndGame}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl"
              >
                End Game
              </motion.button>
            </div>
          </motion.div>
        )}

        {gameState === GAME_STATES.GAME_OVER && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/10 rounded-2xl p-8 border border-white/20 text-center max-w-md w-full"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
            <div className="space-y-3 mb-6">
              <div className="bg-yellow-500/10 rounded-lg p-3">
                <p className="text-yellow-300 text-sm">Final Score</p>
                <p className="text-3xl font-bold text-white">{score}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-500/10 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">Rounds</p>
                  <p className="text-xl font-bold text-white">{round}</p>
                </div>
                <div className="bg-orange-500/10 rounded-lg p-3">
                  <p className="text-orange-300 text-sm">Best Streak</p>
                  <p className="text-xl font-bold text-white">{highScores.bestStreak}</p>
                </div>
              </div>
              {score >= (highScores.highScore || 0) && score > 0 && (
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-yellow-400 font-bold text-lg"
                >
                  🎉 New High Score!
                </motion.p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRestart}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl"
              >
                Play Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl"
              >
                📤 Share
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhosThatPokemon;
