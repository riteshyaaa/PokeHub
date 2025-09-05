import React from 'react'

const Search = () => {
  return (
    <div className = 'max-w-full w-full flex  items-center justify-center  mt-10'>
        
        <input type= "text" placeholder='Search for a pokemon' className = 'border-2 border-gray-300 rounded-md p-2 text-2xl max-h-20  w-[50%] focus:outline-none  shadow-md shadow-black-500/50 hover:shadow-black-600/50' >
        </input>
        <button 
        className = 'bg-blue-500 text-white rounded-md p-2 ml-2 text-2xl text-center cursor-pointer hover:bg-blue-600 transition-all duration-300 ease-in-out shadow-md shadow-blue-500/50 hover:shadow-blue-600/50 items-center'>Search</button>
    </div>
  )
}

export default Search