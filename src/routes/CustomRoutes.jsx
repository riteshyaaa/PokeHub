import React from "react";
import { Route, Routes } from "react-router-dom";
import PokemonDetails from "../components/pokemonDetails/PokemonDetails.jsx";
import Pokedex from "../components/pokedex/Pokedex.jsx";

const CustomRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Pokedex />} />
      <Route path="/pokemon/:id" element={<PokemonDetails />} />
    </Routes>
  );
};

export default CustomRoutes;
