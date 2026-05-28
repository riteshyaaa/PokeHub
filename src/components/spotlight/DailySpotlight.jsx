import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchPokemon, fetchPokemonSpecies, parsePokemonData, getDailyPokemonId } from '../../utils/pokemonApi';
import { TYPE_COLORS, STAT_NAMES } from '../../utils/constants';
import StatRadarChart from '../ui/StatRadarChart';
import Typewriter from '../ui/Typewriter';
import TypeBackground from '../ui/TypeBackground';

/**
 * DailySpotlight - Pokémon of the Day with fun facts, stats, and trivia
 * Feature 12: Changes every 24 hours via seed-based randomization
 */
const DailySpotlight = () => {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flavorText, setFlavorText] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const dailyId = getDailyPokemonId();
      try {
        const [data, speciesData] = await Promise.all([
          fetchPokemon(dailyId),
          fetchPokemonSpecies(dailyId),
        ]);
        const parsed = parsePokemonData(data);
        setPokemon(parsed);
        setSpecies(speciesData);

        // Get English flavor text
        const entry = speciesData.flavor_text_entries?.find(
          (e) => e.language.name === 'en'
        );
        setFlavorText(
          entry?.flavor_text?.replace(/\f|\n|\r/g, ' ') || 'No Pokédex entry available.'
        );
      } catch (err) {
        console.error('Failed to load daily Pokemon:', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-yellow-400 rounded-full animate-spin mx-auto" />
          <p className="text-white/50 mt-4">Loading today's spotlight...</p>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white/50">Failed to load daily Pokémon</p>
      </div>
    );
  }

  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus || '';
  const habitat = species?.habitat?.name || 'unknown';
  const captureRate = species?.capture_rate || 0;
  const baseHappiness = species?.base_happiness || 0;
  const growthRate = species?.growth_rate?.name || '';
  const isLegendary = species?.is_legendary;
  const isMythical = species?.is_mythical;

  return (
    <TypeBackground types={pokemon.types} className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <p className="text-white/60 text-sm font-medium">
            ⭐ POKÉMON OF THE DAY ⭐
          </p>
          <p className="text-white/40 text-xs mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="bg-black/30 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Image + Basic Info */}
            <div className="text-center">
              {(isLegendary || isMythical) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-block mb-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                >
                  {isLegendary ? '🌟 Legendary' : '✨ Mythical'}
                </motion.div>
              )}

              <motion.img
                src={pokemon.image}
                alt={pokemon.name}
                className="w-48 h-48 md:w-56 md:h-56 mx-auto object-contain drop-shadow-2xl"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
              />

              <h1 className="text-3xl font-bold text-white capitalize mt-4">{pokemon.name}</h1>
              <p className="text-white/50 text-sm">#{String(pokemon.id).padStart(3, '0')} — {genus}</p>

              <div className="flex gap-2 justify-center mt-3">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 rounded-full text-sm font-medium capitalize"
                    style={{ backgroundColor: TYPE_COLORS[type]?.bg, color: TYPE_COLORS[type]?.text }}
                  >
                    {type}
                  </span>
                ))}
              </div>

              <Link
                to={`/pokemon/${pokemon.id}`}
                className="inline-block mt-4 text-sm text-blue-300 hover:text-blue-200 underline"
              >
                View Full Details →
              </Link>
            </div>

            {/* Right: Details */}
            <div className="space-y-5">
              {/* Pokédex Entry */}
              <div>
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Pokédex Entry
                </h3>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <Typewriter
                    text={flavorText}
                    speed={25}
                    className="text-white/80 text-sm italic leading-relaxed"
                  />
                </div>
              </div>

              {/* Quick Facts */}
              <div>
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Quick Facts
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Fact label="Height" value={`${(pokemon.height / 10).toFixed(1)}m`} />
                  <Fact label="Weight" value={`${(pokemon.weight / 10).toFixed(1)}kg`} />
                  <Fact label="Habitat" value={habitat} />
                  <Fact label="Catch Rate" value={`${captureRate}/255`} />
                  <Fact label="Happiness" value={baseHappiness} />
                  <Fact label="Growth" value={growthRate.replace('-', ' ')} />
                </div>
              </div>

              {/* Abilities */}
              <div>
                <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-2">
                  Abilities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pokemon.abilities.map((ability) => (
                    <span
                      key={ability}
                      className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full capitalize border border-white/10"
                    >
                      {ability.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stat Radar Chart */}
          <div className="mt-8">
            <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wide mb-3 text-center">
              Base Stats
            </h3>
            <div className="max-w-md mx-auto">
              <StatRadarChart pokemon1Stats={pokemon.stats} pokemon1Name={pokemon.name} />
            </div>
          </div>
        </motion.div>
      </div>
    </TypeBackground>
  );
};

const Fact = ({ label, value }) => (
  <div className="bg-white/5 rounded-lg p-2 border border-white/5">
    <p className="text-white/40 text-[10px] uppercase">{label}</p>
    <p className="text-white font-medium text-sm capitalize">{value}</p>
  </div>
);

export default DailySpotlight;
