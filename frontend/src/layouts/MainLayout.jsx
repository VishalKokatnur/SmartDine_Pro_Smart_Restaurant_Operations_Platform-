import { Link } from "react-router-dom";
import "./MainLayout.css";

function MainLayout({ children }) {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>SmartDine Pro</h2>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/menu">Menu Items</Link>
        <Link to="/tables">Tables</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/inventory">Inventory</Link>
        <Link to="/rooms">Rooms</Link>
        <Link to="/employees">Employees</Link>
        <Link to="/reports">Reports</Link>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;