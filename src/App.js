import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./Components/Landing";
import Details from "./Components/Details";
import AdminDashboard from "./Components/AdminDashboard";
import UserDashboard from "./Components/UserDashboard";

function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Landing setUserForApp={setUser} />} />
        <Route path="/details/:id" element={<Details user={user} />} />
        <Route
          path="/userDashboard"
          element={<UserDashboard user={user} />}
        />
        <Route
          path="/adminDashboard"
          element={<AdminDashboard user={user} />}
        />
      </Routes>
    </>
  );
}

export default App;
