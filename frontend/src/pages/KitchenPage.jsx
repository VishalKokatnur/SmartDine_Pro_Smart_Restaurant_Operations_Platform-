

import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./KitchenPage.css";

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    fetchKitchenData();
  }, []);

  const fetchKitchenData = async () => {
    try {
      const [orderRes, menuRes, tableRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/restaurant/kitchen-orders/"),
        axios.get("http://127.0.0.1:8000/api/restaurant/menu-items/"),
        axios.get("http://127.0.0.1:8000/api/restaurant/tables/"),
      ]);

      setOrders(orderRes.data);
      setMenuItems(menuRes.data);
      setTables(tableRes.data);
    } catch (error) {
      console.log("Kitchen data error", error);
      alert("Failed to load kitchen orders");
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find((t) => Number(t.id) === Number(tableId));
    return table ? table.table_number : tableId;
  };

  const getMenuItemName = (itemId) => {
    const item = menuItems.find((m) => Number(m.id) === Number(itemId));
    return item ? item.name : `Item ${itemId}`;
  };

  const getOrderItems = (order) => {
    if (!order || !Array.isArray(order.items)) return [];

    return order.items.map((item) => {
      if (typeof item === "object") {
        const id = item.id || item.menu_item || item.menu_item_id;
        return getMenuItemName(id);
      }

      return getMenuItemName(item);
    });
  };

  const getStatusText = (status) => {
    if (status === "Preparing") return "Cooking";
    return status;
  };

  const getStatusClass = (status) => {
    if (status === "Pending") return "kitchen-status pending";
    if (status === "Preparing") return "kitchen-status cooking";
    if (status === "Ready") return "kitchen-status ready";
    return "kitchen-status";
  };

  const updateKitchenStatus = async (order, newStatus) => {
    try {
      setLoadingId(order.id);

      await axios.patch(
        `http://127.0.0.1:8000/api/restaurant/kitchen-orders/${order.id}/`,
        {
          status: newStatus,
        }
      );

      if (newStatus === "Preparing") {
        alert(`Order #${order.id} moved to Cooking`);
      } else if (newStatus === "Ready") {
        alert(`Order #${order.id} marked as Ready`);
      }

      fetchKitchenData();
    } catch (error) {
      console.log("Kitchen status update error", error);

      const data = error.response?.data;

      if (data?.status) {
        alert(Array.isArray(data.status) ? data.status[0] : data.status);
      } else if (data?.detail) {
        alert(data.detail);
      } else {
        alert("Failed to update kitchen order");
      }
    } finally {
      setLoadingId(null);
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "Pending");
  const cookingOrders = orders.filter((o) => o.status === "Preparing");
  const readyOrders = orders.filter((o) => o.status === "Ready");

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Kitchen Orders</h1>
            <p>Chef workflow: Pending → Cooking → Ready.</p>
          </div>

          <button className="edit-btn" onClick={fetchKitchenData}>
            Refresh
          </button>
        </div>

        <section className="kitchen-summary-grid">
          <div className="kitchen-summary-card">
            <h2>{pendingOrders.length}</h2>
            <p>Pending Orders</p>
          </div>

          <div className="kitchen-summary-card">
            <h2>{cookingOrders.length}</h2>
            <p>Cooking Orders</p>
          </div>

          <div className="kitchen-summary-card">
            <h2>{readyOrders.length}</h2>
            <p>Ready Orders</p>
          </div>
        </section>

        {orders.length === 0 ? (
          <div className="empty-kitchen-box">No kitchen orders available.</div>
        ) : (
          <div className="kitchen-board">
            {orders.map((order) => (
              <div className="kitchen-card" key={order.id}>
                <div className="kitchen-card-header">
                  <div>
                    <h2>Order #{order.id}</h2>
                    <p>Table {getTableName(order.table)}</p>
                  </div>

                  <span className={getStatusClass(order.status)}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                <div className="kitchen-items">
                  <h3>Items</h3>

                  {getOrderItems(order).map((itemName, index) => (
                    <p key={index}>🍽 {itemName}</p>
                  ))}
                </div>

                <div className="kitchen-actions">
                  {order.status === "Pending" && (
                    <button
                      className="start-cooking-btn"
                      disabled={loadingId === order.id}
                      onClick={() => updateKitchenStatus(order, "Preparing")}
                    >
                      {loadingId === order.id ? "Updating..." : "Start Cooking"}
                    </button>
                  )}

                  {order.status === "Preparing" && (
                    <button
                      className="mark-ready-btn"
                      disabled={loadingId === order.id}
                      onClick={() => updateKitchenStatus(order, "Ready")}
                    >
                      {loadingId === order.id ? "Updating..." : "Mark Ready"}
                    </button>
                  )}

                  {order.status === "Ready" && (
                    <div className="ready-note">
                      Food is ready. Waiter should mark it as Served.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RestaurantLayout>
  );
}

export default KitchenPage;