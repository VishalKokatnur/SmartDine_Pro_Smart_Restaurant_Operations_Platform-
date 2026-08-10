// import { useEffect, useState } from "react";
// import axios from "axios";
// import RestaurantLayout from "../layouts/RestaurantLayout";
// import "./EmployeesPage.css";

// function EmployeesPage() {
//   const [employees, setEmployees] = useState([]);
//   const [search, setSearch] = useState("");
//   const [editingId, setEditingId] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     role: "Waiter",
//     salary: "",
//     shift_time: "",
//     joining_date: "",
//     is_active: true,
//   });

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     const res = await axios.get("http://127.0.0.1:8000/api/employees/employees/");
//     setEmployees(res.data);
//   };

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;

//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (editingId) {
//       await axios.put(
//         `http://127.0.0.1:8000/api/employees/employees/${editingId}/`,
//         formData
//       );
//       alert("Employee updated successfully");
//     } else {
//       await axios.post(
//         "http://127.0.0.1:8000/api/employees/employees/",
//         formData
//       );
//       alert("Employee added successfully");
//     }

//     setFormData({
//       name: "",
//       phone: "",
//       email: "",
//       role: "Waiter",
//       salary: "",
//       shift_time: "",
//       joining_date: "",
//       is_active: true,
//     });

//     setEditingId(null);
//     fetchEmployees();
//   };

//   const handleEdit = (employee) => {
//     setEditingId(employee.id);

//     setFormData({
//       name: employee.name,
//       phone: employee.phone,
//       email: employee.email || "",
//       role: employee.role,
//       salary: employee.salary,
//       shift_time: employee.shift_time,
//       joining_date: employee.joining_date,
//       is_active: employee.is_active,
//     });
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Delete this employee?")) {
//       await axios.delete(`http://127.0.0.1:8000/api/employees/employees/${id}/`);
//       alert("Employee deleted successfully");
//       fetchEmployees();
//     }
//   };

//   const filteredEmployees = employees.filter(
//     (emp) =>
//       emp.name.toLowerCase().includes(search.toLowerCase()) ||
//       emp.role.toLowerCase().includes(search.toLowerCase()) ||
//       emp.phone.includes(search)
//   );

//   return (
//     <RestaurantLayout>
//       <div className="page-box">
//         <div className="page-header">
//           <div>
//             <h1>Employee Management</h1>
//             <p>Manage staff details, roles, salary, shifts and active status.</p>
//           </div>
//         </div>

//         <form className="employee-form" onSubmit={handleSubmit}>
//           <input
//             name="name"
//             placeholder="Employee Name"
//             value={formData.name}
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
//             name="email"
//             placeholder="Email"
//             value={formData.email}
//             onChange={handleChange}
//           />

//           <select name="role" value={formData.role} onChange={handleChange}>
//             <option value="Admin">Admin</option>
//             <option value="Manager">Manager</option>
//             <option value="Cashier">Cashier</option>
//             <option value="Waiter">Waiter</option>
//             <option value="Chef">Chef</option>
//             <option value="Cleaner">Cleaner</option>
//           </select>

//           <input
//             name="salary"
//             type="number"
//             placeholder="Salary"
//             value={formData.salary}
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="shift_time"
//             placeholder="Shift Time"
//             value={formData.shift_time}
//             onChange={handleChange}
//             required
//           />

//           <input
//             name="joining_date"
//             type="date"
//             value={formData.joining_date}
//             onChange={handleChange}
//             required
//           />

//           <label className="check-label">
//             <input
//               type="checkbox"
//               name="is_active"
//               checked={formData.is_active}
//               onChange={handleChange}
//             />
//             Active
//           </label>

//           <button className="add-btn" type="submit">
//             {editingId ? "Update Employee" : "+ Add Employee"}
//           </button>
//         </form>

//         <div className="toolbar">
//           <input
//             type="text"
//             placeholder="Search employee by name, role or phone..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//         </div>

//         <table className="premium-table">
//           <thead>
//             <tr>
              
//               <th>Employee</th>
//               <th>Phone</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Salary</th>
//               <th>Shift</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {filteredEmployees.map((emp) => (
//               <tr key={emp.id}>
//                 <td className="item-name">👨‍🍳 {emp.name}</td>

//                 <td>{emp.phone}</td>

//                 <td>{emp.email || "-"}</td>

//                 <td>
//                   <span className="category-badge">{emp.role}</span>
//                 </td>

//                 <td className="price">₹{emp.salary}</td>

//                 <td>{emp.shift_time}</td>

//                 <td>
//                   {emp.is_active ? (
//                     <span className="available">Active</span>
//                   ) : (
//                     <span className="not-available">Inactive</span>
//                   )}
//                 </td>

//                 <td>
//                   <button
//                     className="edit-btn"
//                     onClick={() => handleEdit(emp)}
//                   >
//                     Edit
//                   </button>

//                   <button
//                     className="delete-btn"
//                     onClick={() => handleDelete(emp.id)}
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

// export default EmployeesPage;
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./EmployeesPage.css";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "Waiter",
    salary: "",
    shift_time: "",
    joining_date: "",
    is_active: true,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/employees/employees/");
    setEmployees(res.data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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
        `http://127.0.0.1:8000/api/employees/employees/${editingId}/`,
        formData
      );
      alert("Employee updated successfully");
    } else {
      await axios.post(
        "http://127.0.0.1:8000/api/employees/employees/",
        formData
      );
      alert("Employee added successfully");
    }

    setFormData({
      name: "",
      phone: "",
      email: "",
      role: "Waiter",
      salary: "",
      shift_time: "",
      joining_date: "",
      is_active: true,
    });

    setEditingId(null);
    fetchEmployees();
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);

    setFormData({
      name: employee.name,
      phone: employee.phone,
      email: employee.email || "",
      role: employee.role,
      salary: employee.salary,
      shift_time: employee.shift_time,
      joining_date: employee.joining_date,
      is_active: employee.is_active,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      await axios.delete(`http://127.0.0.1:8000/api/employees/employees/${id}/`);
      alert("Employee deleted successfully");
      fetchEmployees();
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      emp.phone.includes(search)
  );

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Employee Management</h1>
            <p>Manage staff details, roles, salary, shifts and active status.</p>
          </div>
        </div>

        <form className="employee-form" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Employee Name"
            value={formData.name}
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
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />

          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Cashier">Cashier</option>
            <option value="Waiter">Waiter</option>
            <option value="Chef">Chef</option>
            <option value="Cleaner">Cleaner</option>
          </select>

          <input
            name="salary"
            type="number"
            placeholder="Salary"
            value={formData.salary}
            onChange={handleChange}
            required
          />

          <input
            name="shift_time"
            placeholder="Shift Time"
            value={formData.shift_time}
            onChange={handleChange}
            required
          />

          <input
            name="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={handleChange}
            required
          />

          <label className="check-label">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>

          <button className="add-btn" type="submit">
            {editingId ? "Update Employee" : "+ Add Employee"}
          </button>
        </form>

        <div className="toolbar">
          <input
            type="text"
            placeholder="Search employee by name, role or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <table className="premium-table">
          <thead>
            <tr>
              
              <th>Employee</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr key={emp.id}>
                <td className="item-name">👨‍🍳 {emp.name}</td>

                <td>{emp.phone}</td>

                <td>{emp.email || "-"}</td>

                <td>
                  <span className="category-badge">{emp.role}</span>
                </td>

                <td className="price">₹{emp.salary}</td>

                <td>{emp.shift_time}</td>

                <td>
                  {emp.is_active ? (
                    <span className="available">Active</span>
                  ) : (
                    <span className="not-available">Inactive</span>
                  )}
                </td>

                <td>
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(emp)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(emp.id)}
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

export default EmployeesPage;