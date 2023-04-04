import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Details({ user }) {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState([]);

  const getThreeDigitId = (id) => {
    if (id < 10) return `00${id}`;
    if (id < 100) return `0${id}`;
    return id;
  };

  useEffect(() => {
    const fetchPokemon = async () => {
      const response = await axios.get("http://127.0.0.1:5050/api/v1/pokemon", {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        params: {
          user_id: user.username,
          id: id,
        },
      });
      const poke = response.data;
      console.log(poke);
      setPokemon(poke);
    };
    fetchPokemon();
  }, []);

  return (
    <>
      {pokemon.length > 0 ? (
        <div>
          <p>ID: {pokemon[0].id}</p>
          <p>Name: {pokemon[0].name.english}</p>
          <p>
            Type:{" "}
            {pokemon[0].type.map((t) => (
              <span>{t}, </span>
            ))}
          </p>
          <p>HP: {pokemon[0].base.HP}</p>
          <p>Attack: {pokemon[0].base.Attack}</p>
          <p>Sp. Attack: {pokemon[0].base["Speed Attack"]}</p>
          <p>Sp. Defense: {pokemon[0].base["Speed Defense"]}</p>
          <p>Speed: {pokemon[0].base.Speed}</p>
          <img
            alt={pokemon[0].name.english}
            src={`https://github.com/fanzeyi/pokemon.json/raw/master/images/${getThreeDigitId(
              id
            )}.png`}
          />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
}

export default Details;
