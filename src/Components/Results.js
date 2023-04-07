import React, { useEffect, useState } from "react";
import Page from "./Page";
import Pagination from "./Pagination";
import axios from "axios";
import Logout from "./Logout";

function Results({ selectedTypes, user }) {
  const [pokemons, setPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(10);

  const indexOfLastRecord = currentPage * pokemonsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - pokemonsPerPage;
  const currentPokemons = pokemons.slice(indexOfFirstRecord, indexOfLastRecord);
  const numberOfPages = Math.ceil(pokemons.length / pokemonsPerPage);
  const [userDash, setUserDash] = useState(null);
  useEffect(() => {
    if (!user) {
      const getUser = async () => {
        console.log("this happens");
        try {
          const res = await axios.get("http://127.0.0.1:5040/user", {
            params: {
              id: localStorage.getItem("user"),
            },
          });
          setUserDash(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      getUser();
    } else {
      setUserDash(user);
    }
  }, [user]);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        const response = await axios.get(
          "http://127.0.0.1:5050/api/v1/allPokemons",
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
            params: {
              user_id: user.username,
            },
          }
        );
        const pokemons = response.data.filter((pokemon) =>
          selectedTypes.every((type) => pokemon.type.includes(type))
        );
        setPokemons(pokemons);
      } else {
        const response = await axios.get(
          "http://127.0.0.1:5050/api/v1/allPokemons",
          {
            headers: {
              Authorization: `Bearer ${userDash.access_token}`,
            },
            params: {
              user_id: userDash.username,
            },
          }
        );
        const pokemons = response.data.filter((pokemon) =>
          selectedTypes.every((type) => pokemon.type.includes(type))
        );
        setPokemons(pokemons);
      }
    }
    if (user || userDash) fetchData();
  }, [selectedTypes, userDash]);

  return (
    <div>
      {!userDash ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Page currentPokemons={currentPokemons} currentPage={currentPage} />
          <Pagination
            numberOfPages={numberOfPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
          <Logout user={userDash} />
        </div>
      )}
    </div>
  );
}

export default Results;
