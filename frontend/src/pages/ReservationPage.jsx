// import { useEffect, useState } from "react";
// import axios from "axios";
// import RestaurantLayout from "../layouts/RestaurantLayout";
// import "./ReservationPage.css";

// function ReservationPage() {
//   const [tables, setTables] = useState([]);
//   const [reservations, setReservations] = useState([]);
//   const [editingId, setEditingId] = useState(null);

//   const [formData, setFormData] = useState({
//     customer_name: "",
//     phone: "",
//     reservation_date: "",
//     reservation_time: "",
//     guests: "",
//     table_number: "",
//     status: "Confirmed",
//   });

//   useEffect(() => {
//     axios
//       .get("http://127.0.0.1:8000/api/restaurant/tables/")
//       .then((res) => setTables(res.data));
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (editingId) {
//       setReservations(
//         reservations.map((r) =>
//           r.id === editingId ? { ...formData, id: editingId } : r
//         )
//       );
//       setEditingId(null);
//       alert("Reservation updated successfully");
//     } else {
//       setReservations([
//         ...reservations,
//         {
//           ...formData,
//           id: Date.now(),
//         },
//       ]);
//       alert("Reservation added successfully");
//     }

//     setFormData({
//       customer_name: "",
//       phone: "",
//       reservation_date: "",
//       reservation_time: "",
//       guests: "",
//       table_number: "",
//       status: "Confirmed",
//     });
//   };

//   const handleEdit = (reservation) => {
//     setEditingId(reservation.id);
//     setFormData(reservation);
//   };

//   const handleDelete = (id) => {
//     if (window.confirm("Delete this reservation?")) {
//       setReservations(reservations.filter((r) => r.id !== id));
//     }
//   };

//   return (
//     <RestaurantLayout>
//       <div className="page-box">
//         <div className="page-header">
//           <div>
//             <h1>Table Reservations</h1>
//             <p>Manage customer table bookings and reservation status.</p>
//           </div>
//         </div>

//         <form className="reservation-form" onSubmit={handleSubmit}>
//           <input
//             name="customer_name"
//             placeholder="Customer Name"
//             value={formData.customer_name}
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="phone"
//             placeholder="Phone Number"
//             value={formData.phone}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="date"
//             name="reservation_date"
//             value={formData.reservation_date}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="time"
//             name="reservation_time"
//             value={formData.reservation_time}
//             onChange={handleChange}
//             required
//           />

//           <input
//             type="number"
//             name="guests"
//             placeholder="Guests"
//             value={formData.guests}
//             onChange={handleChange}
//             required
//           />

//           <select
//             name="table_number"
//             value={formData.table_number}
//             onChange={handleChange}
//             required
//           >
//             <option value="">Select Table</option>
//             {tables.map((table) => (
//               <option key={table.id} value={table.table_number}>
//                 Table {table.table_number} - {table.capacity} Persons
//               </option>
//             ))}
//           </select>

//           <select name="status" value={formData.status} onChange={handleChange}>
//             <option value="Confirmed">Confirmed</option>
//             <option value="Pending">Pending</option>
//             <option value="Cancelled">Cancelled</option>
//             <option value="Completed">Completed</option>
//           </select>

//           <button className="add-btn" type="submit">
//             {editingId ? "Update Reservation" : "+ Add Reservation"}
//           </button>
//         </form>

//         <table className="premium-table">
//           <thead>
//             <tr>
              
//               <th>Customer</th>
//               <th>Phone</th>
//               <th>Date</th>
//               <th>Time</th>
//               <th>Guests</th>
//               <th>Table</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {reservations.map((r) => (
//               <tr key={r.id}>
//                 <td className="item-name">👤 {r.customer_name}</td>

//                 <td>{r.phone}</td>

//                 <td>{r.reservation_date}</td>

//                 <td>{r.reservation_time}</td>

//                 <td>{r.guests}</td>

//                 <td>Table {r.table_number}</td>

//                 <td>
//                   <span className="category-badge">{r.status}</span>
//                 </td>

//                 <td>
//                   <button
//                     className="edit-btn"
//                     onClick={() => handleEdit(r)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="delete-btn"
//                     onClick={() => handleDelete(r.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </RestaurantLayout>
//   );
// }

// export default ReservationPage;
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./ReservationPage.css";

function ReservationPage() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: "",
    phone: "",
    reservation_date: "",
    reservation_time: "",
    guests: "",
    table_number: "",
    status: "Confirmed",
  });

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/restaurant/tables/")
      .then((res) => setTables(res.data));
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Keep digits only and cap at 10 characters
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setFormData({
      ...formData,
      phone: digitsOnly,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (editingId) {
      setReservations(
        reservations.map((r) =>
          r.id === editingId ? { ...formData, id: editingId } : r
        )
      );
      setEditingId(null);
      alert("Reservation updated successfully");
    } else {
      setReservations([
        ...reservations,
        {
          ...formData,
          id: Date.now(),
        },
      ]);
      alert("Reservation added successfully");
    }

    setFormData({
      customer_name: "",
      phone: "",
      reservation_date: "",
      reservation_time: "",
      guests: "",
      table_number: "",
      status: "Confirmed",
    });
  };

  const handleEdit = (reservation) => {
    setEditingId(reservation.id);
    setFormData(reservation);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this reservation?")) {
      setReservations(reservations.filter((r) => r.id !== id));
    }
  };

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Table Reservations</h1>
            <p>Manage customer table bookings and reservation status.</p>
          </div>
        </div>

        <form className="reservation-form" onSubmit={handleSubmit}>
          <input
            name="customer_name"
            placeholder="Customer Name"
            value={formData.customer_name}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handlePhoneChange}
            inputMode="numeric"
            pattern="[0-9]{10}"
            maxLength={10}
            title="Phone number must be exactly 10 digits"
            required
          />

          <input
            type="date"
            name="reservation_date"
            value={formData.reservation_date}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="reservation_time"
            value={formData.reservation_time}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="guests"
            placeholder="Guests"
            value={formData.guests}
            onChange={handleChange}
            required
          />

          <select
            name="table_number"
            value={formData.table_number}
            onChange={handleChange}
            required
          >
            <option value="">Select Table</option>
            {tables.map((table) => (
              <option key={table.id} value={table.table_number}>
                Table {table.table_number} - {table.capacity} Persons
              </option>
            ))}
          </select>

          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Completed">Completed</option>
          </select>

          <button className="add-btn" type="submit">
            {editingId ? "Update Reservation" : "+ Add Reservation"}
          </button>
        </form>

        <table className="premium-table">
          <thead>
            <tr>
              
              <th>Customer</th>
              <th>Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th>Guests</th>
              <th>Table</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td className="item-name">👤 {r.customer_name}</td>

                <td>{r.phone}</td>

                <td>{r.reservation_date}</td>

                <td>{r.reservation_time}</td>

                <td>{r.guests}</td>

                <td>Table {r.table_number}</td>

                <td>
                  <span className="category-badge">{r.status}</span>
                </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(r)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </RestaurantLayout>
  );
}

export default ReservationPage;