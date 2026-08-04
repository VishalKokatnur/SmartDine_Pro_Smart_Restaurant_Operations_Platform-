
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/inventory/items/");
    setItems(res.data);
  };

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendor_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Inventory Management</h1>
            <p>Stock is managed automatically based on restaurant orders.</p>
          </div>

          <button className="add-btn" onClick={fetchInventory}>
            Refresh Stock
          </button>
        </div>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search inventory by item, category or vendor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              
              <th>Item</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Low Limit</th>
              <th>Vendor</th>
              <th>Purchase</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredItems.map((item) => {
              const isLowStock =
                Number(item.quantity) <= Number(item.low_stock_limit);

              return (
                <tr key={item.id}>
                  <td className="item-name">📦 {item.name}</td>                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td>
                    {item.quantity} {item.unit}
                  </td>
                  <td>
                    {item.low_stock_limit} {item.unit}
                  </td>
                  <td>{item.vendor_name || "-"}</td>
                  <td className="price">₹{item.purchase_price}</td>
                  <td>
                    {isLowStock ? (
                      <span className="not-available">Low Stock</span>
                    ) : (
                      <span className="available">In Stock</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </RestaurantLayout>
  );
}

export default InventoryPage;
