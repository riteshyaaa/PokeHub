import React, { useEffect, useState } from "react";
import axios from "axios";

const PokemonList = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPokemon = async () => {
    const response = await axios.get("https://pokeapi.co/api/v2/pokemon");
    const pokemoonData = response.data?.results;

    pokemoonData.map(async (pokemon) => {
      const response = await axios.get(pokemon.url);
      const data = response.data;
      const pokemonName = response.data.name;
      const pokemonId = response.data.id;
      const pokemonImage = response.data.sprites.front_shiny;

      console.log(response.data.name);
      console.log(response.data.id);
      console.log(response.data.sprites.front_shiny);

      setPokemon((prev) => [
        ...prev,
        {
          name: pokemonName,
          id: pokemonId,
          image: pokemonImage,
        },
      ]);
    });
  };
  useEffect(() => {
    fetchPokemon();
    // setPokemon(pokemoonData)
    setLoading(false);
  }, []);

  return (
    <div className="max-w-full w-full flex flex-col items-center justify-center mt-10">
    <h1 className="text-2xl font-bold">Pokemon will be listed here</h1>
  
    {loading ? (
      <p className="text-xl font-semibold mt-6">Loading...</p>
    ) : (
      <div className="max-w-full flex flex-wrap items-center justify-center gap-6 mt-10">
        {pokemon.map((poke) => (
          <div
            key={poke.id}
            className="border-2 border-gray-300 rounded-xl p-4 text-lg w-48 shadow-md hover:shadow-lg transition flex flex-col items-center"
          >
            <p className="mb-2 font-semibold">{poke.name}</p>
            <img
              src={poke.image}
              alt={poke.name}
              className="w-24 h-24 object-contain"
            />
          </div>
        ))}
      </div>
    )}
  </div>
  
  );
};
export default PokemonList;
