import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getDiscoveredPokemon } from '../../utils/localStorage';
import { GENERATIONS, TOTAL_POKEMON } from '../../utils/constants';

/**
 * CompletionTracker - Pokédex completion progress with badges
 * Feature 13: Progress bar, badge system, localStorage persistence
 */
const CompletionTracker = () => {
  const [discovered, setDiscovered] = useState([]);

  useEffect(() => {
    setDiscovered(getDiscoveredPokemon());
  }, []);

  const totalDiscovered = discovered.length;
  const overallPercentage = Math.round((totalDiscovered / TOTAL_POKEMON) * 100);

  // Calculate per-generation progress
  const genProgress = Object.entries(GENERATIONS).map(([gen, info]) => {
    const genPokemon = discovered.filter((id) => id >= info.start && id <= info.end);
    const total = info.end - info.start + 1;
    const percentage = Math.round((genPokemon.length / total) * 100);
    const isComplete = genPokemon.length === total;
    return {
      gen: parseInt(gen),
      name: info.name,
      discovered: genPokemon.length,
      total,
      percentage,
      isComplete,
    };
  });

  // Badge definitions
  const badges = [
    { name: 'First Discovery', description: 'Discover your first Pokémon', condition: totalDiscovered >= 1, icon: '🥚' },
    { name: 'Novice Trainer', description: 'Discover 10 Pokémon', condition: totalDiscovered >= 10, icon: '🎒' },
    { name: 'Rising Star', description: 'Discover 50 Pokémon', condition: totalDiscovered >= 50, icon: '⭐' },
    { name: 'Pokémon Collector', description: 'Discover 100 Pokémon', condition: totalDiscovered >= 100, icon: '🏆' },
    { name: 'Master Explorer', description: 'Discover 250 Pokémon', condition: totalDiscovered >= 250, icon: '🌟' },
    { name: 'Pokédex Pro', description: 'Discover 500 Pokémon', condition: totalDiscovered >= 500, icon: '💎' },
    { name: 'Living Dex', description: 'Discover all 1025 Pokémon', condition: totalDiscovered >= TOTAL_POKEMON, icon: '👑' },
    ...genProgress.filter((g) => g.isComplete).map((g) => ({
      name: `${g.name} Master`,
      description: `Complete the ${g.name} Pokédex`,
      condition: true,
      icon: '🏅',
    })),
  ];

  const earnedBadges = badges.filter((b) => b.condition);
  const lockedBadges = badges.filter((b) => !b.condition);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900/20 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            📖 Pokédex Tracker
          </h1>
          <p className="text-white/50">Track your Pokémon discovery progress</p>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">Overall Progress</h2>
            <span className="text-white/60 text-sm">
              {totalDiscovered} / {TOTAL_POKEMON}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${overallPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-white/40 text-sm mt-2 text-center">{overallPercentage}% Complete</p>

          {totalDiscovered === 0 && (
            <p className="text-white/30 text-sm text-center mt-4 italic">
              Start exploring Pokémon details to track your progress!
            </p>
          )}
        </motion.div>

        {/* Generation Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6"
        >
          <h2 className="text-white font-bold mb-4">Generation Progress</h2>
          <div className="space-y-3">
            {genProgress.map((gen) => (
              <div key={gen.gen} className="flex items-center gap-3">
                <div className="w-24 text-right">
                  <span className="text-white/60 text-xs font-medium">
                    Gen {gen.gen}
                  </span>
                  <span className="text-white/30 text-[10px] block">{gen.name}</span>
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      gen.isComplete
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-400'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-400'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${gen.percentage}%` }}
                    transition={{ duration: 0.8, delay: gen.gen * 0.1 }}
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-white/50 text-xs">
                    {gen.discovered}/{gen.total}
                  </span>
                </div>
                {gen.isComplete && <span className="text-yellow-400">✓</span>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h2 className="text-white font-bold mb-4">
            Badges ({earnedBadges.length}/{badges.length})
          </h2>

          {/* Earned Badges */}
          {earnedBadges.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {earnedBadges.map((badge, i) => (
                <motion.div
                  key={badge.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-center"
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <p className="text-white text-xs font-bold mt-1">{badge.name}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Locked Badges */}
          {lockedBadges.length > 0 && (
            <>
              <h3 className="text-white/40 text-sm mb-2">Locked:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.name}
                    className="bg-white/[0.02] border border-white/5 rounded-xl p-3 text-center opacity-50"
                  >
                    <span className="text-2xl grayscale">🔒</span>
                    <p className="text-white/30 text-xs font-medium mt-1">{badge.name}</p>
                    <p className="text-white/20 text-[10px] mt-0.5">{badge.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CompletionTracker;
