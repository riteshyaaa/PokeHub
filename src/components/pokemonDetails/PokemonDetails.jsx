import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fetchPokemon, fetchPokemonSpecies, parsePokemonData } from '../../utils/pokemonApi';
import { markPokemonDiscovered } from '../../utils/localStorage';
import { TYPE_COLORS, STAT_NAMES } from '../../utils/constants';
import TypeBackground from '../ui/TypeBackground';
import StatRadarChart from '../ui/StatRadarChart';
import Typewriter from '../ui/Typewriter';
import EvolutionChain from '../evolution/EvolutionChain';
import SimilarPokemon from '../similar/SimilarPokemon';
import ShareCard from '../share/ShareCard';

const PokemonDetails = ({ PokemonName }) => {
  const [loading, setLoading] = useState(true);
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [flavorText, setFlavorText] = useState('');
  const [showShareCard, setShowShareCard] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const { id } = useParams();
  const audioRef = useRef(null);

  const identifier = PokemonName || id;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [data, speciesData] = await Promise.all([
          fetchPokemon(identifier),
          fetchPokemonSpecies(identifier).catch(() => null),
        ]);
        const parsed = parsePokemonData(data);
        setPokemon(parsed);
        setSpecies(speciesData);

        // Mark as discovered
        markPokemonDiscovered(parsed.id);

        // Get flavor text
        if (speciesData) {
          const entry = speciesData.flavor_text_entries?.find(
            (e) => e.language.name === 'en'
          );
          setFlavorText(entry?.flavor_text?.replace(/\f|\n|\r/g, ' ') || '');
        }
      } catch (error) {
        console.error('Error fetching Pokemon details:', error);
      }
      setLoading(false);
    };
    load();
  }, [identifier]);

  const playCry = () => {
    const cryUrl = pokemon?.cries?.latest || pokemon?.cries?.legacy;
    if (!cryUrl) return;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(cryUrl);
    audioRef.current = audio;
    setIsPlayingCry(true);
    audio.play().catch(() => setIsPlayingCry(false));
    audio.onended = () => setIsPlayingCry(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500">Loading Pokémon...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-6xl mb-4">❓</p>
          <p className="text-gray-500 text-lg">Pokémon not found</p>
          <Link to="/" className="text-blue-500 hover:underline mt-2 inline-block">
            ← Back to Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus || '';

  return (
    <TypeBackground types={pokemon.types} className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-6">
        {/* Back button */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-4 transition"
        >
          ← Back to Pokédex
        </Link>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden">
          {/* Top Section - Image + Basic Info */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Image */}
              <div className="text-center">
                <motion.img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-56 h-56 md:w-64 md:h-64 mx-auto object-contain drop-shadow-2xl"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                />

                {/* Actions */}
                <div className="flex items-center justify-center gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={playCry}
                    disabled={isPlayingCry}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition"
                  >
                    {isPlayingCry ? '🔊 Playing...' : '🔊 Play Cry'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareCard(!showShareCard)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium border border-white/20 transition"
                  >
                    📤 Share Card
                  </motion.button>
                </div>
              </div>

              {/* Right: Info */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <p className="text-white/40 text-sm font-mono">#{String(pokemon.id).padStart(3, '0')}</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-white capitalize mb-1">
                    {pokemon.name}
                  </h1>
                  {genus && <p className="text-white/50 text-sm mb-4">{genus}</p>}

                  {/* Types */}
                  <div className="flex gap-2 mb-5">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-4 py-1.5 rounded-full text-sm font-bold capitalize shadow-lg"
                        style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase">Height</p>
                      <p className="text-white font-bold">{(pokemon.height / 10).toFixed(1)} m</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase">Weight</p>
                      <p className="text-white font-bold">{(pokemon.weight / 10).toFixed(1)} kg</p>
                    </div>
                  </div>

                  {/* Abilities */}
                  <div className="mb-5">
                    <p className="text-white/40 text-xs uppercase mb-2">Abilities</p>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.abilities.map((ability) => (
                        <span
                          key={ability}
                          className="text-xs bg-white/10 text-white/80 px-3 py-1 rounded-full capitalize border border-white/10"
                        >
                          {ability.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Flavor Text (Typewriter) */}
                  {flavorText && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/40 text-[10px] uppercase mb-1">Pokédex Entry</p>
                      <Typewriter
                        text={flavorText}
                        speed={20}
                        className="text-white/70 text-sm italic leading-relaxed"
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="px-6 md:px-8 pb-6">
            <h2 className="text-white font-bold text-lg mb-4">Base Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stat Bars */}
              <div className="space-y-2">
                {pokemon.stats.map((stat) => {
                  const percentage = Math.min(100, (stat.value / 255) * 100);
                  const color = stat.value >= 100 ? '#4ade80' : stat.value >= 60 ? '#facc15' : '#f87171';
                  return (
                    <div key={stat.name} className="flex items-center gap-3">
                      <span className="text-white/50 text-xs w-16 text-right font-medium">
                        {STAT_NAMES[stat.name] || stat.name}
                      </span>
                      <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-white/60 text-xs w-8 font-mono">{stat.value}</span>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                  <span className="text-white/70 text-xs w-16 text-right font-bold">Total</span>
                  <span className="text-white font-bold">
                    {pokemon.stats.reduce((sum, s) => sum + s.value, 0)}
                  </span>
                </div>
              </div>

              {/* Radar Chart */}
              <StatRadarChart pokemon1Stats={pokemon.stats} pokemon1Name={pokemon.name} />
            </div>
          </div>

          {/* Evolution Chain */}
          <div className="px-6 md:px-8 pb-6">
            <EvolutionChain pokemonId={pokemon.id} />
          </div>

          {/* Similar Pokemon */}
          <div className="px-6 md:px-8 pb-8">
            <SimilarPokemon pokemon={pokemon} />
          </div>
        </div>

        {/* Share Card Modal */}
        {showShareCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowShareCard(false)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full"
            >
              <div className="bg-gray-900 rounded-2xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold">Share Card</h3>
                  <button
                    onClick={() => setShowShareCard(false)}
                    className="text-white/50 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <ShareCard pokemon={pokemon} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </TypeBackground>
  );
};

export default PokemonDetails;
