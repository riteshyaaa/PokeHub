import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemon, parsePokemonData, getRandomPokemonId } from '../../utils/pokemonApi';
import { TYPE_COLORS } from '../../utils/constants';

const GAME_MODES = {
  PLAYER: 'player',
  QUIZ: 'quiz',
};

const CryPlayer = () => {
  const [mode, setMode] = useState(GAME_MODES.PLAYER);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentPokemon, setCurrentPokemon] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const audioRef = useRef(null);

  // Quiz state
  const [quizPokemon, setQuizPokemon] = useState(null);
  const [quizOptions, setQuizOptions] = useState([]);
  const [quizRevealed, setQuizRevealed] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);

  // Search handler
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchPokemon(query.toLowerCase());
      setSearchResults([parsePokemonData(data)]);
    } catch {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        const list = await response.json();
        const matches = list.results
          .filter((p) => p.name.includes(query.toLowerCase()))
          .slice(0, 8);
        const results = await Promise.all(
          matches.map(async (m) => {
            const d = await fetchPokemon(m.name);
            return parsePokemonData(d);
          })
        );
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => handleSearch(searchQuery), 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  // Play cry
  const playCry = (pokemon) => {
    const cryUrl = pokemon.cries?.latest || pokemon.cries?.legacy;
    if (!cryUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(cryUrl);
    audioRef.current = audio;
    setIsPlaying(true);
    setCurrentPokemon(pokemon);

    audio.play().catch(() => setIsPlaying(false));
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);

    // Add to recently played
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((p) => p.id !== pokemon.id);
      return [pokemon, ...filtered].slice(0, 10);
    });
  };

  const selectAndPlay = (pokemon) => {
    setCurrentPokemon(pokemon);
    setSearchQuery('');
    setSearchResults([]);
    playCry(pokemon);
  };

  // Quiz mode functions
  const loadQuizRound = async () => {
    setQuizLoading(true);
    setQuizRevealed(false);
    setQuizCorrect(null);

    try {
      const targetId = getRandomPokemonId();
      const targetData = await fetchPokemon(targetId);
      const target = parsePokemonData(targetData);

      // Make sure it has a cry
      if (!target.cries?.latest && !target.cries?.legacy) {
        loadQuizRound(); // Retry
        return;
      }

      const wrongOptions = [];
      const usedIds = new Set([targetId]);
      while (wrongOptions.length < 3) {
        const id = getRandomPokemonId();
        if (!usedIds.has(id)) {
          usedIds.add(id);
          try {
            const d = await fetchPokemon(id);
            wrongOptions.push(parsePokemonData(d));
          } catch {
            // skip
          }
        }
      }

      const allOptions = [target, ...wrongOptions].sort(() => Math.random() - 0.5);
      setQuizPokemon(target);
      setQuizOptions(allOptions);
      setQuizLoading(false);

      // Auto-play the cry
      setTimeout(() => playCry(target), 300);
    } catch {
      setTimeout(loadQuizRound, 1000);
    }
  };

  const handleQuizGuess = (name) => {
    if (quizRevealed) return;
    const correct = name === quizPokemon.name;
    setQuizCorrect(correct);
    setQuizRevealed(true);
    setQuizTotal((prev) => prev + 1);
    if (correct) setQuizScore((prev) => prev + 1);
  };

  const replayCry = () => {
    if (quizPokemon) playCry(quizPokemon);
  };

  useEffect(() => {
    if (mode === GAME_MODES.QUIZ) {
      loadQuizRound();
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-teal-900/30 to-gray-900 p-4 flex flex-col items-center">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2 text-center"
      >
        🔊 Pokémon Cry Player
      </motion.h1>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode(GAME_MODES.PLAYER)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === GAME_MODES.PLAYER
              ? 'bg-teal-600 text-white'
              : 'bg-white/10 text-white/60 hover:text-white'
          }`}
        >
          🎵 Player
        </button>
        <button
          onClick={() => setMode(GAME_MODES.QUIZ)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            mode === GAME_MODES.QUIZ
              ? 'bg-teal-600 text-white'
              : 'bg-white/10 text-white/60 hover:text-white'
          }`}
        >
          🎯 Cry Quiz
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* PLAYER MODE */}
        {mode === GAME_MODES.PLAYER && (
          <motion.div
            key="player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg"
          >
            {/* Search */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Pokémon to hear their cry..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-teal-500 transition"
              />

              {/* Results */}
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {searching && (
                  <div className="text-center py-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  </div>
                )}
                {searchResults.map((pokemon) => (
                  <motion.div
                    key={pokemon.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => selectAndPlay(pokemon)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer transition"
                  >
                    <img src={pokemon.sprite || pokemon.image} alt={pokemon.name} className="w-10 h-10" />
                    <p className="text-white font-medium capitalize flex-1">{pokemon.name}</p>
                    <span className="text-teal-400">🔊</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Now Playing */}
            {currentPokemon && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10 text-center"
              >
                <motion.img
                  src={currentPokemon.image || currentPokemon.sprite}
                  alt={currentPokemon.name}
                  className="w-32 h-32 mx-auto object-contain"
                  animate={isPlaying ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.5 }}
                />
                <p className="text-white text-xl font-bold capitalize mt-2">{currentPokemon.name}</p>
                <div className="flex gap-2 justify-center mt-2">
                  {currentPokemon.types.map((type) => (
                    <span
                      key={type}
                      className="text-xs px-2 py-1 rounded-full capitalize"
                      style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => playCry(currentPokemon)}
                  disabled={isPlaying}
                  className={`mt-4 px-6 py-2.5 rounded-xl font-bold transition ${
                    isPlaying
                      ? 'bg-teal-700 text-white/50 cursor-not-allowed'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {isPlaying ? '🔊 Playing...' : '▶️ Play Cry'}
                </motion.button>
              </motion.div>
            )}

            {/* Recently Played */}
            {recentlyPlayed.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white/60 text-sm font-medium mb-2">Recently Played:</h3>
                <div className="flex flex-wrap gap-2">
                  {recentlyPlayed.map((pokemon) => (
                    <motion.button
                      key={pokemon.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => playCry(pokemon)}
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-2.5 py-1 transition"
                      title={pokemon.name}
                    >
                      <img src={pokemon.sprite} alt={pokemon.name} className="w-6 h-6" />
                      <span className="text-white/70 text-xs capitalize">{pokemon.name}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* QUIZ MODE */}
        {mode === GAME_MODES.QUIZ && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg"
          >
            {/* Score */}
            <div className="flex justify-center gap-4 mb-4">
              <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                ✓ {quizScore} correct
              </span>
              <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-sm">
                Total: {quizTotal}
              </span>
              {quizTotal > 0 && (
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm">
                  {Math.round((quizScore / quizTotal) * 100)}%
                </span>
              )}
            </div>

            {quizLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-white/50 mt-3">Loading next cry...</p>
              </div>
            ) : (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                {/* Cry playback */}
                <div className="text-center mb-6">
                  <motion.div
                    animate={isPlaying ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.6 }}
                    className="w-24 h-24 bg-teal-600/20 rounded-full flex items-center justify-center mx-auto border-2 border-teal-500/50"
                  >
                    <span className="text-4xl">🔊</span>
                  </motion.div>
                  <p className="text-white/60 text-sm mt-3">
                    {quizRevealed ? 'Can you hear the difference?' : 'Who does this cry belong to?'}
                  </p>
                  <button
                    onClick={replayCry}
                    className="mt-2 text-teal-400 hover:text-teal-300 text-sm underline"
                  >
                    Replay Cry
                  </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-3">
                  {quizOptions.map((option) => {
                    let btnClass = 'bg-white/10 hover:bg-white/20 border-white/20 text-white';
                    if (quizRevealed) {
                      if (option.name === quizPokemon.name) {
                        btnClass = 'bg-green-600/30 border-green-500 text-green-300';
                      } else if (option.name !== quizPokemon.name && quizCorrect === false) {
                        btnClass = 'bg-red-600/10 border-white/10 text-white/40';
                      }
                    }
                    return (
                      <motion.button
                        key={option.id}
                        whileHover={!quizRevealed ? { scale: 1.03 } : {}}
                        whileTap={!quizRevealed ? { scale: 0.97 } : {}}
                        onClick={() => handleQuizGuess(option.name)}
                        disabled={quizRevealed}
                        className={`p-3 rounded-xl border font-medium capitalize transition flex items-center gap-2 ${btnClass}`}
                      >
                        <img src={option.sprite || option.image} alt="" className={`w-10 h-10 ${!quizRevealed ? 'opacity-50' : ''}`} />
                        <span className="text-sm">{option.name}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Result & Next */}
                {quizRevealed && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center"
                  >
                    <p className={`text-lg font-bold mb-3 ${quizCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {quizCorrect ? '✅ Correct!' : `❌ It was ${quizPokemon.name}!`}
                    </p>
                    <button
                      onClick={loadQuizRound}
                      className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition"
                    >
                      Next Cry →
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CryPlayer;
