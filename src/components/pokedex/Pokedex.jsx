import React from 'react'
import Search from '../search/Search'
import PokemonList from '../pokemonList/PokemonList'
import Pokemon from '../pokemon/pokemon'

const Pokedex = () => {
  return (
    <div className='bg-gray-100 min-h-screen flex flex-col items-center   '>
        <h1 className='text-4xl font-bold text-center mt-10 tracking-widest'>Pokedex</h1>
        <Search />
        <PokemonList/> 
        
    </div>
  )
}

export default Pokedex