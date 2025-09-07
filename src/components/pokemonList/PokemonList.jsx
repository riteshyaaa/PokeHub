import React, { useEffect, useState } from "react";
import axios from "axios";
import Pokemon from "../pokemon/pokemon";

const POKEMON_API_URL = "https://pokeapi.co/api/v2/pokemon";
const PokemonList = () => {
  // const [pokemonList, setPokemonList] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [pokeUrl, setPokeUrl] = useState(POKEMON_API_URL);
  // const [prevList, setPrevList] = useState("");
  // const [nextList, setNextList] = useState("");

  const [pokemonListState , setPokemonListState] =  useState({
    pokemonList: [],
    loading: true,
    pokeUrl: POKEMON_API_URL,
    prevList: "",
    nextList: "",
  })

  const fetchPokemon = async () => {
    setPokemonListState(prevState => ({...prevState, loading: true}));
    const response = await axios.get(pokemonListState.pokeUrl);
    // console.log(response.data);
    setPokemonListState(prevList => ({...prevList, prevList: response.data.previous, nextList: response.data.next}));
    
    // console.log(response.data.results);
    const pokemonResults = response.data?.results;
    
    const pokemonResultsPromise = pokemonResults.map((pokemon) =>
      axios.get(pokemon.url),
    );
    const pokemonData = await Promise.all(pokemonResultsPromise);
    // console.log(pokemonData);

    const pokemonDataResult = pokemonData.map((poke) => ({
      id: poke.data.id,
      name: poke.data.name,
      image: poke.data.sprites.front_default,
      types: poke.data.types.map((typeInfo) => typeInfo.type.name).join(", "),
    }));
    // console.log(pokemonDataResult);
    setPokemonListState( prevState => ({...prevState, pokemonList: pokemonDataResult, loading: false}) );
    
  };

  useEffect(() => {
    fetchPokemon();
    
    
  }, [pokemonListState.pokeUrl]);

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
            onClick={() => setPokemonListState( prevState => ({...prevState, pokeUrl: pokemonListState.prevList}))}
          >
            Previous
          </button>
        )}
        {pokemonListState.nextList && (
          <button
            className="bg-blue-500 text-white px-2 py-1  rounded hover:bg-blue-600 shadow-md shadow-blue-700 cursor-pointer"
            onClick={() => setPokemonListState(prevState =>  ({...prevState, pokeUrl: pokemonListState.nextList}))}
          >
            Next
          </button>
        )}
    </div>
    </div>
  );
};
export default PokemonList;
