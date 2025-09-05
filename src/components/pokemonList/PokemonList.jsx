import React, { useEffect, useState } from "react";
import axios from "axios";
import Pokemon from "../pokemon/pokemon";

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPokemon = async () => {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon");
    const pokemonResults= response.data?.results;
    // console.log(pokemoonResults)

    const pokemonResultsPromise =  pokemonResults.map( (pokemon) =>  axios.get(pokemon.url));
    const pokemonData = await Promise.all(pokemonResultsPromise);
    console.log(pokemonData)

    const res = pokemonData.map( (poke) => ({
      id: poke.data.id,
      name: poke.data.name,
      image: poke.data.sprites.front_default,
      types: poke.data.types.map((typeInfo) => typeInfo.type.name).join(", "),
    }));
    console.log(res)
    setPokemonList(res);
    
      
  }
  
  useEffect(() => {
    fetchPokemon();
    // setPokemon(pokemoonData)
    setLoading(false);
  }, []);

  return (
    <div className="max-w-full w-full flex flex-col items-center justify-center mt-10">
    <h1 className="text-2xl font-bold">Pokemon will be listed here</h1>
    <div className="max-w-full w-full flex flex-wrap items-center justify-center mt-10 gap-6">
    
  
    {loading ? (
      <p className="text-xl font-semibold mt-6">Loading...</p>
    ) :  pokemonList.map((poke) => <Pokemon key={poke.id} name={poke.name} image={poke.image} types={poke.types} />)
}

</div>
  </div>
  
  );
};
export default PokemonList;
