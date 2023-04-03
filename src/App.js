import React, { useState } from "react";
import Results from "./Components/Results";
import Search from "./Components/Search";
import PokemonRoutes from "./Components/PokemonRoutes";

function App() {
  const [selectedTypes, setSelectedTypes] = useState([]);

  return (
    <>
      <PokemonRoutes />
      <Search
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <Results selectedTypes={selectedTypes} />
    </>
  );
}

export default App;
