import React from "react";
import Details from "./Details";
import { Routes, Route } from "react-router-dom";


function PokemonRoutes() {
    return (
      <Routes>
        <Route path="/details/:id" element={<Details />} />
      </Routes>
    );
}

export default PokemonRoutes;
