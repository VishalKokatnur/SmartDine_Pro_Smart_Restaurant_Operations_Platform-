// import { useEffect, useState } from "react";
// import axios from "axios";
// import RestaurantLayout from "../layouts/RestaurantLayout";
// import "./DashboardPage.css";
// import "./TablesPage.css";

// function TablesPage() {
//   const [tables, setTables] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [editingTableStatus, setEditingTableStatus] = useState("");
//   const [search, setSearch] = useState("");

//   const [formData, setFormData] = useState({
//     table_number: "",
//     capacity: "",
//     status: "Available",
//   });

//   useEffect(() => {
//     fetchTables();
//   }, []);

//   const fetchTables = async () => {
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/api/restaurant/tables/"
//       );
//       setTables(response.data);
//     } catch (error) {
//       console.log("Tables fetch error", error);
//       alert("Failed to load tables");
//     }
//   };

//   const getBackendErrorMessage = (error) => {
//     const data = error.response?.data;

//     if (!data) return "Something went wrong";
//     if (typeof data === "string") return data;

//     if (data.status) {
//       return Array.isArray(data.status) ? data.status[0] : data.status;
//     }

//     if (data.table_number) {
//       return Array.isArray(data.table_number)
//         ? data.table_number[0]
//         : data.table_number;
//     }

//     if (data.capacity) {
//       return Array.isArray(data.capacity) ? data.capacity[0] : data.capacity;
//     }

//     if (data.detail) return data.detail;

//     return JSON.stringify(data);
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const resetForm = () => {
//     setEditingId(null);
//     setEditingTableStatus("");
//     setFormData({
//       table_number: "",
//       capacity: "",
//       status: "Available",
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.table_number.trim()) {
//       alert("Please enter table number");
//       return;
//     }

//     if (!formData.capacity || Number(formData.capacity) <= 0) {
//       alert("Capacity must be greater than 0");
//       return;
//     }

//     if (
//       editingId &&
//       editingTableStatus === "Occupied" &&
//       formData.status === "Available"
//     ) {
//       alert(
//         "This table has an active order. Complete bill, cancel order, or delete active order first."
//       );
//       return;
//     }

//     try {
//       if (editingId) {
//         await axios.put(
//           `http://127.0.0.1:8000/api/restaurant/tables/${editingId}/`,
//           {
//             table_number: formData.table_number,
//             capacity: Number(formData.capacity),
//             status: formData.status,
//           }
//         );

//         alert("Table updated successfully");
//       } else {
//         await axios.post("http://127.0.0.1:8000/api/restaurant/tables/", {
//           table_number: formData.table_number,
//           capacity: Number(formData.capacity),
//           status: formData.status,
//         });

//         alert("Table added successfully");
//       }

//       resetForm();
//       fetchTables();
//     } catch (error) {
//       console.log("Table save error", error);
//       alert(getBackendErrorMessage(error));
//     }
//   };

//   const handleEdit = (table) => {
//     setEditingId(table.id);
//     setEditingTableStatus(table.status);

//     setFormData({
//       table_number: table.table_number,
//       capacity: table.capacity,
//       status: table.status,
//     });

//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async (table) => {
//     if (table.status === "Occupied") {
//       alert(
//         "This table has an active order. Complete bill, cancel order, or delete active order first."
//       );
//       return;
//     }

//     if (!window.confirm(`Delete Table ${table.table_number}?`)) {
//       return;
//     }

//     try {
//       await axios.delete(
//         `http://127.0.0.1:8000/api/restaurant/tables/${table.id}/`
//       );

//       alert("Table deleted successfully");
//       fetchTables();
//     } catch (error) {
//       console.log("Table delete error", error);
//       alert(getBackendErrorMessage(error));
//     }
//   };

//   const filteredTables = tables.filter((table) => {
//     const keyword = search.toLowerCase();

//     return (
//       String(table.table_number).toLowerCase().includes(keyword) ||
//       String(table.status).toLowerCase().includes(keyword) ||
//       String(table.capacity).toLowerCase().includes(keyword)
//     );
//   });

//   const getStatusClass = (status) => {
//     if (status === "Available") return "table-status available-status";
//     if (status === "Occupied") return "table-status occupied-status";
//     if (status === "Reserved") return "table-status reserved-status";
//     if (status === "Cleaning") return "table-status cleaning-status";
//     return "table-status";
//   };

//   return (
//     <RestaurantLayout>
//       <div className="page-box tables-page-box">
//         <div className="page-header">
//           <div>
//             <h1>Tables Management</h1>
//             <p>Add, edit, delete and update restaurant table status.</p>
//           </div>
//         </div>

//         <form className="table-form" onSubmit={handleSubmit}>
//           <div className="table-field">
//             <label>Table Number</label>
//             <input
//               type="text"
//               name="table_number"
//               placeholder="Example: T1"
//               value={formData.table_number}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="table-field">
//             <label>Capacity</label>
//             <input
//               type="number"
//               name="capacity"
//               placeholder="Example: 4"
//               value={formData.capacity}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div className="table-field">
//             <label>Status</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//             >
//               <option value="Available">Available</option>
//               <option value="Reserved">Reserved</option>
//               <option value="Occupied">Occupied</option>
//               <option value="Billing">Billing</option>
//               <option value="Cleaning">Cleaning</option>
//             </select>
//           </div>

//           <div className="table-field button-field">
//             <button type="submit" className="table-save-btn">
//               {editingId ? "Update Table" : "+ Add Table"}
//             </button>
//           </div>

//           {editingId && (
//             <div className="table-field button-field">
//               <button type="button" className="table-cancel-btn" onClick={resetForm}>
//                 Cancel Edit
//               </button>
//             </div>
//           )}
//         </form>

//         {editingId && editingTableStatus === "Occupied" && (
//           <div className="table-warning-box">
//             This table is Occupied. You can update table number/capacity, but you
//             cannot make it Available until its active order is billed, cancelled,
//             or deleted.
//           </div>
//         )}

//         <input
//           type="text"
//           className="table-search-input"
//           placeholder="Search table number, capacity or status..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <table className="premium-table">
//           <thead>
//             <tr>

//               <th>Table Number</th>
//               <th>Capacity</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredTables.length === 0 ? (
//               <tr>
//                 <td colSpan="4">No tables found.</td>
//               </tr>
//             ) : (
//               filteredTables.map((table) => (
//                 <tr key={table.id}>
//                   <td>🪑 {table.table_number}</td>

//                   <td>{table.capacity} Persons</td>

//                   <td>
//                     <span className={getStatusClass(table.status)}>
//                       {table.status}
//                     </span>
//                   </td>

//                   <td>
//                     <button
//                       type="button"
//                       className="edit-btn"
//                       onClick={() => handleEdit(table)}
//                     >
//                       Edit
//                     </button>

//                     <button
//                       type="button"
//                       className="delete-btn"
//                       onClick={() => handleDelete(table)}
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </RestaurantLayout>
//   );
// }

// export default TablesPage;
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./TablesPage.css";

function TablesPage() {
  const [tables, setTables] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingTableStatus, setEditingTableStatus] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    table_number: "",
    capacity: "",
    status: "Available",
  });

  const [qrTable, setQrTable] = useState(null);
  const [qrLarge, setQrLarge] = useState(false);

  const API_URL = "http://127.0.0.1:8000/api/restaurant";

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await axios.get(`${API_URL}/tables/`);
      setTables(response.data);
    } catch (error) {
      console.error("Tables fetch error:", error);
      alert("Failed to load tables");
    }
  };

  const getBackendErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) {
      return "Something went wrong";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.status) {
      return Array.isArray(data.status) ? data.status[0] : data.status;
    }

    if (data.table_number) {
      return Array.isArray(data.table_number)
        ? data.table_number[0]
        : data.table_number;
    }

    if (data.capacity) {
      return Array.isArray(data.capacity)
        ? data.capacity[0]
        : data.capacity;
    }

    if (data.detail) {
      return data.detail;
    }

    return JSON.stringify(data);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingTableStatus("");

    setFormData({
      table_number: "",
      capacity: "",
      status: "Available",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.table_number.trim()) {
      alert("Please enter table number");
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      alert("Capacity must be greater than 0");
      return;
    }

    if (
      editingId &&
      editingTableStatus === "Occupied" &&
      formData.status === "Available"
    ) {
      alert(
        "This table has an active order. Complete bill, cancel order, or delete active order first."
      );
      return;
    }

    const tableData = {
      table_number: formData.table_number.trim(),
      capacity: Number(formData.capacity),
      status: formData.status,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/tables/${editingId}/`, tableData);
        alert("Table updated successfully");
      } else {
        await axios.post(`${API_URL}/tables/`, tableData);
        alert("Table added successfully");
      }

      resetForm();
      fetchTables();
    } catch (error) {
      console.error("Table save error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const handleEdit = (table) => {
    setEditingId(table.id);
    setEditingTableStatus(table.status);

    setFormData({
      table_number: table.table_number,
      capacity: table.capacity,
      status: table.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (table) => {
    if (table.status === "Occupied") {
      alert(
        "This table has an active order. Complete bill, cancel order, or delete active order first."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete Table ${table.table_number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/tables/${table.id}/`);

      alert("Table deleted successfully");
      fetchTables();
    } catch (error) {
      console.error("Table delete error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const filteredTables = tables.filter((table) => {
    const keyword = search.toLowerCase();

    return (
      String(table.table_number)
        .toLowerCase()
        .includes(keyword) ||
      String(table.status)
        .toLowerCase()
        .includes(keyword) ||
      String(table.capacity)
        .toLowerCase()
        .includes(keyword)
    );
  });

  const getStatusClass = (status) => {
    if (status === "Available") {
      return "table-status available-status";
    }

    if (status === "Occupied") {
      return "table-status occupied-status";
    }

    if (status === "Reserved") {
      return "table-status reserved-status";
    }

    if (status === "Cleaning") {
      return "table-status cleaning-status";
    }

    if (status === "Billing") {
      return "table-status billing-status";
    }

    return "table-status";
  };

  const getOrderLink = (table) => {
  return `http://192.168.31.234:3000/order/${table.id}`;
};

  /*
   * Generates the QR image URL.
   *
   * The URL inside the QR code is:
   * http://localhost:3000/order/<table_id>
   */
  const getQrImageUrl = (table) => {
    const orderLink = getOrderLink(table);

    return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      orderLink
    )}`;
  };

  const openQrModal = (table) => {
    setQrTable(table);
    setQrLarge(false);
  };

  const closeQrModal = () => {
    setQrTable(null);
    setQrLarge(false);
  };

  const copyOrderLink = async (table) => {
    try {
      await navigator.clipboard.writeText(getOrderLink(table));

      alert("Link copied to clipboard");
    } catch (error) {
      console.error("Copy link error:", error);

      alert(
        "Could not copy link. Please copy it manually."
      );
    }
  };

  const downloadQrImage = async (table) => {
    try {
      const response = await fetch(getQrImageUrl(table));

      if (!response.ok) {
        throw new Error("Failed to download QR image");
      }

      const blob = await response.blob();

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `table-${table.table_number}-qr.png`;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("QR download error:", error);

      alert("Could not download QR code.");
    }
  };

  return (
    <RestaurantLayout>
      <div className="page-box tables-page-box">
        <div className="page-header">
          <div>
            <h1>Tables Management</h1>

            <p>
              Add, edit, delete and update restaurant table status.
            </p>
          </div>
        </div>

        {/* TABLE FORM */}
        <form
          className="table-form"
          onSubmit={handleSubmit}
        >
          <div className="table-field">
            <label>Table Number</label>

            <input
              type="text"
              name="table_number"
              placeholder="Example: T1"
              value={formData.table_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="table-field">
            <label>Capacity</label>

            <input
              type="number"
              name="capacity"
              placeholder="Example: 4"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="table-field">
            <label>Status</label>

            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Available">
                Available
              </option>

              <option value="Reserved">
                Reserved
              </option>

              <option value="Occupied">
                Occupied
              </option>

              <option value="Billing">
                Billing
              </option>

              <option value="Cleaning">
                Cleaning
              </option>
            </select>
          </div>

          <div className="table-field button-field">
            <button
              type="submit"
              className="table-save-btn"
            >
              {editingId
                ? "Update Table"
                : "+ Add Table"}
            </button>
          </div>

          {editingId && (
            <div className="table-field button-field">
              <button
                type="button"
                className="table-cancel-btn"
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            </div>
          )}
        </form>

        {/* OCCUPIED WARNING */}
        {editingId &&
          editingTableStatus === "Occupied" && (
            <div className="table-warning-box">
              This table is Occupied. You can update
              table number/capacity, but you cannot make
              it Available until its active order is
              billed, cancelled, or deleted.
            </div>
          )}

        {/* SEARCH */}
        <input
          type="text"
          className="table-search-input"
          placeholder="Search table number, capacity or status..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {/* TABLE LIST */}
        <table className="premium-table">
          <thead>
            <tr>
              <th>Table Number</th>

              <th>Capacity</th>

              <th>Status</th>

              <th>QR Code</th>

              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTables.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No tables found.
                </td>
              </tr>
            ) : (
              filteredTables.map((table) => (
                <tr key={table.id}>
                  <td>
                    🪑 {table.table_number}
                  </td>

                  <td>
                    {table.capacity} Persons
                  </td>

                  <td>
                    <span
                      className={getStatusClass(
                        table.status
                      )}
                    >
                      {table.status}
                    </span>
                  </td>

                  <td className="qr-code-cell">
                    <button
                      type="button"
                      className="tq-view-btn"
                      onClick={() => openQrModal(table)}
                    >
                      <span className="qr-icon">▦</span>
                      <span>View QR</span>
                    </button>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() =>
                        handleEdit(table)
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(table)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* QR MODAL */}
      {qrTable && (
        <div
          className="tq-overlay"
          onClick={closeQrModal}
        >
          <div
            className="tq-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="tq-modal-head">
              <h2>
                Table {qrTable.table_number} QR
                Reference
              </h2>

              <button
                className="tq-close-btn"
                onClick={closeQrModal}
              >
                ✕
              </button>
            </div>

            {/* QR IMAGE */}
            <div
              className={`tq-qr-box ${
                qrLarge
                  ? "tq-qr-box-large"
                  : ""
              }`}
            >
              <img
                src={getQrImageUrl(qrTable)}
                alt={`QR code for Table ${qrTable.table_number}`}
                className="tq-qr-image"
                style={{
                  width: qrLarge
                    ? "320px"
                    : "220px",

                  height: qrLarge
                    ? "320px"
                    : "220px",
                }}
              />
            </div>

            <p className="tq-qr-caption">
              Scan this code to load the digital
              menu for this table.
            </p>

            <p className="tq-qr-link">
              {getOrderLink(qrTable)}
            </p>

            <div className="tq-modal-actions">
              <button
                type="button"
                className="tq-secondary-btn"
                onClick={() =>
                  setQrLarge(!qrLarge)
                }
              >
                {qrLarge
                  ? "Show Normal"
                  : "View Large"}
              </button>

              <button
                type="button"
                className="tq-secondary-btn"
                onClick={() =>
                  copyOrderLink(qrTable)
                }
              >
                Copy Link
              </button>

              <button
                type="button"
                className="tq-primary-btn"
                onClick={() =>
                  downloadQrImage(qrTable)
                }
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      )}
    </RestaurantLayout>
  );
}

export default TablesPage;