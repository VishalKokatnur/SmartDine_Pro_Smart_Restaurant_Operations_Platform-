// import { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import RestaurantLayout from "../layouts/RestaurantLayout";
// import "./OrdersPage.css";

// function ProductImage({ item, getItemImage }) {
//   const [imgFailed, setImgFailed] = useState(false);

//   const hasRealImage =
//     item.image || item.image_url || item.photo || item.photo_url;

//   const wrapperStyle = {
//     height: "140px",
//     width: "100%",
//     position: "relative",
//     overflow: "hidden",
//     background: "#1c1f18",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderTopLeftRadius: "20px",
//     borderTopRightRadius: "20px",
//   };

//   const badgeStyle = {
//     position: "absolute",
//     top: "12px",
//     left: "12px",
//     background: "#ffffff",
//     color: "#0b4a3f",
//     padding: "6px 10px",
//     borderRadius: "999px",
//     fontSize: "12px",
//     fontWeight: 850,
//   };

//   if (!hasRealImage || imgFailed) {
//     return (
//       <div style={wrapperStyle}>
//         <span style={{ fontSize: "40px" }}>🍽️</span>
//         <span style={badgeStyle}>
//           {item.available === false ? "Unavailable" : "Available"}
//         </span>
//       </div>
//     );
//   }

//   return (
//     <div style={wrapperStyle}>
//       <img
//         src={getItemImage(item)}
//         alt={item.name}
//         onError={() => setImgFailed(true)}
//         style={{ width: "100%", height: "100%", objectFit: "cover" }}
//       />
//       <span style={badgeStyle}>
//         {item.available === false ? "Unavailable" : "Available"}
//       </span>
//     </div>
//   );
// }

// function ProductCard({ item, isSelected, onToggle, formatMoney }) {
//   const cardStyle = {
//     background: "#0c0e0b",
//     border: isSelected
//       ? "1px solid rgba(224, 182, 79, 0.7)"
//       : "1px solid rgba(224, 182, 79, 0.16)",
//     borderRadius: "20px",
//     overflow: "hidden",
//     cursor: item.available === false ? "not-allowed" : "pointer",
//     opacity: item.available === false ? 0.55 : 1,
//     boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
//     display: "flex",
//     flexDirection: "column",
//   };

//   const infoStyle = {
//     padding: "16px",
//     display: "flex",
//     flexDirection: "column",
//     gap: "10px",
//   };

//   return (
//     <div style={cardStyle} onClick={onToggle}>
//       <ProductImage item={item} getItemImage={item.__getItemImage} />

//       <div style={infoStyle}>
//         <h3
//           style={{
//             margin: 0,
//             color: "#ffffff",
//             fontSize: "17px",
//             fontWeight: 950,
//           }}
//         >
//           {item.name}
//         </h3>

//         <p
//           style={{
//             margin: 0,
//             color: "#928b7a",
//             fontWeight: 650,
//             textTransform: "capitalize",
//             fontSize: "13px",
//           }}
//         >
//           {item.category || "Restaurant Item"}
//         </p>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//         >
//           <strong style={{ color: "#e0b64f", fontSize: "18px", fontWeight: 950 }}>
//             {formatMoney(item.price)}
//           </strong>

//           <button
//             type="button"
//             style={{
//               border: "none",
//               background: isSelected
//                 ? "linear-gradient(135deg, #c99525, #9a6b12)"
//                 : "rgba(255,255,255,0.08)",
//               color: "#ffffff",
//               padding: "9px 13px",
//               borderRadius: "12px",
//               fontWeight: 850,
//               cursor: "pointer",
//             }}
//           >
//             {isSelected ? "Selected" : "Add"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// function OrdersPage() {
//   const navigate = useNavigate();

//   const [orders, setOrders] = useState([]);
//   const [tables, setTables] = useState([]);
//   const [menuItems, setMenuItems] = useState([]);

//   const [editingId, setEditingId] = useState(null);
//   const [editingTableId, setEditingTableId] = useState(null);

//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [searchText, setSearchText] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [checkingStock, setCheckingStock] = useState(false);

//   const [formData, setFormData] = useState({
//     table: "",
//     items: [],
//     status: "Pending",
//   });

//   useEffect(() => {
//     fetchOrders();
//     fetchTables();
//     fetchMenuItems();
//   }, []);

//   const fetchOrders = async () => {
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/restaurant/orders/"
//       );
//       setOrders(Array.isArray(response.data) ? response.data : []);
//     } catch (error) {
//       console.log("Orders fetch error", error);
//       alert("Failed to load orders");
//     }
//   };

//   const fetchTables = async () => {
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/restaurant/tables/"
//       );
//       setTables(Array.isArray(response.data) ? response.data : []);
//     } catch (error) {
//       console.log("Tables fetch error", error);
//       alert("Failed to load tables");
//     }
//   };

//   const fetchMenuItems = async () => {
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/restaurant/menu-items/"
//       );
//       setMenuItems(Array.isArray(response.data) ? response.data : []);
//     } catch (error) {
//       console.log("Menu fetch error", error);
//       alert("Failed to load menu items");
//     }
//   };

//   const refreshAll = async () => {
//     await Promise.all([fetchOrders(), fetchTables(), fetchMenuItems()]);
//   };

//   const getBackendErrorMessage = (error) => {
//     const data = error.response?.data;

//     if (!data) return "Something went wrong";
//     if (typeof data === "string") return data;
//     if (data.detail) return data.detail;

//     const messages = [];

//     Object.keys(data).forEach((key) => {
//       const value = data[key];

//       if (Array.isArray(value)) {
//         messages.push(`${key}: ${value.join(", ")}`);
//       } else {
//         messages.push(`${key}: ${value}`);
//       }
//     });

//     return messages.length > 0 ? messages.join("\n") : JSON.stringify(data);
//   };

//   const formatMoney = (amount) => {
//     return `₹${Number(amount || 0).toFixed(2)}`;
//   };

//   const formatDateTime = (value) => {
//     if (!value) return "-";

//     const date = new Date(value);

//     if (Number.isNaN(date.getTime())) return "-";

//     return date.toLocaleString();
//   };

//   const getTableName = (tableId) => {
//     const table = tables.find((item) => Number(item.id) === Number(tableId));
//     return table ? table.table_number : tableId || "-";
//   };

//   const getMenuItemName = (itemId) => {
//     const item = menuItems.find((menu) => Number(menu.id) === Number(itemId));
//     return item ? item.name : `Item ${itemId}`;
//   };

//   const getOrderItems = (order) => {
//     if (!order || !Array.isArray(order.items)) return [];

//     return order.items.map((item) => {
//       if (typeof item === "object") {
//         return item.id || item.menu_item || item.menu_item_id;
//       }

//       return item;
//     });
//   };

//   const getOrderItemsText = (order) => {
//     const ids = getOrderItems(order);

//     if (ids.length === 0) return "-";

//     return ids.map((id) => getMenuItemName(id)).join(", ");
//   };

//   const makeMenuKey = (name) => {
//     return String(name || "")
//       .toLowerCase()
//       .replace(/[^a-z0-9]/g, "");
//   };

//   const getItemImage = (item) => {
//     const backendImage =
//       item.image || item.image_url || item.photo || item.photo_url;

//     if (backendImage) {
//       return backendImage;
//     }

//     const key = makeMenuKey(item.name);

//     if (key.includes("idli")) return "/images/menu/idli.jpg";
//     if (key.includes("burger")) return "/images/menu/burger.jpg";
//     if (key.includes("maggie")) return "/images/menu/maggie.jpg";
//     if (key.includes("maggi")) return "/images/menu/maggie.jpg";
//     if (key.includes("noodle")) return "/images/menu/maggie.jpg";
//     if (key.includes("coffee")) return "/images/menu/coffee.jpg";
//     if (key.includes("biryani")) return "/images/menu/biryani.jpg";
//     if (key.includes("biriyani")) return "/images/menu/biryani.jpg";

//     return null;
//   };

//   const selectedMenuItems = formData.items
//     .map((id) => menuItems.find((item) => Number(item.id) === Number(id)))
//     .filter(Boolean);

//   const selectedTotal = selectedMenuItems.reduce((sum, item) => {
//     return sum + Number(item.price || 0);
//   }, 0);

//   const selectedGst = selectedTotal * 0.05;
//   const selectedGrandTotal = selectedTotal + selectedGst;

//   const categories = useMemo(() => {
//     const uniqueCategories = menuItems
//       .map((item) => item.category || "Others")
//       .filter(Boolean);

//     return ["All", ...new Set(uniqueCategories)];
//   }, [menuItems]);

//   const filteredMenuItems = menuItems.filter((item) => {
//     const itemCategory = item.category || "Others";

//     const matchCategory =
//       selectedCategory === "All" || itemCategory === selectedCategory;

//     const matchSearch =
//       item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
//       itemCategory.toLowerCase().includes(searchText.toLowerCase());

//     return matchCategory && matchSearch;
//   });

//   const activeOrders = orders.filter((order) =>
//     ["Pending", "Preparing", "Ready", "Served"].includes(order.status)
//   );

//   const preparingOrders = orders.filter((order) =>
//     ["Preparing", "Ready"].includes(order.status)
//   );

//   const getAvailableTables = () => {
//     return tables.filter((table) => {
//       if (editingTableId && Number(table.id) === Number(editingTableId)) {
//         return true;
//       }

//       return table.status === "Available";
//     });
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setEditingTableId(null);

//     setFormData({
//       table: "",
//       items: [],
//       status: "Pending",
//     });
//   };

//   const handleItemToggle = (item) => {
//     if (item.available === false) {
//       alert(`${item.name} is currently not available.`);
//       return;
//     }

//     const itemId = item.id;

//     if (formData.items.includes(itemId)) {
//       setFormData({
//         ...formData,
//         items: formData.items.filter((id) => id !== itemId),
//       });
//     } else {
//       setFormData({
//         ...formData,
//         items: [...formData.items, itemId],
//       });
//     }
//   };

//   const removeSelectedItem = (itemId) => {
//     setFormData({
//       ...formData,
//       items: formData.items.filter((id) => Number(id) !== Number(itemId)),
//     });
//   };

//   const checkMenuItemStock = async (menuItemId) => {
//     try {
//       const response = await axios.post(
//         "http://127.0.0.1:8000/api/inventory/check-stock/",
//         {
//           menu_item: menuItemId,
//           quantity: 1,
//         }
//       );

//       return response.data;
//     } catch (error) {
//       console.log("Stock check error", error);

//       return {
//         available: false,
//         message: getBackendErrorMessage(error),
//       };
//     }
//   };

//   const validateStockBeforeOrder = async () => {
//     setCheckingStock(true);

//     try {
//       for (const menuItemId of formData.items) {
//         const stockResult = await checkMenuItemStock(menuItemId);

//         if (!stockResult.available) {
//           let message = `${getMenuItemName(menuItemId)} cannot be ordered.\n\n`;
//           message += stockResult.message || "Stock is not available.";

//           alert(message);
//           return false;
//         }
//       }

//       return true;
//     } finally {
//       setCheckingStock(false);
//     }
//   };

//   const validateBeforeSubmit = () => {
//     if (!formData.table) {
//       alert("Please select a dining table");
//       return false;
//     }

//     if (formData.items.length === 0) {
//       alert("Please select at least one menu item");
//       return false;
//     }

//     return true;
//   };

//   const saveOrder = async () => {
//     if (!validateBeforeSubmit()) return;

//     try {
//       setLoading(true);

//       const stockOk = await validateStockBeforeOrder();

//       if (!stockOk) return;

//       const payload = {
//         table: Number(formData.table),
//         items: formData.items,
//         status: formData.status,
//       };

//       if (editingId) {
//         await axios.patch(
//           `http://127.0.0.1:8000/api/restaurant/orders/${editingId}/`,
//           payload
//         );

//         alert("Order updated successfully");
//       } else {
//         await axios.post(
//           "http://127.0.0.1:8000/api/restaurant/orders/",
//           payload
//         );

//         alert("Order created successfully");
//       }

//       resetForm();
//       refreshAll();
//     } catch (error) {
//       console.log("Order save error", error);
//       alert(getBackendErrorMessage(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (order) => {
//     const ids = getOrderItems(order);

//     setEditingId(order.id);
//     setEditingTableId(order.table);

//     setFormData({
//       table: order.table || "",
//       items: ids,
//       status: order.status || "Pending",
//     });

//     window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//     });
//   };

//   const handleDelete = async (order) => {
//     if (order.status === "Billed") {
//       alert("Billed order cannot be deleted.");
//       return;
//     }

//     if (!window.confirm(`Delete Order #${order.id}?`)) return;

//     try {
//       await axios.delete(
//         `http://127.0.0.1:8000/api/restaurant/orders/${order.id}/`
//       );

//       alert("Order deleted successfully");
//       refreshAll();
//     } catch (error) {
//       console.log("Delete order error", error);
//       alert(getBackendErrorMessage(error));
//     }
//   };

//   const markOrderServed = async (orderId) => {
//     try {
//       await axios.patch(
//         `http://127.0.0.1:8000/api/restaurant/orders/${orderId}/`,
//         {
//           status: "Served",
//         }
//       );

//       alert("Order marked as Served");
//       refreshAll();
//     } catch (error) {
//       console.log("Mark served error", error);
//       alert(getBackendErrorMessage(error));
//     }
//   };

//   const orderStatusClass = (status) => {
//     if (status === "Pending") return "pending";
//     if (status === "Preparing") return "preparing";
//     if (status === "Ready") return "ready";
//     if (status === "Served") return "served";
//     if (status === "Billed") return "billed";
//     if (status === "Cancelled") return "cancelled";

//     return "";
//   };
//   console.log("MENU ITEMS DATA:", filteredMenuItems.slice(0, 3));
//   return (
//     <RestaurantLayout>
//       <div className="royal-order-page">
//         <aside className="royal-pos-sidebar">
//           <div className="royal-pos-brand">
//             <span>SD</span>
//             <div>
//               <h2>SmartDine</h2>
//               <p>Restaurant POS</p>
//             </div>
//           </div>

//           <button className="active">Point of Sale</button>
//           <button onClick={() => navigate("/tables")}>Dining Area</button>
//           <button onClick={() => navigate("/kitchen")}>Order Queue</button>
//           <button onClick={() => navigate("/billing")}>Billing Counter</button>
//           <button onClick={() => navigate("/customers")}>Customers</button>
//           <button onClick={() => navigate("/reports/sales")}>Reports</button>
//         </aside>

//         <main className="royal-pos-main">
//           <div className="royal-pos-topbar">
//             <div>
//               <span className="royal-mini-label">Premium Dining Desk</span>
//               <h1>Orders Management</h1>
//               <p>Create orders, select correct dishes, track kitchen queue.</p>
//             </div>

//             <div className="royal-pos-actions">
//               <button onClick={refreshAll}>Refresh</button>
//               <button onClick={() => navigate("/billing")}>Billing</button>
//             </div>
//           </div>

//           <div className="royal-category-tabs">
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 className={selectedCategory === category ? "active" : ""}
//                 onClick={() => setSelectedCategory(category)}
//               >
//                 {category}
//               </button>
//             ))}
//           </div>

//           <div className="royal-product-header">
//             <div>
//               <h2>Menu Products</h2>
//               <p>{filteredMenuItems.length} menu items available</p>
//             </div>

//             <input
//               type="text"
//               placeholder="Search dishes or category..."
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//             />
//           </div>

//           <div className="royal-pos-grid">
//             <section
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "repeat(3, 1fr)",
//                 gap: "18px",
//               }}
//             >
//               {filteredMenuItems.length === 0 ? (
//                 <div className="royal-empty-box">No menu items found.</div>
//               ) : (
//                 filteredMenuItems.map((item) => (
//                   <ProductCard
//                     key={item.id}
//                     item={{ ...item, __getItemImage: getItemImage }}
//                     isSelected={formData.items.includes(item.id)}
//                     onToggle={() => handleItemToggle(item)}
//                     formatMoney={formatMoney}
//                   />
//                 ))
//               )}
//             </section>

//             <aside className="royal-order-panel">
//               <div className="royal-panel-card">
//                 <div className="royal-panel-head">
//                   <h2>Order Queue</h2>
//                   <button onClick={() => navigate("/kitchen")}>Show All</button>
//                 </div>

//                 {activeOrders.length === 0 ? (
//                   <div className="royal-small-empty">No active orders.</div>
//                 ) : (
//                   activeOrders.slice(0, 2).map((order) => (
//                     <div key={order.id} className="royal-queue-card">
//                       <div>
//                         <span>Active Order</span>
//                         <strong>Table {getTableName(order.table)}</strong>
//                       </div>

//                       <em className={orderStatusClass(order.status)}>
//                         {order.status}
//                       </em>
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="royal-panel-card">
//                 <div className="royal-panel-head">
//                   <h2>Create Order</h2>
//                   <button onClick={resetForm}>Clear</button>
//                 </div>

//                 <div className="royal-field">
//                   <label>Dining Table</label>
//                   <select
//                     value={formData.table}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         table: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="">Select Available Table</option>

//                     {getAvailableTables().map((table) => (
//                       <option key={table.id} value={table.id}>
//                         Table {table.table_number} - {table.status}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="royal-field">
//                   <label>Order Status</label>
//                   <select
//                     value={formData.status}
//                     onChange={(e) =>
//                       setFormData({
//                         ...formData,
//                         status: e.target.value,
//                       })
//                     }
//                   >
//                     <option value="Pending">Pending</option>
//                     <option value="Preparing">Preparing</option>
//                     <option value="Ready">Ready</option>
//                     <option value="Served">Served</option>
//                     <option value="Cancelled">Cancelled</option>
//                   </select>
//                 </div>

//                 <div className="royal-selected-list">
//                   {selectedMenuItems.length === 0 ? (
//                     <div className="royal-small-empty">
//                       Select dishes from product list.
//                     </div>
//                   ) : (
//                     selectedMenuItems.map((item) => (
//                       <div key={item.id} className="royal-selected-item">
//                         <div>
//                           <h4>{item.name}</h4>
//                           <p>Qty: 1</p>
//                         </div>

//                         <strong>{formatMoney(item.price)}</strong>

//                         <button onClick={() => removeSelectedItem(item.id)}>
//                           ×
//                         </button>
//                       </div>
//                     ))
//                   )}
//                 </div>

//                 <div className="royal-total-box">
//                   <div>
//                     <span>Subtotal</span>
//                     <strong>{formatMoney(selectedTotal)}</strong>
//                   </div>

//                   <div>
//                     <span>Service GST 5%</span>
//                     <strong>{formatMoney(selectedGst)}</strong>
//                   </div>

//                   <div className="grand">
//                     <span>Total Amount</span>
//                     <strong>{formatMoney(selectedGrandTotal)}</strong>
//                   </div>
//                 </div>

//                 <div className="royal-action-row">
//                   <button onClick={saveOrder} disabled={loading || checkingStock}>
//                     {editingId
//                       ? loading
//                         ? "Updating..."
//                         : "Update Order"
//                       : loading || checkingStock
//                       ? "Checking..."
//                       : "Create Order"}
//                   </button>

//                   {editingId && (
//                     <button className="danger" onClick={resetForm}>
//                       Cancel
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="royal-panel-card">
//                 <div className="royal-panel-head">
//                   <h2>Food Preparing</h2>
//                 </div>

//                 {preparingOrders.length === 0 ? (
//                   <div className="royal-small-empty">No preparing orders.</div>
//                 ) : (
//                   preparingOrders.slice(0, 2).map((order) => (
//                     <div key={order.id} className="royal-preparing-card">
//                       <strong>Preparing Order</strong>
//                       <p>Table {getTableName(order.table)}</p>
//                       <span>{getOrderItemsText(order)}</span>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </aside>
//           </div>

//           <section className="royal-orders-table-section">
//             <div className="royal-section-title">
//               <span>Live Orders</span>
//               <h2>Restaurant Order List</h2>
//             </div>

//             {orders.length === 0 ? (
//               <div className="royal-empty-box">No orders found.</div>
//             ) : (
//               <table className="royal-orders-table">
//                 <thead>
//                   <tr>
//                     <th>Table</th>
//                     <th>Items</th>
//                     <th>Status</th>
//                     <th>Created At</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {orders.map((order) => (
//                     <tr key={order.id}>
//                       <td>
//                         <strong>Table {getTableName(order.table)}</strong>
//                       </td>

//                       <td>
//                         <strong>{getOrderItems(order).length} Items</strong>
//                         <p>{getOrderItemsText(order)}</p>
//                       </td>

//                       <td>
//                         <span
//                           className={`royal-status ${orderStatusClass(order.status)}`}
//                         >
//                           {order.status}
//                         </span>
//                       </td>

//                       <td>{formatDateTime(order.created_at)}</td>

//                       <td>
//                         {order.status === "Billed" ? (
//                           <span className="royal-locked">Locked</span>
//                         ) : (
//                           <div className="royal-table-actions">
//                             {order.status === "Ready" && (
//                               <button
//                                 className="served"
//                                 onClick={() => markOrderServed(order.id)}
//                               >
//                                 Mark Served
//                               </button>
//                             )}

//                             <button onClick={() => handleEdit(order)}>
//                               Edit
//                             </button>

//                             <button
//                               className="delete"
//                               onClick={() => handleDelete(order)}
//                             >
//                               Delete
//                             </button>
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </section>
//         </main>
//       </div>
//     </RestaurantLayout>
//   );
// }

// export default OrdersPage;
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./OrdersPage.css";

function ProductImage({ item, getItemImage, getCategoryFallbackImage }) {
  const primarySrc = getItemImage ? getItemImage(item) : null;

  const [currentSrc, setCurrentSrc] = useState(primarySrc);
  const [stage, setStage] = useState(primarySrc ? "primary" : "failed");

  useEffect(() => {
    setCurrentSrc(primarySrc);
    setStage(primarySrc ? "primary" : "failed");
  }, [primarySrc]);

  const handleImgError = () => {
    if (stage === "primary") {
      const fallbackSrc = getCategoryFallbackImage
        ? getCategoryFallbackImage(item)
        : null;

      if (fallbackSrc && fallbackSrc !== currentSrc) {
        setStage("category");
        setCurrentSrc(fallbackSrc);
        return;
      }
    }

    setStage("failed");
  };

  const hasRealImage = stage !== "failed" && Boolean(currentSrc);

  const wrapperStyle = {
    height: "140px",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    background: "#1c1f18",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
  };

  const badgeStyle = {
    position: "absolute",
    top: "12px",
    left: "12px",
    background: "#ffffff",
    color: "#0b4a3f",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 850,
  };

  if (!hasRealImage) {
    return (
      <div style={wrapperStyle}>
        <span style={{ fontSize: "40px" }}>🍽️</span>
        <span style={badgeStyle}>
          {item.available === false ? "Unavailable" : "Available"}
        </span>
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <img
        src={currentSrc}
        alt={item.name}
        onError={handleImgError}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <span style={badgeStyle}>
        {item.available === false ? "Unavailable" : "Available"}
      </span>
    </div>
  );
}

function ProductCard({ item, isSelected, onToggle, formatMoney }) {
  const cardStyle = {
    background: "#0c0e0b",
    border: isSelected
      ? "1px solid rgba(224, 182, 79, 0.7)"
      : "1px solid rgba(224, 182, 79, 0.16)",
    borderRadius: "20px",
    overflow: "hidden",
    cursor: item.available === false ? "not-allowed" : "pointer",
    opacity: item.available === false ? 0.55 : 1,
    boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
    display: "flex",
    flexDirection: "column",
  };

  const infoStyle = {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  };

  return (
    <div style={cardStyle} onClick={onToggle}>
      <ProductImage
        item={item}
        getItemImage={item.__getItemImage}
        getCategoryFallbackImage={item.__getCategoryFallbackImage}
      />

      <div style={infoStyle}>
        <h3
          style={{
            margin: 0,
            color: "#ffffff",
            fontSize: "17px",
            fontWeight: 950,
          }}
        >
          {item.name}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#928b7a",
            fontWeight: 650,
            textTransform: "capitalize",
            fontSize: "13px",
          }}
        >
          {item.category || "Restaurant Item"}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong style={{ color: "#e0b64f", fontSize: "18px", fontWeight: 950 }}>
            {formatMoney(item.price)}
          </strong>

          <button
            type="button"
            style={{
              border: "none",
              background: isSelected
                ? "linear-gradient(135deg, #c99525, #9a6b12)"
                : "rgba(255,255,255,0.08)",
              color: "#ffffff",
              padding: "9px 13px",
              borderRadius: "12px",
              fontWeight: 850,
              cursor: "pointer",
            }}
          >
            {isSelected ? "Selected" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingTableId, setEditingTableId] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingStock, setCheckingStock] = useState(false);

  const [formData, setFormData] = useState({
    table: "",
    items: [],
    status: "Pending",
  });

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchMenuItems();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/restaurant/orders/"
      );
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Orders fetch error", error);
      alert("Failed to load orders");
    }
  };

  const fetchTables = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/restaurant/tables/"
      );
      setTables(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Tables fetch error", error);
      alert("Failed to load tables");
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/restaurant/menu-items/"
      );
      setMenuItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Menu fetch error", error);
      alert("Failed to load menu items");
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchOrders(), fetchTables(), fetchMenuItems()]);
  };

  const getBackendErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) return "Something went wrong";
    if (typeof data === "string") return data;
    if (data.detail) return data.detail;

    const messages = [];

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(", ")}`);
      } else {
        messages.push(`${key}: ${value}`);
      }
    });

    return messages.length > 0 ? messages.join("\n") : JSON.stringify(data);
  };

  const formatMoney = (amount) => {
    return `₹${Number(amount || 0).toFixed(2)}`;
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString();
  };

  const getTableName = (tableId) => {
    const table = tables.find((item) => Number(item.id) === Number(tableId));
    return table ? table.table_number : tableId || "-";
  };

  const getMenuItemName = (itemId) => {
    const item = menuItems.find((menu) => Number(menu.id) === Number(itemId));
    return item ? item.name : `Item ${itemId}`;
  };

  const getOrderItems = (order) => {
    if (!order || !Array.isArray(order.items)) return [];

    return order.items.map((item) => {
      if (typeof item === "object") {
        return item.id || item.menu_item || item.menu_item_id;
      }

      return item;
    });
  };

  const getOrderItemsText = (order) => {
    const ids = getOrderItems(order);

    if (ids.length === 0) return "-";

    return ids.map((id) => getMenuItemName(id)).join(", ");
  };

  const slugifyMenuName = (name) => {
    return String(name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const getItemImage = (item) => {
    const backendImage =
      item.image || item.image_url || item.photo || item.photo_url;

    if (backendImage) {
      return backendImage;
    }

    const slug = slugifyMenuName(item.name);

    if (!slug) return null;

    return `/menu/${slug}.jpg`;
  };

  const getCategoryFallbackImage = (item) => {
    const category = String(item.category || "").toLowerCase();

    if (category.includes("dessert")) return "/menu/category-dessert.jpg";
    if (category.includes("starter")) return "/menu/category-starter.jpg";
    if (category.includes("beverage") || category.includes("drink")) {
      return "/menu/category-beverage.jpg";
    }

    return "/menu/category-main.jpg";
  };

  const selectedMenuItems = formData.items
    .map((id) => menuItems.find((item) => Number(item.id) === Number(id)))
    .filter(Boolean);

  const selectedTotal = selectedMenuItems.reduce((sum, item) => {
    return sum + Number(item.price || 0);
  }, 0);

  const selectedGst = selectedTotal * 0.05;
  const selectedGrandTotal = selectedTotal + selectedGst;

  const categories = useMemo(() => {
    const uniqueCategories = menuItems
      .map((item) => item.category || "Others")
      .filter(Boolean);

    return ["All", ...new Set(uniqueCategories)];
  }, [menuItems]);

  const filteredMenuItems = menuItems.filter((item) => {
    const itemCategory = item.category || "Others";

    const matchCategory =
      selectedCategory === "All" || itemCategory === selectedCategory;

    const matchSearch =
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      itemCategory.toLowerCase().includes(searchText.toLowerCase());

    return matchCategory && matchSearch;
  });

  const activeOrders = orders.filter((order) =>
    ["Pending", "Preparing", "Ready", "Served"].includes(order.status)
  );

  const preparingOrders = orders.filter((order) =>
    ["Preparing", "Ready"].includes(order.status)
  );

  const getAvailableTables = () => {
    return tables.filter((table) => {
      if (editingTableId && Number(table.id) === Number(editingTableId)) {
        return true;
      }

      return table.status === "Available";
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingTableId(null);

    setFormData({
      table: "",
      items: [],
      status: "Pending",
    });
  };

  const handleItemToggle = (item) => {
    if (item.available === false) {
      alert(`${item.name} is currently not available.`);
      return;
    }

    const itemId = item.id;

    if (formData.items.includes(itemId)) {
      setFormData({
        ...formData,
        items: formData.items.filter((id) => id !== itemId),
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, itemId],
      });
    }
  };

  const removeSelectedItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((id) => Number(id) !== Number(itemId)),
    });
  };

  const checkMenuItemStock = async (menuItemId) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/inventory/check-stock/",
        {
          menu_item: menuItemId,
          quantity: 1,
        }
      );

      return response.data;
    } catch (error) {
      console.log("Stock check error", error);

      return {
        available: false,
        message: getBackendErrorMessage(error),
      };
    }
  };

  const validateStockBeforeOrder = async () => {
    setCheckingStock(true);

    try {
      for (const menuItemId of formData.items) {
        const stockResult = await checkMenuItemStock(menuItemId);

        if (!stockResult.available) {
          let message = `${getMenuItemName(menuItemId)} cannot be ordered.\n\n`;
          message += stockResult.message || "Stock is not available.";

          alert(message);
          return false;
        }
      }

      return true;
    } finally {
      setCheckingStock(false);
    }
  };

  const validateBeforeSubmit = () => {
    if (!formData.table) {
      alert("Please select a dining table");
      return false;
    }

    if (formData.items.length === 0) {
      alert("Please select at least one menu item");
      return false;
    }

    return true;
  };

  const saveOrder = async () => {
    if (!validateBeforeSubmit()) return;

    try {
      setLoading(true);

      const stockOk = await validateStockBeforeOrder();

      if (!stockOk) return;

      const payload = {
        table: Number(formData.table),
        items: formData.items,
        status: formData.status,
      };

      if (editingId) {
        await axios.patch(
          `http://127.0.0.1:8000/api/restaurant/orders/${editingId}/`,
          payload
        );

        alert("Order updated successfully");
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/restaurant/orders/",
          payload
        );

        alert("Order created successfully");
      }

      resetForm();
      refreshAll();
    } catch (error) {
      console.log("Order save error", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    const ids = getOrderItems(order);

    setEditingId(order.id);
    setEditingTableId(order.table);

    setFormData({
      table: order.table || "",
      items: ids,
      status: order.status || "Pending",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (order) => {
    if (order.status === "Billed") {
      alert("Billed order cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete Order #${order.id}?`)) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/restaurant/orders/${order.id}/`
      );

      alert("Order deleted successfully");
      refreshAll();
    } catch (error) {
      console.log("Delete order error", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const markOrderServed = async (orderId) => {
    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/restaurant/orders/${orderId}/`,
        {
          status: "Served",
        }
      );

      alert("Order marked as Served");
      refreshAll();
    } catch (error) {
      console.log("Mark served error", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const orderStatusClass = (status) => {
    if (status === "Pending") return "pending";
    if (status === "Preparing") return "preparing";
    if (status === "Ready") return "ready";
    if (status === "Served") return "served";
    if (status === "Billed") return "billed";
    if (status === "Cancelled") return "cancelled";

    return "";
  };
  console.log("MENU ITEMS DATA:", filteredMenuItems.slice(0, 3));
  return (
    <RestaurantLayout>
      <div className="royal-order-page">
        <aside className="royal-pos-sidebar">
          <div className="royal-pos-brand">
            <span>SD</span>
            <div>
              <h2>SmartDine</h2>
              <p>Restaurant POS</p>
            </div>
          </div>

          <button className="active">Point of Sale</button>
          <button onClick={() => navigate("/tables")}>Dining Area</button>
          <button onClick={() => navigate("/kitchen")}>Order Queue</button>
          <button onClick={() => navigate("/billing")}>Billing Counter</button>
          <button onClick={() => navigate("/customers")}>Customers</button>
          <button onClick={() => navigate("/reports/sales")}>Reports</button>
        </aside>

        <main className="royal-pos-main">
          <div className="royal-pos-topbar">
            <div>
              <span className="royal-mini-label">Premium Dining Desk</span>
              <h1>Orders Management</h1>
              <p>Create orders, select correct dishes, track kitchen queue.</p>
            </div>

            <div className="royal-pos-actions">
              <button onClick={refreshAll}>Refresh</button>
              <button onClick={() => navigate("/billing")}>Billing</button>
            </div>
          </div>

          <div className="royal-category-tabs">
            {categories.map((category) => (
              <button
                key={category}
                className={selectedCategory === category ? "active" : ""}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="royal-product-header">
            <div>
              <h2>Menu Products</h2>
              <p>{filteredMenuItems.length} menu items available</p>
            </div>

            <input
              type="text"
              placeholder="Search dishes or category..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="royal-pos-grid">
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "18px",
              }}
            >
              {filteredMenuItems.length === 0 ? (
                <div className="royal-empty-box">No menu items found.</div>
              ) : (
                filteredMenuItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={{
                      ...item,
                      __getItemImage: getItemImage,
                      __getCategoryFallbackImage: getCategoryFallbackImage,
                    }}
                    isSelected={formData.items.includes(item.id)}
                    onToggle={() => handleItemToggle(item)}
                    formatMoney={formatMoney}
                  />
                ))
              )}
            </section>

            <aside className="royal-order-panel">
              <div className="royal-panel-card">
                <div className="royal-panel-head">
                  <h2>Order Queue</h2>
                  <button onClick={() => navigate("/kitchen")}>Show All</button>
                </div>

                {activeOrders.length === 0 ? (
                  <div className="royal-small-empty">No active orders.</div>
                ) : (
                  activeOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="royal-queue-card">
                      <div>
                        <span>Active Order</span>
                        <strong>Table {getTableName(order.table)}</strong>
                      </div>

                      <em className={orderStatusClass(order.status)}>
                        {order.status}
                      </em>
                    </div>
                  ))
                )}
              </div>

              <div className="royal-panel-card">
                <div className="royal-panel-head">
                  <h2>Create Order</h2>
                  <button onClick={resetForm}>Clear</button>
                </div>

                <div className="royal-field">
                  <label>Dining Table</label>
                  <select
                    value={formData.table}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        table: e.target.value,
                      })
                    }
                  >
                    <option value="">Select Available Table</option>

                    {getAvailableTables().map((table) => (
                      <option key={table.id} value={table.id}>
                        Table {table.table_number} - {table.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="royal-field">
                  <label>Order Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Preparing">Preparing</option>
                    <option value="Ready">Ready</option>
                    <option value="Served">Served</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="royal-selected-list">
                  {selectedMenuItems.length === 0 ? (
                    <div className="royal-small-empty">
                      Select dishes from product list.
                    </div>
                  ) : (
                    selectedMenuItems.map((item) => (
                      <div key={item.id} className="royal-selected-item">
                        <div>
                          <h4>{item.name}</h4>
                          <p>Qty: 1</p>
                        </div>

                        <strong>{formatMoney(item.price)}</strong>

                        <button onClick={() => removeSelectedItem(item.id)}>
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="royal-total-box">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatMoney(selectedTotal)}</strong>
                  </div>

                  <div>
                    <span>Service GST 5%</span>
                    <strong>{formatMoney(selectedGst)}</strong>
                  </div>

                  <div className="grand">
                    <span>Total Amount</span>
                    <strong>{formatMoney(selectedGrandTotal)}</strong>
                  </div>
                </div>

                <div className="royal-action-row">
                  <button onClick={saveOrder} disabled={loading || checkingStock}>
                    {editingId
                      ? loading
                        ? "Updating..."
                        : "Update Order"
                      : loading || checkingStock
                      ? "Checking..."
                      : "Create Order"}
                  </button>

                  {editingId && (
                    <button className="danger" onClick={resetForm}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="royal-panel-card">
                <div className="royal-panel-head">
                  <h2>Food Preparing</h2>
                </div>

                {preparingOrders.length === 0 ? (
                  <div className="royal-small-empty">No preparing orders.</div>
                ) : (
                  preparingOrders.slice(0, 2).map((order) => (
                    <div key={order.id} className="royal-preparing-card">
                      <strong>Preparing Order</strong>
                      <p>Table {getTableName(order.table)}</p>
                      <span>{getOrderItemsText(order)}</span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>

          <section className="royal-orders-table-section">
            <div className="royal-section-title">
              <span>Live Orders</span>
              <h2>Restaurant Order List</h2>
            </div>

            {orders.length === 0 ? (
              <div className="royal-empty-box">No orders found.</div>
            ) : (
              <table className="royal-orders-table">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>Table {getTableName(order.table)}</strong>
                      </td>

                      <td>
                        <strong>{getOrderItems(order).length} Items</strong>
                        <p>{getOrderItemsText(order)}</p>
                      </td>

                      <td>
                        <span
                          className={`royal-status ${orderStatusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>

                      <td>{formatDateTime(order.created_at)}</td>

                      <td>
                        {order.status === "Billed" ? (
                          <span className="royal-locked">Locked</span>
                        ) : (
                          <div className="royal-table-actions">
                            {order.status === "Ready" && (
                              <button
                                className="served"
                                onClick={() => markOrderServed(order.id)}
                              >
                                Mark Served
                              </button>
                            )}

                            <button onClick={() => handleEdit(order)}>
                              Edit
                            </button>

                            <button
                              className="delete"
                              onClick={() => handleDelete(order)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </main>
      </div>
    </RestaurantLayout>
  );
}

export default OrdersPage;