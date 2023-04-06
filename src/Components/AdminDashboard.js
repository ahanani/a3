import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BarChart, Bar, Cell } from "recharts";
import { Route, Routes, Navigate } from "react-router-dom";

function AdminDashboard({ user }) {
  const [report, setReport] = useState();
  const [activeIndexDetails, setActiveIndexDetails] = useState(0);
  const [activeItemDetails, setActiveItemDetails] = useState({});
  const [activeIndexAll, setActiveIndexAll] = useState(0);
  const [activeItemAll, setActiveItemAll] = useState({});

  useEffect(() => {
    const fetchReport = async () => {
      const response = await axios.get("http://127.0.0.1:5050/report", {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
        },
        params: {
          user_id: user.username,
        },
      });
      const report = response.data;
      setReport(report);
      setActiveItemDetails(report[activeIndexDetails]);
      setActiveItemAll(report[activeIndexAll]);
    };
    if (user) fetchReport();
  }, [activeIndexDetails, activeIndexAll, user]);

  useEffect(() => {
    if (report && report.length > 0) {
      setActiveItemDetails(report[activeIndexDetails]);
    }
  }, [activeIndexDetails, report]);

  useEffect(() => {
    if (report && report.length > 0) {
      setActiveItemAll(report[activeIndexAll]);
    }
  }, [activeIndexAll, report]);

  const handleClickDetails = useCallback(
    (entry: any, index: number) => {
      setActiveIndexDetails(index);
    },
    [setActiveIndexDetails]
  );

  const handleClickAll = useCallback(
    (entry: any, index: number) => {
      setActiveIndexAll(index);
    },
    [setActiveIndexAll]
  );

  return (
    <div>
      {!user && (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      )}
      {report ? (
        <div>
          <div>
            <p>
              Click Each Rectangle To See Details Pokemon Visits of Each User{" "}
            </p>
            <BarChart width={400} height={250} data={report}>
              <Bar dataKey="pokemon_details_visit" onClick={handleClickDetails}>
                {report.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={index === activeIndexDetails ? "#58508d" : "#bc5090"}
                    key={`cell-${index}`}
                  />
                ))}
              </Bar>
            </BarChart>
            {activeItemDetails ? (
              <p className="content">{`details Pokemon visit of ${activeItemDetails.user}: ${activeItemDetails.pokemon_details_visit}`}</p>
            ) : (
              <p>Loading label...</p>
            )}
          </div>
          <div>
            <p>Click Each Rectangle To See All Pokemon Visits of Each User </p>
            <BarChart width={400} height={250} data={report}>
              <Bar dataKey="all_pokemons_visit" onClick={handleClickAll}>
                {report.map((entry, index) => (
                  <Cell
                    cursor="pointer"
                    fill={index === activeIndexAll ? "#ff6361" : "#ffa600"}
                    key={`cell-${index}`}
                  />
                ))}
              </Bar>
            </BarChart>
            {activeItemAll ? (
              <p className="content">{`All Pokemon visits of ${activeItemAll.user}: ${activeItemAll.all_pokemons_visit}`}</p>
            ) : (
              <p>Loading label...</p>
            )}
          </div>
        </div>
      ) : (
        <p>Loading report...</p>
      )}
    </div>
  );
}

export default AdminDashboard;
