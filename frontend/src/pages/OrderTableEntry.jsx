// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./OrderTableEntry.css";

// function OrderTableEntry() {
//   const [tableNumber, setTableNumber] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleContinue = () => {
//     const trimmed = tableNumber.trim();

//     if (!trimmed) {
//       setError("Please enter your table number.");
//       return;
//     }

//     if (!/^\d+$/.test(trimmed)) {
//       setError("Table number should be numeric.");
//       return;
//     }

//     setError("");
//     // Adjust this route to match wherever your menu page lives
//     navigate(`/order/${trimmed}`);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleContinue();
//     }
//   };

//   return (
//     <div className="order-entry-wrapper">
//       <div className="order-entry-card">
//         <div className="order-entry-logo">SD</div>

//         <h1 className="order-entry-title">SmartDine Pro</h1>
//         <p className="order-entry-tagline">Scan. Select. Savor.</p>

//         <h2 className="order-entry-question">What's your table number?</h2>
//         <p className="order-entry-hint">
//           Check the number printed on your table and enter it below.
//         </p>

//         <input
//           type="text"
//           inputMode="numeric"
//           placeholder="e.g. 12"
//           value={tableNumber}
//           onChange={(e) => setTableNumber(e.target.value)}
//           onKeyDown={handleKeyDown}
//           className="order-entry-input"
//         />

//         {error && <p className="order-entry-error">{error}</p>}

//         <button className="order-entry-button" onClick={handleContinue}>
//           Continue to Menu
//         </button>
//       </div>
//     </div>
//   );
// }

// export default OrderTableEntry;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OrderTableEntry.css";

const API_BASE = "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant";

function OrderTableEntry() {
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleContinue = async () => {
    const trimmed = tableNumber.trim();

    if (!trimmed) {
      setError("Please enter your table number.");
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      setError("Table number should be numeric.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Look up the REAL internal table id from the table number the
      // customer typed. Table number (the label printed on the table)
      // and the database id are not guaranteed to match, so we must
      // resolve it through the backend instead of assuming they're equal.
      const response = await axios.get(
        `${API_BASE}/public/table-lookup/${encodeURIComponent(trimmed)}/`
      );

      navigate(`/order/${response.data.id}`);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not find that table. Please check the number and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleContinue();
    }
  };

  return (
    <div className="order-entry-wrapper">
      <div className="order-entry-card">
        <div className="order-entry-logo">SD</div>

        <h1 className="order-entry-title">SmartDine Pro</h1>
        <p className="order-entry-tagline">Scan. Select. Savor.</p>

        <h2 className="order-entry-question">What's your table number?</h2>
        <p className="order-entry-hint">
          Check the number printed on your table and enter it below.
        </p>

        <input
          type="text"
          inputMode="numeric"
          placeholder="e.g. 12"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          onKeyDown={handleKeyDown}
          className="order-entry-input"
          disabled={loading}
        />

        {error && <p className="order-entry-error">{error}</p>}

        <button
          className="order-entry-button"
          onClick={handleContinue}
          disabled={loading}
        >
          {loading ? "Checking..." : "Continue to Menu"}
        </button>
      </div>
    </div>
  );
}

export default OrderTableEntry;