import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { findSimilarPokemon } from '../../utils/pokemonApi';
import { TYPE_COLORS } from '../../utils/constants';

/**
 * SimilarPokemon - AI-powered "Find Similar Pokémon" section
 * Feature 16: Based on type, stats, body shape
 */
const SimilarPokemon = ({ pokemon }) => {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pokemon) return;
    setLoading(true);
    findSimilarPokemon(pokemon, 5)
      .then((results) => {
        setSimilar(results);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pokemon?.id]);

  if (!pokemon) return null;

  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="text-white font-bold text-lg mb-3">Similar Pokémon</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-24 h-28 bg-white/5 rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (similar.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6"
    >
      <h3 className="text-white font-bold text-lg mb-3">
        🔍 Similar to {pokemon.name}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {similar.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={`/pokemon/${p.id}`}
              className="block bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center transition w-24 flex-shrink-0"
            >
              <img
                src={p.sprite || p.image}
                alt={p.name}
                className="w-14 h-14 mx-auto object-contain"
              />
              <p className="text-white text-[10px] font-medium capitalize mt-1 truncate">
                {p.name}
              </p>
              <div className="flex gap-0.5 justify-center mt-0.5">
                {p.types.map((t) => (
                  <span
                    key={t}
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: TYPE_COLORS[t]?.bg }}
                    title={t}
                  />
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SimilarPokemon;
