import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./DashboardPage.css";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

function ReportsPage() {
  const [bills, setBills] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/restaurant/bills/")
      .then((res) => setBills(res.data));

    axios
      .get("http://127.0.0.1:8000/api/restaurant/orders/")
      .then((res) => setOrders(res.data));
  }, []);

  const totalRevenue = bills.reduce(
    (sum, bill) => sum + Number(bill.final_amount || 0),
    0
  );

  const totalGST = bills.reduce(
    (sum, bill) => sum + Number(bill.tax_amount || 0),
    0
  );

  const totalDiscount = bills.reduce(
    (sum, bill) => sum + Number(bill.discount || 0),
    0
  );

  const cashTotal = bills
    .filter((bill) => bill.payment_method === "Cash")
    .reduce((sum, bill) => sum + Number(bill.final_amount || 0), 0);

  const upiTotal = bills
    .filter((bill) => bill.payment_method === "UPI")
    .reduce((sum, bill) => sum + Number(bill.final_amount || 0), 0);

  const cardTotal = bills
    .filter((bill) => bill.payment_method === "Card")
    .reduce((sum, bill) => sum + Number(bill.final_amount || 0), 0);

  const onlineTotal = bills
    .filter((bill) => bill.payment_method === "Online")
    .reduce((sum, bill) => sum + Number(bill.final_amount || 0), 0);

  const barData = {
    labels: ["Revenue", "GST", "Discount"],
    datasets: [
      {
        label: "Amount ₹",
        data: [totalRevenue, totalGST, totalDiscount],
        backgroundColor: ["#00695c", "#d6b35a", "#c0392b"],
      },
    ],
  };

  const pieData = {
    labels: ["Cash", "UPI", "Card", "Online"],
    datasets: [
      {
        data: [cashTotal, upiTotal, cardTotal, onlineTotal],
        backgroundColor: ["#00695c", "#d6b35a", "#1e3c72", "#8e44ad"],
      },
    ],
  };

  return (
    <RestaurantLayout>
      <div className="page-box">
        <div className="page-header">
          <div>
            <h1>Reports & Analytics</h1>
            <p>Track sales, payments, GST, discounts and business performance.</p>
          </div>
        </div>

        <div className="report-cards">
          <div className="report-card">
            <h3>Total Revenue</h3>
            <h1>₹{totalRevenue.toFixed(2)}</h1>
          </div>

          <div className="report-card">
            <h3>Total Bills</h3>
            <h1>{bills.length}</h1>
          </div>

          <div className="report-card">
            <h3>Total Orders</h3>
            <h1>{orders.length}</h1>
          </div>

          <div className="report-card">
            <h3>Total GST</h3>
            <h1>₹{totalGST.toFixed(2)}</h1>
          </div>
        </div>

        <div className="chart-grid">
          <div className="chart-box">
            <h2>Sales Summary</h2>
            <Bar data={barData} />
          </div>

          <div className="chart-box">
            <h2>Payment Methods</h2>
            <Pie data={pieData} />
          </div>
        </div>
      </div>
    </RestaurantLayout>
  );
}

export default ReportsPage;