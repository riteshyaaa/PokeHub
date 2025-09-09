import React, { useEffect, useState } from "react";
import axios from "axios";
import Pokemon from "../pokemon/Pokemon";
import usePokemonList from "../../hooks/usePokemonList";

const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon";

const PokemonList = () => {
  const [pokemonListState, setPokemonListState] =
    usePokemonList(POKEMON_API_URL);

  return (
    <div className="max-w-full w-full flex flex-col items-center justify-center mt-10">
      <h1 className="text-2xl font-bold">Pokemon List </h1>
      <div className="max-w-full w-full flex flex-wrap items-center justify-center mt-10 gap-6">
        {pokemonListState.loading ? (
          <p className="text-xl font-semibold mt-6">Loading...</p>
        ) : (
          pokemonListState.pokemonList.map((poke) => (
            <Pokemon
              key={poke.id}
              name={poke.name}
              image={poke.image}
              types={poke.types}
              id={poke.id}
            />
          ))
        )}
      </div>
      <div className="flex items-center justify-center gap-2 mt-4 mb-4">
        {pokemonListState.prevList && (
          <button
            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 shadow-md shadow-blue-700 cursor-pointer"
            onClick={() =>
              setPokemonListState((prevState) => ({
                ...prevState,
                pokeUrl: pokemonListState.prevList,
              }))
            }
          >
            Previous
          </button>
        )}
        {pokemonListState.nextList && (
          <button
            className="bg-blue-500 text-white px-2 py-1  rounded hover:bg-blue-600 shadow-md shadow-blue-700 cursor-pointer"
            onClick={() =>
              setPokemonListState((prevState) => ({
                ...prevState,
                pokeUrl: pokemonListState.nextList,
              }))
            }
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};
export default PokemonList;
