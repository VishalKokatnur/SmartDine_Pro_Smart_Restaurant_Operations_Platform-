import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./LowStockPage.css";

function LowStockPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/inventory/low-stock/"
      );

      setItems(response.data);
    } catch (error) {
      console.log("Low stock fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockItems = items.filter((item) => item.status === "Low Stock");
  const outOfStockItems = items.filter((item) => item.status === "Out of Stock");

  return (
    <RestaurantLayout>
      <div className="low-stock-page">
        <div className="low-stock-header">
          <div>
            <h1>Low Stock Alerts</h1>
            <p>Track inventory items that need purchase or restocking.</p>
          </div>

          <button
            className="purchase-btn"
            onClick={() => (window.location.href = "/purchase")}
          >
            Create Purchase
          </button>
        </div>

        <div className="stock-summary-grid">
          <div className="stock-summary-card">
            <h2>{items.length}</h2>
            <p>Total Alerts</p>
          </div>

          <div className="stock-summary-card warning">
            <h2>{lowStockItems.length}</h2>
            <p>Low Stock</p>
          </div>

          <div className="stock-summary-card danger">
            <h2>{outOfStockItems.length}</h2>
            <p>Out of Stock</p>
          </div>
        </div>

        <div className="stock-table-card">
          <div className="table-title-row">
            <h2>Stock Alert List</h2>

            <button className="refresh-stock-btn" onClick={fetchLowStockItems}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="stock-empty-box">Loading stock alerts...</div>
          ) : items.length === 0 ? (
            <div className="stock-empty-box">
              No low stock items found. Inventory is healthy.
            </div>
          ) : (
            <table className="stock-alert-table">
              <thead>
                <tr>
                  
                  <th>Item Name</th>
                  <th>Available Quantity</th>
                  <th>Minimum Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>

                    <td>
                      {item.quantity} {item.unit}
                    </td>

                    <td>
                      {item.minimum_stock} {item.unit}
                    </td>

                    <td>
                      <span
                        className={
                          item.status === "Out of Stock"
                            ? "status-badge danger-badge"
                            : "status-badge warning-badge"
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="small-purchase-btn"
                        onClick={() => (window.location.href = "/purchase")}
                      >
                        Purchase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
          )}
        </div>
      </div>
    </RestaurantLayout>
  );
}

export default LowStockPage;
