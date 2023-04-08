import React, { useState } from "react";
import axios from "axios";
import { Route, Routes, Navigate } from "react-router-dom";

function Logout({ user }) {
  const [redirect, setRedirect] = useState(false);
  const handleClick = async () => {
    await axios.get("https://a3-mfym.onrender.com/logout", {
      params: {
        appid: `Bearer ${user.access_token}`,
      },
    });
    localStorage.removeItem("user");
    setRedirect(true);
  };

  return (
    <div>
      <button onClick={handleClick}>Logout</button>
      {redirect && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

export default Logout;
