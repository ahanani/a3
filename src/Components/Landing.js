import React, { useState } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";

function Landing({ setUserForApp }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5040/login", {
        username: username,
        password: password,
      });
      setUser(res.data);
      setUserForApp(res.data);
      localStorage.setItem("user", res.data.username);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      {!user && (
        <form onSubmit={handleSubmit}>
          <span>Login</span>
          <br />
          <input
            type="text"
            placeholder="username"
            onChange={(e) => setUsername(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button type="submit">Login</button>
        </form>
      )}
      {user && user.role === "user" && (
        <Routes>
          <Route path="/" element={<Navigate to="/userDashboard" />} />
        </Routes>
      )}
      {user && user.role === "admin" && (
        <Routes>
          <Route path="/" element={<Navigate to="/adminDashboard" />} />
        </Routes>
      )}
    </div>
  );
}

export default Landing;
