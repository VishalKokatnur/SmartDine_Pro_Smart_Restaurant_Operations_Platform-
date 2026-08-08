
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    today_sales: 0,
    total_sales: 0,
    today_orders: 0,
    total_orders: 0,
    active_orders: 0,
    billed_orders: 0,
    cancelled_orders: 0,
    today_bills: 0,
    total_bills: 0,
    total_customers: 0,
    total_employees: 0,
    total_menu_items: 0,
    total_tables: 0,
    available_tables: 0,
    occupied_tables: 0,
    billing_tables: 0,
    total_inventory_items: 0,
    low_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    payment_summary: [],
    recent_bills: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://127.0.0.1:8000/api/reports/dashboard/"
      );

      setDashboard({
        today_sales: Number(response.data?.today_sales || 0),
        total_sales: Number(response.data?.total_sales || 0),
        today_orders: Number(response.data?.today_orders || 0),
        total_orders: Number(response.data?.total_orders || 0),
        active_orders: Number(response.data?.active_orders || 0),
        billed_orders: Number(response.data?.billed_orders || 0),
        cancelled_orders: Number(response.data?.cancelled_orders || 0),
        today_bills: Number(response.data?.today_bills || 0),
        total_bills: Number(response.data?.total_bills || 0),
        total_customers: Number(response.data?.total_customers || 0),
        total_employees: Number(response.data?.total_employees || 0),
        total_menu_items: Number(response.data?.total_menu_items || 0),
        total_tables: Number(response.data?.total_tables || 0),
        available_tables: Number(response.data?.available_tables || 0),
        occupied_tables: Number(response.data?.occupied_tables || 0),
        billing_tables: Number(response.data?.billing_tables || 0),
        total_inventory_items: Number(response.data?.total_inventory_items || 0),
        low_stock: Number(response.data?.low_stock || 0),
        low_stock_count: Number(response.data?.low_stock_count || 0),
        out_of_stock_count: Number(response.data?.out_of_stock_count || 0),
        payment_summary: Array.isArray(response.data?.payment_summary)
          ? response.data.payment_summary
          : [],
        recent_bills: Array.isArray(response.data?.recent_bills)
          ? response.data.recent_bills
          : [],
      });
    } catch (error) {
      console.log("Dashboard fetch error", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
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

  const metricCards = [
    {
      label: "₹",
      title: "Today's Sales",
      value: formatMoney(dashboard.today_sales),
      text: "Daily restaurant revenue",
      path: "/reports/sales",
    },
    {
      label: "OD",
      title: "Today's Orders",
      value: dashboard.today_orders,
      text: `${dashboard.active_orders} active orders`,
      path: "/orders",
    },
    {
      label: "ST",
      title: "Stock Alerts",
      value: dashboard.low_stock_count,
      text: `${dashboard.out_of_stock_count} out of stock`,
      path: "/inventory/low-stock",
    },
    {
      label: "BL",
      title: "Total Bills",
      value: dashboard.total_bills,
      text: `${dashboard.today_bills} bills today`,
      path: "/bills",
    },
  ];

  const featureCards = [
    {
      title: "Order Management",
      tag: "OD",
      text: "Create, track and serve guest orders with table-based workflow.",
      path: "/orders",
      image:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Kitchen Display",
      tag: "KT",
      text: "Chef board for pending, cooking and ready orders.",
      path: "/kitchen",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Billing Counter",
      tag: "BL",
      text: "Premium POS billing with GST invoice and payment summary.",
      path: "/billing",
      image:
        "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=900&q=80",
    },
    {
      title: "Inventory Control",
      tag: "IN",
      text: "Manage stock, purchases, recipes and low-stock alerts.",
      path: "/inventory",
      image:
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const restaurantModules = [
    {
      title: "Table Floor",
      label: "TB",
      value: dashboard.total_tables,
      path: "/tables",
    },
    {
      title: "Customers",
      label: "CU",
      value: dashboard.total_customers,
      path: "/customers",
    },
    {
      title: "Employees",
      label: "EM",
      value: dashboard.total_employees,
      path: "/employees",
    },
    {
      title: "Inventory",
      label: "IN",
      value: dashboard.total_inventory_items,
      path: "/inventory",
    },
  ];

  if (loading) {
    return (
      <RestaurantLayout>
        <div className="dark-dashboard-loading">Loading SmartDine Pro...</div>
      </RestaurantLayout>
    );
  }

  return (
    <RestaurantLayout>
      <div className="dark-restaurant-dashboard">
        <section className="fine-dining-hero">
          <div className="hero-content">
            <span className="gold-pill">Premium Restaurant Control Center</span>

            <h1>
              Experience Smart
              <span> Dining Operations</span>
            </h1>

            <p>
              A luxury restaurant management console for orders, table service,
              kitchen workflow, GST billing, inventory and business reporting.
            </p>

            <div className="hero-search-strip">
              <div>
                <span>Today Sales</span>
                <strong>{formatMoney(dashboard.today_sales)}</strong>
              </div>

              <div>
                <span>Active Orders</span>
                <strong>{dashboard.active_orders}</strong>
              </div>

              <div>
                <span>Occupied Tables</span>
                <strong>{dashboard.occupied_tables}</strong>
              </div>

              <button onClick={() => navigate("/orders")}>Start Order</button>
            </div>
          </div>

          <div className="hero-side-card">
            <span className="partner-badge">Live Service</span>

            <h2>Today Overview</h2>

            <div className="side-stat">
              <span>Sales</span>
              <strong>{formatMoney(dashboard.today_sales)}</strong>
            </div>

            <div className="side-stat">
              <span>Orders</span>
              <strong>{dashboard.today_orders}</strong>
            </div>

            <div className="side-stat">
              <span>Bills</span>
              <strong>{dashboard.today_bills}</strong>
            </div>

            <div className="side-stat">
              <span>Low Stock</span>
              <strong>{dashboard.low_stock_count}</strong>
            </div>

            <button onClick={() => navigate("/reports/sales")}>
              View Full Report
            </button>
          </div>
        </section>

        <section className="metric-card-grid">
          {metricCards.map((card, index) => (
            <div
              key={index}
              className="luxury-metric-card"
              onClick={() => navigate(card.path)}
            >
              <span className="metric-label">{card.label}</span>

              <div>
                <h3>{card.title}</h3>
                <h2>{card.value}</h2>
                <p>{card.text}</p>
              </div>

              <button className="dashboard-open-btn">
                  Open
              </button>
            </div>
          ))}
        </section>

        <section className="section-title">
          <span>Featured Operations</span>
          <h2>
            Premium <strong>Restaurant Modules</strong>
          </h2>
          <p>
            Manage your full dining workflow with visual restaurant software
            sections.
          </p>
        </section>

        <section className="feature-card-grid">
          {featureCards.map((card, index) => (
            <div
              key={index}
              className="restaurant-feature-card"
              onClick={() => navigate(card.path)}
            >
              <div className="feature-image">
                <img src={card.image} alt={card.title} />
                <span>{card.tag}</span>
              </div>

              <div className="feature-content">
                <h3>{card.title}</h3>
                <p>{card.text}</p>
                <button>Open Module</button>
              </div>
            </div>
          ))}
        </section>

        <section className="section-title">
          <span>Dining Floor</span>
          <h2>
            Restaurant <strong>Business Snapshot</strong>
          </h2>
        </section>

        <section className="module-summary-grid">
          {restaurantModules.map((module, index) => (
            <div
              key={index}
              className="module-summary-card"
              onClick={() => navigate(module.path)}
            >
              <span>{module.label}</span>
              <h3>{module.title}</h3>
              <h2>{module.value}</h2>
            </div>
          ))}
        </section>

        <section className="status-grid">
          <div className="dark-panel">
            <div className="panel-heading">
              <div>
                <span>TB</span>
                <h2>Table Status</h2>
                <p>Live dining floor availability</p>
              </div>

              <button onClick={() => navigate("/tables")}>Manage</button>
            </div>

            <div className="panel-row">
              <span>Available Tables</span>
              <strong>{dashboard.available_tables}</strong>
            </div>

            <div className="panel-row">
              <span>Occupied Tables</span>
              <strong>{dashboard.occupied_tables}</strong>
            </div>

            <div className="panel-row">
              <span>Billing Tables</span>
              <strong>{dashboard.billing_tables}</strong>
            </div>
          </div>

          <div className="dark-panel">
            <div className="panel-heading">
              <div>
                <span>OD</span>
                <h2>Order Status</h2>
                <p>Service flow summary</p>
              </div>

              <button onClick={() => navigate("/orders")}>Manage</button>
            </div>

            <div className="panel-row">
              <span>Active Orders</span>
              <strong>{dashboard.active_orders}</strong>
            </div>

            <div className="panel-row">
              <span>Billed Orders</span>
              <strong>{dashboard.billed_orders}</strong>
            </div>

            <div className="panel-row">
              <span>Cancelled Orders</span>
              <strong>{dashboard.cancelled_orders}</strong>
            </div>
          </div>

          <div className="dark-panel">
            <div className="panel-heading">
              <div>
                <span>ST</span>
                <h2>Stock Alerts</h2>
                <p>Inventory health and purchase needs</p>
              </div>

              <button onClick={() => navigate("/inventory/low-stock")}>
                View
              </button>
            </div>

            <div className="panel-row">
              <span>Low Stock Items</span>
              <strong>{dashboard.low_stock_count}</strong>
            </div>

            <div className="panel-row">
              <span>Out of Stock</span>
              <strong>{dashboard.out_of_stock_count}</strong>
            </div>

            <div className="panel-row">
              <span>Total Inventory</span>
              <strong>{dashboard.total_inventory_items}</strong>
            </div>
          </div>
        </section>

        <section className="report-layout">
          <div className="dark-panel report-panel">
            <div className="panel-heading">
              <div>
                <span>PY</span>
                <h2>Payment Summary</h2>
                <p>Collection by payment method</p>
              </div>

              <button onClick={() => navigate("/reports/sales")}>
                Sales Report
              </button>
            </div>

            {dashboard.payment_summary.length === 0 ? (
              <div className="dark-empty-box">No payment data found.</div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Payment</th>
                    <th>Bills</th>
                    <th>Total</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.payment_summary.map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.payment_method || "-"}</td>
                      <td>{payment.count || 0}</td>
                      <td>{formatMoney(payment.total || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="dark-panel report-panel">
            <div className="panel-heading">
              <div>
                <span>RC</span>
                <h2>Recent Bills</h2>
                <p>Latest restaurant billing activity</p>
              </div>

              <button onClick={() => navigate("/bills")}>View Bills</button>
            </div>

            {dashboard.recent_bills.length === 0 ? (
              <div className="dark-empty-box">No recent bills found.</div>
            ) : (
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Bill</th>
                    <th>Customer</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {dashboard.recent_bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>#{bill.id}</td>
                      <td>{bill.customer_name || "Walk-in Customer"}</td>
                      <td>{bill.payment_method || "-"}</td>
                      <td>{formatMoney(bill.final_amount || 0)}</td>
                      <td>{formatDateTime(bill.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <section className="quick-actions-dark">
          <div className="section-title">
            <span>Fast Access</span>
            <h2>
              Daily <strong>Quick Controls</strong>
            </h2>
          </div>

          <div className="quick-action-buttons">
            <button onClick={() => navigate("/orders")}>New Order</button>
            <button onClick={() => navigate("/kitchen")}>Kitchen Board</button>
            <button onClick={() => navigate("/billing")}>Billing Counter</button>
            <button onClick={() => navigate("/purchase")}>Purchase Stock</button>
            <button onClick={() => navigate("/inventory/low-stock")}>
              Low Stock
            </button>
            <button onClick={() => navigate("/reports/sales")}>
              Sales Report
            </button>
          </div>
        </section>
      </div>
    </RestaurantLayout>
  );
}

export default DashboardPage;