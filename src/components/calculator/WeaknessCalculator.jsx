import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemon, parsePokemonData } from '../../utils/pokemonApi';
import { getDefensiveMatchups, ALL_TYPES } from '../../utils/typeEffectiveness';
import { TYPE_COLORS } from '../../utils/constants';

/**
 * WeaknessCalculator - Type effectiveness lookup tool
 * Feature 17: Input a Pokemon → see what's super effective against it
 */
const WeaknessCalculator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [matchups, setMatchups] = useState(null);
  const [mode, setMode] = useState('pokemon'); // 'pokemon' or 'type'
  const [selectedTypes, setSelectedTypes] = useState([]);

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
          .slice(0, 6);
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

  const selectPokemon = (pokemon) => {
    setSelectedPokemon(pokemon);
    setSearchQuery('');
    setSearchResults([]);
    const result = getDefensiveMatchups(pokemon.types);
    setMatchups(result);
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type].slice(0, 2);
      if (newTypes.length > 0) {
        setMatchups(getDefensiveMatchups(newTypes));
      } else {
        setMatchups(null);
      }
      return newTypes;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900/20 to-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ⚡ Weakness Calculator
          </h1>
          <p className="text-white/50 text-sm">
            Find out what's super effective against any Pokémon
          </p>
        </motion.div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => { setMode('pokemon'); setMatchups(null); setSelectedTypes([]); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'pokemon' ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            By Pokémon
          </button>
          <button
            onClick={() => { setMode('type'); setMatchups(null); setSelectedPokemon(null); }}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mode === 'type' ? 'bg-orange-600 text-white' : 'bg-white/10 text-white/60'
            }`}
          >
            By Type
          </button>
        </div>

        {/* Input Area */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
          {mode === 'pokemon' ? (
            <>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Pokémon name or ID..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition"
              />
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {searching && <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />}
                {searchResults.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectPokemon(p)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-left"
                  >
                    <img src={p.sprite || p.image} alt={p.name} className="w-10 h-10" />
                    <span className="text-white capitalize font-medium">{p.name}</span>
                    <div className="flex gap-1 ml-auto">
                      {p.types.map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>

              {selectedPokemon && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-3 bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <img src={selectedPokemon.image || selectedPokemon.sprite} alt={selectedPokemon.name} className="w-16 h-16" />
                  <div>
                    <p className="text-white font-bold capitalize text-lg">{selectedPokemon.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      {selectedPokemon.types.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{ backgroundColor: TYPE_COLORS[t]?.bg, color: TYPE_COLORS[t]?.text }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            <>
              <p className="text-white/60 text-sm mb-3">Select up to 2 types:</p>
              <div className="flex flex-wrap gap-2">
                {ALL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`text-xs px-3 py-1.5 rounded-full capitalize font-medium transition border ${
                      selectedTypes.includes(type)
                        ? 'ring-2 ring-white shadow-lg scale-110'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: TYPE_COLORS[type]?.bg,
                      color: TYPE_COLORS[type]?.text,
                      borderColor: selectedTypes.includes(type) ? 'white' : 'transparent',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Results */}
        <AnimatePresence>
          {matchups && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Weaknesses */}
              {Object.keys(matchups.weaknesses).length > 0 && (
                <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/20">
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <span>⚠️</span> Weak To (Takes More Damage)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(matchups.weaknesses)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, multiplier]) => (
                        <div key={type} className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded capitalize font-medium"
                            style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                          >
                            {type}
                          </span>
                          <span className="text-red-400 font-bold text-sm">×{multiplier}</span>
                        </div>
                      ))}
                  </div>
                  <p className="text-white/40 text-xs mt-3">
                    💡 Use these types to deal super effective damage!
                  </p>
                </div>
              )}

              {/* Resistances */}
              {Object.keys(matchups.resistances).length > 0 && (
                <div className="bg-green-500/5 rounded-2xl p-5 border border-green-500/20">
                  <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    <span>🛡️</span> Resistant To (Takes Less Damage)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(matchups.resistances)
                      .sort((a, b) => a[1] - b[1])
                      .map(([type, multiplier]) => (
                        <div key={type} className="flex items-center gap-1.5 bg-black/20 rounded-lg px-3 py-1.5">
                          <span
                            className="text-xs px-2 py-0.5 rounded capitalize font-medium"
                            style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                          >
                            {type}
                          </span>
                          <span className="text-green-400 font-bold text-sm">×{multiplier}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Immunities */}
              {matchups.immunities.length > 0 && (
                <div className="bg-blue-500/5 rounded-2xl p-5 border border-blue-500/20">
                  <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                    <span>🚫</span> Immune To (Takes No Damage)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchups.immunities.map((type) => (
                      <span
                        key={type}
                        className="text-xs px-3 py-1.5 rounded-lg capitalize font-medium border"
                        style={{
                          backgroundColor: TYPE_COLORS[type]?.bg + '30',
                          color: TYPE_COLORS[type]?.bg,
                          borderColor: TYPE_COLORS[type]?.bg + '50',
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WeaknessCalculator;
