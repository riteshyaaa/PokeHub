import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCard from '../ui/AnimatedCard';
import usePokemonList from '../../hooks/usePokemonList';

const POKEMON_API_URL = 'https://pokeapi.co/api/v2/pokemon';

const PokemonList = () => {
  const [pokemonListState, setPokemonListState] = usePokemonList(POKEMON_API_URL);

  return (
    <div className="max-w-full w-full flex flex-col items-center justify-center mt-8">
      <div className="max-w-full w-full flex flex-wrap items-center justify-center gap-6 px-4">
        {pokemonListState.loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-60 h-52 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          pokemonListState.pokemonList.map((poke, index) => (
            <AnimatedCard
              key={poke.id}
              name={poke.name}
              image={poke.image}
              types={poke.types}
              id={poke.id}
              index={index}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 mt-8 mb-8"
      >
        {pokemonListState.prevList && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition"
            onClick={() =>
              setPokemonListState((prevState) => ({
                ...prevState,
                pokeUrl: pokemonListState.prevList,
              }))
            }
          >
            ← Previous
          </motion.button>
        )}
        {pokemonListState.nextList && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition"
            onClick={() =>
              setPokemonListState((prevState) => ({
                ...prevState,
                pokeUrl: pokemonListState.nextList,
              }))
            }
          >
            Next →
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default PokemonList;
