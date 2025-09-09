import axios from "axios";
import { useEffect, useState } from "react";


function usePokemonList(POKEMON_API_URL) {
    // Hook implementation goes here
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

    return [pokemonListState, setPokemonListState];
}
export default usePokemonList;
