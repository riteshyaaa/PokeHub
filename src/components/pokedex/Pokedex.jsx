import React, { useEffect, useState } from "react";
import Search from "../search/Search";
import PokemonList from "../pokemonList/PokemonList";
import PokemonDetails from "../pokemonDetails/PokemonDetails";


const Pokedex = () => { 
  const [searchTerm, setSearchTerm] =  useState("");

  

  return (
    <div className="bg-gray-100 max-w-full w-full min-h-screen flex flex-col items-center   ">
     
      <Search updateSearch= {setSearchTerm} />
      { !searchTerm ? <PokemonList /> : <PokemonDetails key={ searchTerm} PokemonName={searchTerm.toLowerCase()} /> }
     
    </div>
  );
};

export default Pokedex;
