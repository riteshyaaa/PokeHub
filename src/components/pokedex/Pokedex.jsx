import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Search from '../search/Search';
import PokemonList from '../pokemonList/PokemonList';
import PokemonDetails from '../pokemonDetails/PokemonDetails';

const Pokedex = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 w-full flex flex-col items-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mt-6 mb-2"
      >
        <p className="text-gray-500 text-sm">
          Explore, discover, and catch 'em all!
        </p>
      </motion.div>

      <Search updateSearch={setSearchTerm} />

      {!searchTerm ? (
        <PokemonList />
      ) : (
        <div className="mt-6 w-full">
          <PokemonDetails key={searchTerm} PokemonName={searchTerm.toLowerCase()} />
        </div>
      )}
    </div>
  );
};

export default Pokedex;
