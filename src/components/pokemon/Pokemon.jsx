import React from "react";
import { Link } from "react-router-dom";

const Pokemon = (props) => {
  const { name, image, types, id } = props;
  return (
    <div>
      <div className="border-2 border-gray-300 rounded-xl p-4 text-lg w-60 shadow-md hover:shadow-lg transition  flex justify-center items-center ">
        
        <Link to = {`/pokemon/${id}`}><img src={image} alt={name} className="w-28 h-30  " />
        </Link>
      </div>
      <div className="flex  items-center justify-center">
        <p className=" font-semibold mr-2 inline-block mt-1  text-sm bg-green-400 rounded-full px-2 items-center shadow-md shadow-emerald-700 ">
          {" "}
          {name}
        </p>
        <p className=" mt-1 text-sm inline-block font-semibold bg-violet-500  rounded-full  px-2  items-center shadow-md  shadow-fuchsia-500">
          {types}
        </p>
      </div>
    </div>
  );
};

export default Pokemon;
