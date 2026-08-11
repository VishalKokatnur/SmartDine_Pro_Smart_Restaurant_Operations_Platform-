import { useEffect, useState } from "react";
import axios from "axios";
import "./TableHeatMapPage.css";
function TableHeatMapPage() {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    axios
      .get("https://smartdine-pro-smart-restaurant.onrender.com/api/tables/")
      .then((res) => setTables(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div>
      <h1>Live Table Heat Map</h1>

      <div className="table-grid">
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${table.status.toLowerCase()}`}
          >
            <h3>{table.table_number}</h3>
            <p>{table.status}</p>
            <small>{table.capacity} Seats</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableHeatMapPage;