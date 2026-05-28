import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchPokemon, parsePokemonData } from '../../utils/pokemonApi';
import { TYPE_COLORS } from '../../utils/constants';

const HUMAN_HEIGHT = 17; // 1.7m in decimeters (Pokemon API uses decimeters)
const HUMAN_WEIGHT = 700; // 70kg in hectograms

const SizeCompare = () => {
  const [pokemon1, setPokemon1] = useState(null);
  const [pokemon2, setPokemon2] = useState(null);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [results1, setResults1] = useState([]);
  const [results2, setResults2] = useState([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);
  const [showHuman, setShowHuman] = useState(true);

  const searchPokemon = useCallback(async (query, setResults, setSearching) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchPokemon(query.toLowerCase());
      setResults([parsePokemonData(data)]);
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
        setResults(results);
      } catch {
        setResults([]);
      }
    }
    setSearching(false);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchPokemon(searchQuery1, setResults1, setSearching1), 500);
    return () => clearTimeout(t);
  }, [searchQuery1, searchPokemon]);

  useEffect(() => {
    const t = setTimeout(() => searchPokemon(searchQuery2, setResults2, setSearching2), 500);
    return () => clearTimeout(t);
  }, [searchQuery2, searchPokemon]);

  // Calculate visual scale - normalize to max 300px height
  const getVisualHeight = (heightDecimeters) => {
    const maxHeightDm = Math.max(
      pokemon1?.height || 0,
      pokemon2?.height || 0,
      showHuman ? HUMAN_HEIGHT : 0,
      10 // minimum 1m reference
    );
    const maxPx = 250;
    return (heightDecimeters / maxHeightDm) * maxPx;
  };

  const formatHeight = (decimeters) => {
    const meters = decimeters / 10;
    return meters >= 1 ? `${meters.toFixed(1)}m` : `${(meters * 100).toFixed(0)}cm`;
  };

  const formatWeight = (hectograms) => {
    const kg = hectograms / 10;
    return kg >= 1 ? `${kg.toFixed(1)}kg` : `${(kg * 1000).toFixed(0)}g`;
  };

  const CompareEntity = ({ entity, isHuman, label }) => {
    const height = isHuman ? HUMAN_HEIGHT : entity.height;
    const visualHeight = getVisualHeight(height);

    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center"
      >
        <div className="relative flex items-end justify-center" style={{ height: '280px' }}>
          {/* Height indicator line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-white/20" style={{ height: `${visualHeight}px`, bottom: 0, top: 'auto', position: 'absolute' }}>
            <div className="absolute -top-5 -left-3 text-[10px] text-white/50 whitespace-nowrap">
              {formatHeight(height)}
            </div>
          </div>

          {isHuman ? (
            <div
              className="flex items-end justify-center"
              style={{ height: `${visualHeight}px` }}
            >
              <svg viewBox="0 0 60 180" style={{ height: `${visualHeight}px`, maxWidth: '60px' }} className="opacity-50">
                <ellipse cx="30" cy="20" rx="12" ry="15" fill="#9CA3AF" />
                <rect x="22" y="35" width="16" height="60" rx="8" fill="#9CA3AF" />
                <rect x="10" y="40" width="10" height="45" rx="5" fill="#9CA3AF" />
                <rect x="40" y="40" width="10" height="45" rx="5" fill="#9CA3AF" />
                <rect x="20" y="95" width="10" height="55" rx="5" fill="#9CA3AF" />
                <rect x="30" y="95" width="10" height="55" rx="5" fill="#9CA3AF" />
              </svg>
            </div>
          ) : (
            <motion.img
              src={entity.image || entity.sprite}
              alt={entity.name}
              className="object-contain"
              style={{ height: `${Math.max(visualHeight, 40)}px`, maxWidth: '150px' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
          )}
        </div>

        {/* Label */}
        <div className="mt-3 text-center">
          {isHuman ? (
            <>
              <p className="text-white/60 font-medium text-sm">Human</p>
              <p className="text-white/40 text-xs">1.7m / 70kg</p>
            </>
          ) : (
            <>
              <p className="text-white font-bold capitalize">{entity.name}</p>
              <div className="flex gap-1 justify-center mt-1">
                {entity.types.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                    style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <p className="text-white/50 text-xs mt-1">
                {formatHeight(entity.height)} / {formatWeight(entity.weight)}
              </p>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/30 to-gray-900 p-4 flex flex-col items-center">
      <motion.h1
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-2 text-center"
      >
        📏 Size Comparison
      </motion.h1>
      <p className="text-white/50 text-sm mb-6">Compare Pokémon sizes side by side</p>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-6">
        <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={showHuman}
            onChange={(e) => setShowHuman(e.target.checked)}
            className="rounded"
          />
          Show human reference
        </label>
      </div>

      {/* Search Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
        {/* Pokemon 1 Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery1}
            onChange={(e) => setSearchQuery1(e.target.value)}
            placeholder="Search Pokémon 1..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition"
          />
          {results1.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 border border-white/20 rounded-lg z-10 max-h-48 overflow-y-auto">
              {results1.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPokemon1(p); setSearchQuery1(''); setResults1([]); }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/10 text-left"
                >
                  <img src={p.sprite} alt="" className="w-8 h-8" />
                  <span className="text-white capitalize text-sm">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pokemon 2 Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery2}
            onChange={(e) => setSearchQuery2(e.target.value)}
            placeholder="Search Pokémon 2..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition"
          />
          {results2.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 border border-white/20 rounded-lg z-10 max-h-48 overflow-y-auto">
              {results2.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPokemon2(p); setSearchQuery2(''); setResults2([]); }}
                  className="w-full flex items-center gap-2 p-2 hover:bg-white/10 text-left"
                >
                  <img src={p.sprite} alt="" className="w-8 h-8" />
                  <span className="text-white capitalize text-sm">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Display */}
      {(pokemon1 || pokemon2) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 rounded-2xl p-8 border border-white/10 w-full max-w-3xl"
        >
          {/* Ground line */}
          <div className="relative">
            <div className="flex items-end justify-around gap-8" style={{ minHeight: '320px' }}>
              {pokemon1 && <CompareEntity entity={pokemon1} />}
              {showHuman && <CompareEntity isHuman />}
              {pokemon2 && <CompareEntity entity={pokemon2} />}
            </div>
            {/* Ground */}
            <div className="w-full h-px bg-white/20 mt-2" />
          </div>

          {/* Stats Comparison Table */}
          {pokemon1 && pokemon2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 grid grid-cols-3 gap-2 text-center"
            >
              <div className="text-white font-bold capitalize">{pokemon1.name}</div>
              <div className="text-white/40 text-sm">VS</div>
              <div className="text-white font-bold capitalize">{pokemon2.name}</div>

              <div className={`text-sm ${pokemon1.height > pokemon2.height ? 'text-green-400' : 'text-white/60'}`}>
                {formatHeight(pokemon1.height)}
              </div>
              <div className="text-white/30 text-xs">Height</div>
              <div className={`text-sm ${pokemon2.height > pokemon1.height ? 'text-green-400' : 'text-white/60'}`}>
                {formatHeight(pokemon2.height)}
              </div>

              <div className={`text-sm ${pokemon1.weight > pokemon2.weight ? 'text-green-400' : 'text-white/60'}`}>
                {formatWeight(pokemon1.weight)}
              </div>
              <div className="text-white/30 text-xs">Weight</div>
              <div className={`text-sm ${pokemon2.weight > pokemon1.weight ? 'text-green-400' : 'text-white/60'}`}>
                {formatWeight(pokemon2.weight)}
              </div>

              <div className="text-sm text-white/60">
                {pokemon1.height > pokemon2.height
                  ? `${((pokemon1.height / pokemon2.height)).toFixed(1)}x taller`
                  : pokemon1.height < pokemon2.height
                  ? `${((pokemon2.height / pokemon1.height)).toFixed(1)}x shorter`
                  : 'Same height'}
              </div>
              <div className="text-white/30 text-xs">Ratio</div>
              <div className="text-sm text-white/60">
                {pokemon2.weight > pokemon1.weight
                  ? `${((pokemon2.weight / pokemon1.weight)).toFixed(1)}x heavier`
                  : pokemon2.weight < pokemon1.weight
                  ? `${((pokemon1.weight / pokemon2.weight)).toFixed(1)}x lighter`
                  : 'Same weight'}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Empty state */}
      {!pokemon1 && !pokemon2 && (
        <div className="text-center text-white/30 py-20">
          <p className="text-6xl mb-4">📏</p>
          <p>Search and select Pokémon to compare their sizes</p>
        </div>
      )}
    </div>
  );
};

export default SizeCompare;
