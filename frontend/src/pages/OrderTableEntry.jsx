import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OrderTableEntry.css";

function OrderTableEntry() {
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
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
    // Adjust this route to match wherever your menu page lives
    navigate(`/order/${trimmed}`);
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
        />

        {error && <p className="order-entry-error">{error}</p>}

        <button className="order-entry-button" onClick={handleContinue}>
          Continue to Menu
        </button>
      </div>
    </div>
  );
}

export default OrderTableEntry;