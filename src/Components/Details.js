import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Details({ user }) {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState([]);
  const [userDash, setUserDash] = useState(null);

  const getThreeDigitId = (id) => {
    if (id < 10) return `00${id}`;
    if (id < 100) return `0${id}`;
    return id;
  };

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
          console.log(res.data);
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
    const fetchPokemon = async () => {
      if (user) {
        const response = await axios.get(
          "http://127.0.0.1:5050/api/v1/pokemon",
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
            },
            params: {
              user_id: user.username,
              id: id,
            },
          }
        );
        const poke = response.data;
        setPokemon(poke);
      } else {
        const response = await axios.get(
          "http://127.0.0.1:5050/api/v1/pokemon",
          {
            headers: {
              Authorization: `Bearer ${userDash.access_token}`,
            },
            params: {
              user_id: userDash.username,
              id: id,
            },
          }
        );
        const poke = response.data;
        setPokemon(poke);
      }
    };
    if (user || userDash) fetchPokemon();
  }, [user, userDash]);

  return (
    <>
      {!userDash ? (
        <p>Loading...</p>
      ) : pokemon.length > 0 ? (
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
