import React, { useState } from "react";
import useDebounce from "../../hooks/useDebounce";

const Search = ({updateSearch} ) => {
  // const [inputValue, setInputValue] = useState("");
  const debouncedUpdateSearch = useDebounce(updateSearch, 2000);
  const handleChange = (e) => {
    // setInputValue(e.target.value);
    debouncedUpdateSearch(e.target.value);
  };

  
 
  
  return (
    <div className="max-w-full w-full flex  items-center justify-center  mt-10">
      <input
        type="text"
        placeholder="Search for a pokemon ..."
        className="border-2 border-gray-300 rounded-md p-2 text-2xl max-h-20  w-[50%] focus:outline-none  shadow-md shadow-black-500/50 hover:shadow-black-600/50"
        onChange={handleChange}
      ></input>
      <div>
      
      </div>
     
    </div>
  );
};

export default Search;
