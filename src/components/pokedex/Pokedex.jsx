import React from "react";
import Search from "../search/Search";
import PokemonList from "../pokemonList/PokemonList";


const Pokedex = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center   ">
     
      <Search />
      <PokemonList />
    </div>
  );
};

export default Pokedex;
