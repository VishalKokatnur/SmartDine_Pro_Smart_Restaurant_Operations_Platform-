
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./CustomersPage.css";

function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    loyalty_points: 0,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await axios.get(
      "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/customers/"
    );
    setCustomers(res.data);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (editingId) {
      await axios.put(
        `https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/customers/${editingId}/`,
        formData
      );
      alert("Customer updated successfully");
    } else {
      await axios.post(
        "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/customers/",
        formData
      );
      alert("Customer added successfully");
    }

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      loyalty_points: 0,
    });
    setEditingId(null);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingId(customer.id);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      loyalty_points: customer.loyalty_points,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer?")) {
      await axios.delete(
        `https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/customers/${id}/`
      );
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Customer Management</h1>
            <p>Manage customer details, loyalty points and contact history.</p>
          </div>
        </div>

        <form className="customer-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Customer Name" value={formData.name} onChange={handleChange} required />
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
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="address" placeholder="Address" value={formData.address} onChange={handleChange} />
          <input name="loyalty_points" type="number" placeholder="Loyalty Points" value={formData.loyalty_points} onChange={handleChange} />

          <button className="add-btn" type="submit">
            {editingId ? "Update Customer" : "+ Add Customer"}
          </button>
        </form>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search customer by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Loyalty</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.map((c) => (
              <tr key={c.id}>
                <td className="item-name">👤 {c.name}</td>

                <td>{c.phone}</td>

                <td>{c.email || "-"}</td>

                <td>
                  <span className="category-badge">
                    {c.loyalty_points} pts
                  </span>
                </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(c)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(c.id)}
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

export default CustomersPage;