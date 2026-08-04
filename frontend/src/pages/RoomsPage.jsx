import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";

function RoomsPage() {
  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Room Management</h1>
            <p>Manage hotel rooms, availability and room status.</p>
          </div>

          <button className="add-btn">+ Add Room</button>
        </div>

        <table className="menu-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Room Number</th>
              <th>Room Type</th>
              <th>Price / Day</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>1</td>
              <td>101</td>
              <td>Deluxe Room</td>
              <td>₹2500</td>
              <td>Available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </RestaurantLayout>
  );
}

export default RoomsPage;