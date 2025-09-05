import React from "react";

const Pokemon = (props) => {
  const { name, image, types } = props;
  return (
   
   <div className="   ">
    <div className="border-2 border-gray-300 rounded-xl p-4 text-lg w-60 shadow-md hover:shadow-lg transition  flex justify-center items-center ">
      

      <img src={image} alt={name} className="w-24 h-24 object-contain " />
    </div>
    <div  className="flex  items-center justify-center">
    <p className=" font-semibold mr-2 inline-block mt-1  text-sm bg-green-400 rounded-full px-2 items-center shadow-md shadow-emerald-700 "> {name}</p>
      <p className=" mt-1 text-sm inline-block font-semibold bg-violet-500  rounded-full  px-2  items-center shadow-md  shadow-fuchsia-300 ">
        {types}
      </p>
      </div>
    
    </div>
  );
};

export default Pokemon;
