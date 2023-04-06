import React, { useState } from "react";
import axios from "axios";
import { Route, Routes, Navigate, Red } from "react-router-dom";

function Logout({ user }) {
  const [redirect, setRedirect] = useState(false);
  const handleClick = async () => {
    await axios.get("http://127.0.0.1:5040/logout", {
      params: {
        appid: `Bearer ${user.access_token}`,
      },
    });
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
