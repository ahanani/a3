import React, { useState } from "react";
import Results from "./Results";
import Search from "./Search";

function AdminDashboard({ user }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  return (
    <div>
      <Search
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <Results selectedTypes={selectedTypes} user={user} />
    </div>
  );
}

export default AdminDashboard;
