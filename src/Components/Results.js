import React, { useEffect, useState } from "react";
import Page from "./Page";
import Pagination from "./Pagination";
import axios from "axios";
import { Route, Routes, Navigate } from "react-router-dom";
import Logout from "./Logout";

function Results({ selectedTypes, user }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(10);

  const indexOfLastRecord = currentPage * pokemonsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
  const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord);
  const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);

  useEffect(() => {
    async function fetchData() {
      const response = await axios.get(
        "http://127.0.0.1:5050/api/v1/allPokemons",
        {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
          params: {
            user_id: user.username
          },
        }
      );
      const pokemons = response.data.filter((pokemon) =>
        selectedTypes.every((type) => pokemon.type.includes(type))
      );
      setPokemons(pokemons);
    }
    if (user) fetchData();
  }, [selectedTypes]);

  return (
    <div>
      {!user && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      )}
      <Page currentPokemons={currentPokemons} currentPage={currentPage} />
      <Pagination
        numberOfPages={numberOfPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <Logout user={user} />
    </div>
  );
}

export default Results;
