import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'


const PokemonDetails = () => {
  const [loading , setLoading] =useState( true)
  const [pokemonDetails , setPokemonDetails] = useState (null)
  const {id} =  useParams()

  const fetchPokemonDetails = async () => {
    setLoading(true);
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`);
    console.log(response.data);
    const pokemonDetails = {
      id: response.data.id,
      name: response.data.name,
      image: response.data.sprites.front_default,
      types: response.data.types.map((typeInfo) => typeInfo.type.name).join(", "),
      height: response.data.height,
      weight: response.data.weight,
      abilities: response.data.abilities.map((abilityInfo) => abilityInfo.ability.name).join(", "),
      stats: response.data.stats.map((statInfo) => ({
        name: statInfo.stat.name,
        value: statInfo.base_stat,
      })),
    };
    setPokemonDetails(pokemonDetails);
    setLoading(false);
  
  };
  useEffect(() => {
    fetchPokemonDetails();
 

  },[] )

  return (
 <div> 
    {loading ? (
      <p className="text-xl font-semibold mt-6">Loading...</p>
    ) : pokemonDetails ? (
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl mt-10">
        <div className="md:flex">
          <div className="md:flex-shrink-0  my-auto">
            <img
              className="h-48 w-full object-cover md:h-40 md:w-40"
              src={pokemonDetails.image}
              alt={pokemonDetails.name}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              {pokemonDetails.name} (ID: {pokemonDetails.id})
            </div>
            <p className="mt-2 text-gray-500">Types: {pokemonDetails.types}</p>
            <p className="mt-2 text-gray-500">Height: {pokemonDetails.height}</p>
            <p className="mt-2 text-gray-500">Weight: {pokemonDetails.weight}</p>
            <p className="mt-2 text-gray-500">Abilities: {pokemonDetails.abilities}</p>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">Stats:</h3>
              <ul className="list-disc list-inside">
                {pokemonDetails.stats.map((stat) => (
                  <li key={stat.name} className="text-gray-500">
                    {stat.name}: {stat.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <p className="text-xl font-semibold mt-6">No details available.</p>
    )}
 </div>
  )
}

export default PokemonDetails