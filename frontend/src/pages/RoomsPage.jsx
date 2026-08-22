import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./TablesPage.css";
import "./RoomsPage.css";

function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingRoomStatus, setEditingRoomStatus] = useState("");
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "Single Room",
    capacity: "2",
    price_per_day: "",
    status: "Available",
  });

  const API_URL = "https://smartdine-pro-smart-restaurant.onrender.com/api/hotel";

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms/`);
      setRooms(response.data);
    } catch (error) {
      console.error("Rooms fetch error:", error);
      alert("Failed to load rooms");
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

    if (data.room_number) {
      return Array.isArray(data.room_number)
        ? data.room_number[0]
        : data.room_number;
    }

    if (data.price_per_day) {
      return Array.isArray(data.price_per_day)
        ? data.price_per_day[0]
        : data.price_per_day;
    }

    if (data.status) {
      return Array.isArray(data.status) ? data.status[0] : data.status;
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
    setEditingRoomStatus("");

    setFormData({
      room_number: "",
      room_type: "Single Room",
      capacity: "2",
      price_per_day: "",
      status: "Available",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.room_number.trim()) {
      alert("Please enter room number");
      return;
    }

    if (!formData.capacity || Number(formData.capacity) <= 0) {
      alert("Capacity must be greater than 0");
      return;
    }

    if (!formData.price_per_day || Number(formData.price_per_day) <= 0) {
      alert("Price per day must be greater than 0");
      return;
    }

    if (
      editingId &&
      (editingRoomStatus === "Occupied" || editingRoomStatus === "Booked") &&
      formData.status === "Available"
    ) {
      alert(
        "This room has an active booking. Check out or cancel the booking first."
      );
      return;
    }

    const roomData = {
      room_number: formData.room_number.trim(),
      room_type: formData.room_type,
      capacity: Number(formData.capacity),
      price_per_day: Number(formData.price_per_day),
      status: formData.status,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/rooms/${editingId}/`, roomData);
        alert("Room updated successfully");
      } else {
        await axios.post(`${API_URL}/rooms/`, roomData);
        alert("Room added successfully");
      }

      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Room save error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setEditingRoomStatus(room.status);

    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      price_per_day: room.price_per_day,
      status: room.status,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (room) => {
    if (room.status === "Occupied" || room.status === "Booked") {
      alert(
        "This room has an active booking. Check out or cancel the booking first."
      );
      return;
    }

    const confirmed = window.confirm(`Delete Room ${room.room_number}?`);

    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/rooms/${room.id}/`);
      alert("Room deleted successfully");
      fetchRooms();
    } catch (error) {
      console.error("Room delete error:", error);
      alert(getBackendErrorMessage(error));
    }
  };

  const filteredRooms = rooms.filter((room) => {
    const keyword = search.toLowerCase();

    return (
      String(room.room_number).toLowerCase().includes(keyword) ||
      String(room.room_type).toLowerCase().includes(keyword) ||
      String(room.status).toLowerCase().includes(keyword)
    );
  });

  const getStatusClass = (status) => {
    if (status === "Available") return "table-status available-status";
    if (status === "Booked") return "table-status reserved-status";
    if (status === "Occupied") return "table-status occupied-status";
    if (status === "Cleaning") return "table-status cleaning-status";
    if (status === "Maintenance") return "table-status billing-status";
    return "table-status";
  };

  const totalRooms = rooms.length;
  const availableCount = rooms.filter((r) => r.status === "Available").length;
  const bookedCount = rooms.filter((r) => r.status === "Booked").length;
  const occupiedCount = rooms.filter((r) => r.status === "Occupied").length;

  return (
    <RestaurantLayout>
      <div className="page-box tables-page-box">
        <div className="page-header">
          <div>
            <h1>Room Management</h1>
            <p>Manage hotel rooms, availability and room status.</p>
          </div>
        </div>

        {/* ROOM AVAILABILITY SUMMARY */}
        <div className="room-summary-grid">
          <div className="room-summary-card total">
            <h3>{totalRooms}</h3>
            <p>Total Rooms</p>
          </div>

          <div className="room-summary-card available">
            <h3>{availableCount}</h3>
            <p>Available</p>
          </div>

          <div className="room-summary-card booked">
            <h3>{bookedCount}</h3>
            <p>Booked</p>
          </div>

          <div className="room-summary-card occupied">
            <h3>{occupiedCount}</h3>
            <p>Occupied</p>
          </div>
        </div>

        {/* ROOM FORM */}
        <form className="table-form" onSubmit={handleSubmit}>
          <div className="table-field">
            <label>Room Number</label>
            <input
              type="text"
              name="room_number"
              placeholder="Example: 101"
              value={formData.room_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="table-field">
            <label>Room Type</label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
            >
              <option value="Single Room">Single Room</option>
              <option value="Double Room">Double Room</option>
              <option value="Deluxe Room">Deluxe Room</option>
              <option value="Suite Room">Suite Room</option>
            </select>
          </div>

          <div className="table-field">
            <label>Capacity (Max Guests)</label>
            <input
              type="number"
              name="capacity"
              placeholder="Example: 2"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="table-field">
            <label>Price / Day</label>
            <input
              type="number"
              name="price_per_day"
              placeholder="Example: 2500"
              value={formData.price_per_day}
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
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Occupied">Occupied</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="table-field button-field">
            <button type="submit" className="table-save-btn">
              {editingId ? "Update Room" : "+ Add Room"}
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

        {editingId &&
          (editingRoomStatus === "Occupied" ||
            editingRoomStatus === "Booked") && (
            <div className="table-warning-box">
              This room is {editingRoomStatus}. You can update the room
              number/type/price, but you cannot make it Available until the
              active booking is checked out or cancelled from Room Bookings.
            </div>
          )}

        {/* SEARCH */}
        <input
          type="text"
          className="table-search-input"
          placeholder="Search room number, type or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ROOM FLOOR */}
        <div className="restaurant-floor">
          <h2>🛏️ Hotel Rooms</h2>

          <div className="table-grid">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className={`table-card ${room.status.toLowerCase()}`}
              >
                <h3>{room.room_number}</h3>
                <p>{room.status}</p>
                <small>{room.room_type}</small>
              </div>
            ))}
          </div>

          <div className="table-legend">
            <span>🟩 Available</span>
            <span>🟦 Booked</span>
            <span>🟥 Occupied</span>
            <span>🟨 Maintenance</span>
            <span>⬜ Cleaning</span>
          </div>
        </div>

        {/* ROOM LIST */}
        <table className="premium-table">
          <thead>
            <tr>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Capacity</th>
              <th>Price / Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredRooms.length === 0 ? (
              <tr>
                <td colSpan="6">No rooms found.</td>
              </tr>
            ) : (
              filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td>🛏️ {room.room_number}</td>
                  <td>{room.room_type}</td>
                  <td>{room.capacity} Guests</td>
                  <td>₹{room.price_per_day}</td>
                  <td>
                    <span className={getStatusClass(room.status)}>
                      {room.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => handleEdit(room)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      onClick={() => handleDelete(room)}
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
    </RestaurantLayout>
  );
}

export default RoomsPage;