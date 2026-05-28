import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPokemon, parsePokemonData } from '../../utils/pokemonApi';
import { getTeamCoverage, getDefensiveMatchups } from '../../utils/typeEffectiveness';
import { TYPE_COLORS } from '../../utils/constants';
import { getSavedTeam, saveTeam } from '../../utils/localStorage';

const MAX_TEAM_SIZE = 6;

const TeamBuilder = () => {
  const [team, setTeam] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [coverage, setCoverage] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Load saved team on mount
  useEffect(() => {
    const saved = getSavedTeam();
    if (saved.length > 0) {
      setTeam(saved);
    }
  }, []);

  // Recalculate coverage when team changes
  useEffect(() => {
    if (team.length > 0) {
      const teamCoverage = getTeamCoverage(team);
      setCoverage(teamCoverage);
      saveTeam(team);
    } else {
      setCoverage(null);
    }
  }, [team]);

  // Search Pokemon
  const handleSearch = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Try direct name/id search
      const data = await fetchPokemon(query.toLowerCase());
      const pokemon = parsePokemonData(data);
      setSearchResults([pokemon]);
    } catch {
      // If not found, try searching through a list
      try {
        const response = await fetch(
          `https://pokeapi.co/api/v2/pokemon?limit=1025`
        );
        const list = await response.json();
        const matches = list.results
          .filter((p) => p.name.includes(query.toLowerCase()))
          .slice(0, 8);

        const results = await Promise.all(
          matches.map(async (m) => {
            const data = await fetchPokemon(m.name);
            return parsePokemonData(data);
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

  const addToTeam = (pokemon) => {
    if (team.length >= MAX_TEAM_SIZE) return;
    if (team.some((p) => p.id === pokemon.id)) return;
    setTeam((prev) => [...prev, pokemon]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeFromTeam = (pokemonId) => {
    setTeam((prev) => prev.filter((p) => p.id !== pokemonId));
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (dragIndex === dropIndex) return;

    const newTeam = [...team];
    const [dragged] = newTeam.splice(dragIndex, 1);
    newTeam.splice(dropIndex, 0, dragged);
    setTeam(newTeam);
    setDragOverIndex(null);
  };

  const clearTeam = () => {
    setTeam([]);
    saveTeam([]);
  };

  const exportTeamAsText = () => {
    const text = team
      .map((p, i) => `${i + 1}. ${p.name} (${p.types.join('/')})`)
      .join('\n');
    const fullText = `My PokeHub Team:\n${text}\n\nBuild yours at PokeHub!`;

    if (navigator.share) {
      navigator.share({ title: 'My Pokemon Team', text: fullText });
    } else {
      navigator.clipboard.writeText(fullText);
      alert('Team copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Team Builder
          </h1>
          <p className="text-white/60">
            Build your dream team of 6 Pokémon and analyze type coverage
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Team Slots */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">
                  Your Team ({team.length}/{MAX_TEAM_SIZE})
                </h2>
                <div className="flex gap-2">
                  {team.length > 0 && (
                    <>
                      <button
                        onClick={exportTeamAsText}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        📤 Share
                      </button>
                      <button
                        onClick={clearTeam}
                        className="text-sm bg-red-600/50 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Team Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: MAX_TEAM_SIZE }).map((_, index) => {
                  const pokemon = team[index];
                  return (
                    <motion.div
                      key={index}
                      layout
                      draggable={!!pokemon}
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative rounded-xl border-2 border-dashed p-4 min-h-[180px] flex flex-col items-center justify-center transition-all ${
                        dragOverIndex === index
                          ? 'border-yellow-400 bg-yellow-400/10'
                          : pokemon
                          ? 'border-white/30 bg-white/5 cursor-grab active:cursor-grabbing'
                          : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      {pokemon ? (
                        <AnimatePresence>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="text-center w-full"
                          >
                            <button
                              onClick={() => removeFromTeam(pokemon.id)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
                            >
                              ✕
                            </button>
                            <img
                              src={pokemon.image || pokemon.sprite}
                              alt={pokemon.name}
                              className="w-20 h-20 mx-auto object-contain"
                              draggable={false}
                            />
                            <p className="text-white font-medium capitalize text-sm mt-1">
                              {pokemon.name}
                            </p>
                            <div className="flex gap-1 justify-center mt-1 flex-wrap">
                              {pokemon.types.map((type) => (
                                <span
                                  key={type}
                                  className="text-[10px] px-1.5 py-0.5 rounded capitalize font-medium"
                                  style={{
                                    backgroundColor: TYPE_COLORS[type]?.bg,
                                    color: TYPE_COLORS[type]?.text,
                                  }}
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        </AnimatePresence>
                      ) : (
                        <div className="text-white/30 text-center">
                          <div className="text-3xl mb-1">+</div>
                          <p className="text-xs">Slot {index + 1}</p>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Coverage Analysis */}
            {team.length > 0 && coverage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-6"
              >
                <button
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-xl font-bold text-white">
                    Type Coverage Analysis
                  </h2>
                  <span className="text-white/60">
                    {showAnalysis ? '▲' : '▼'}
                  </span>
                </button>

                <AnimatePresence>
                  {showAnalysis && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {/* Team Weaknesses */}
                      {Object.keys(coverage.weaknesses).length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-red-400 font-semibold mb-2 text-sm">
                            ⚠️ Team Weaknesses (2+ members weak to):
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(coverage.weaknesses).map(([type, count]) => (
                              <span
                                key={type}
                                className="text-xs px-2 py-1 rounded-full capitalize font-medium border border-red-500/30"
                                style={{
                                  backgroundColor: TYPE_COLORS[type]?.bg + '40',
                                  color: '#fff',
                                }}
                              >
                                {type} ({count} weak)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Uncovered Types */}
                      {coverage.uncovered.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-yellow-400 font-semibold mb-2 text-sm">
                            🔓 No Super Effective Coverage Against:
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {coverage.uncovered.map((type) => (
                              <span
                                key={type}
                                className="text-xs px-2 py-1 rounded-full capitalize font-medium"
                                style={{
                                  backgroundColor: TYPE_COLORS[type]?.bg,
                                  color: TYPE_COLORS[type]?.text,
                                }}
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Good Coverage */}
                      {coverage.uncovered.length === 0 && (
                        <div className="mt-4 bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                          <p className="text-green-400 font-semibold text-sm">
                            ✅ Your team has full offensive type coverage!
                          </p>
                        </div>
                      )}

                      {/* Coverage Map */}
                      <div className="mt-4">
                        <h3 className="text-blue-400 font-semibold mb-2 text-sm">
                          📊 Offensive Coverage:
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(coverage.coverage)
                            .sort((a, b) => b[1] - a[1])
                            .map(([type, count]) => (
                              <span
                                key={type}
                                className="text-[10px] px-2 py-1 rounded capitalize font-medium"
                                style={{
                                  backgroundColor: TYPE_COLORS[type]?.bg,
                                  color: TYPE_COLORS[type]?.text,
                                  opacity: 0.6 + count * 0.1,
                                }}
                              >
                                {type} ×{count}
                              </span>
                            ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>

          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 sticky top-4">
              <h2 className="text-lg font-bold text-white mb-3">Add Pokémon</h2>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or ID..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition"
              />

              {/* Search Results */}
              <div className="mt-3 space-y-2 max-h-[500px] overflow-y-auto">
                {searching && (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                  </div>
                )}

                {searchResults.map((pokemon) => {
                  const isInTeam = team.some((p) => p.id === pokemon.id);
                  return (
                    <motion.div
                      key={pokemon.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
                        isInTeam
                          ? 'border-green-500/30 bg-green-500/10 opacity-50'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'
                      }`}
                      onClick={() => !isInTeam && addToTeam(pokemon)}
                    >
                      <img
                        src={pokemon.sprite || pokemon.image}
                        alt={pokemon.name}
                        className="w-12 h-12 object-contain"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium capitalize text-sm truncate">
                          {pokemon.name}
                        </p>
                        <div className="flex gap-1 mt-0.5">
                          {pokemon.types.map((type) => (
                            <span
                              key={type}
                              className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                              style={{
                                backgroundColor: TYPE_COLORS[type]?.bg,
                                color: TYPE_COLORS[type]?.text,
                              }}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isInTeam ? (
                        <span className="text-green-400 text-xs">✓ Added</span>
                      ) : team.length < MAX_TEAM_SIZE ? (
                        <span className="text-white/40 text-lg">+</span>
                      ) : (
                        <span className="text-red-400 text-xs">Full</span>
                      )}
                    </motion.div>
                  );
                })}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="text-white/40 text-sm text-center py-4">
                    No Pokémon found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;
