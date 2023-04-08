import React from "react";
import { Link } from "react-router-dom";

function Pokemon({ pokemon }) {
  const getThreeDigitId = (id) => {
    if (id < 10) return `00${id}`;
    if (id < 100) return `0${id}`;
    return id;
  };

  return (
    <>
      <Link to={"/details/" + pokemon.id}>
        <img
          id={pokemon.id}
          alt={pokemon.name.english}
          src={`https://github.com/fanzeyi/pokemon.json/raw/master/images/${getThreeDigitId(
            pokemon.id
          )}.png`}
        />
      </Link>
    </>
  );
}

export default Pokemon;
