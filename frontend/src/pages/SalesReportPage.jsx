import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./SalesReportPage.css";

const PAYMENT_COLORS = {
  Cash: "#22c55e",
  UPI: "#6366f1",
  Card: "#f59e0b",
  Online: "#ec4899",
};
const FALLBACK_COLORS = ["#22c55e", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9", "#a855f7"];

function SalesReportPage() {
  const defaultReport = {
    total_sales: 0,
    total_gst: 0,
    total_discount: 0,
    total_bills: 0,
    cash_sales: 0,
    upi_sales: 0,
    card_sales: 0,
    payment_summary: [],
    date_wise_sales: [],
    bills: [],
    item_sales: [],
  };

  const [report, setReport] = useState(defaultReport);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const normalizeReport = (data) => {
    const summary = data?.summary || {};

    return {
      total_sales: Number(data?.total_sales ?? summary?.total_sales ?? 0),
      total_gst: Number(data?.total_gst ?? summary?.total_gst ?? 0),
      total_discount: Number(
        data?.total_discount ?? summary?.total_discount ?? 0
      ),
      total_bills: Number(data?.total_bills ?? summary?.total_bills ?? 0),

      cash_sales: Number(data?.cash_sales ?? summary?.cash_sales ?? 0),
      upi_sales: Number(data?.upi_sales ?? summary?.upi_sales ?? 0),
      card_sales: Number(data?.card_sales ?? summary?.card_sales ?? 0),

      payment_summary: Array.isArray(data?.payment_summary)
        ? data.payment_summary
        : [],

      date_wise_sales: Array.isArray(data?.date_wise_sales)
        ? data.date_wise_sales
        : [],

      bills: Array.isArray(data?.bills) ? data.bills : [],

      // Optional: backend can return this as [{ name, quantity }, ...]
      // for the "Top Selling Items" chart. Falls back gracefully if absent.
      // item_sales: Array.isArray(data?.item_sales) ? data.item_sales : [],
    };
  };

  const fetchSalesReport = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      if (startDate && endDate) {
        params.append("start_date", startDate);
        params.append("end_date", endDate);
      }

      if (paymentMethod) {
        params.append("payment_method", paymentMethod);
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/reports/sales/?${params.toString()}`
      );

      const safeReport = normalizeReport(response.data);
      setReport(safeReport);
    } catch (error) {
      console.log("Error fetching sales report", error);
      alert("Failed to load sales report");
      setReport(defaultReport);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, startDate, endDate, paymentMethod]);

  useEffect(() => {
    fetchSalesReport();
  }, [fetchSalesReport]);

  const clearFilters = () => {
    setDate("");
    setStartDate("");
    setEndDate("");
    setPaymentMethod("");

    setTimeout(() => {
      fetchSalesReport();
    }, 200);
  };

  const formatMoney = (amount) => {
    return Number(amount || 0).toFixed(2);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const parsedDate = new Date(dateValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return parsedDate.toLocaleString();
  };

  const getDateWiseDate = (item) => {
    return item.date || item.sale_date || item.created_at || "-";
  };

  const getDateWiseBills = (item) => {
    return item.bills || item.count || 0;
  };

  const printReport = () => {
    window.print();
  };

  // ---------- Chart data (derived, memoized) ----------

  // Sales trend / revenue-by-day: sorted ascending by date so the line chart reads left-to-right
  const trendData = useMemo(() => {
    return [...report.date_wise_sales]
      .map((item) => ({
        date: getDateWiseDate(item),
        bills: Number(getDateWiseBills(item)),
        total: Number(item.total || 0),
      }))
      .filter((item) => item.date !== "-")
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [report.date_wise_sales]);

  const paymentPieData = useMemo(() => {
    // The API can return one row per bill instead of one aggregated row per
    // payment method, which creates a pie chart with many duplicate slices.
    // Merge rows that share the same payment method before charting.
    const totalsByMethod = new Map();

    report.payment_summary.forEach((item) => {
      const name = item.payment_method || "Unknown";
      const existing = totalsByMethod.get(name) || { name, value: 0, count: 0 };
      existing.value += Number(item.total || 0);
      existing.count += Number(item.count || 0);
      totalsByMethod.set(name, existing);
    });

    return Array.from(totalsByMethod.values()).filter((item) => item.value > 0);
  }, [report.payment_summary]);

  const paymentTotal = useMemo(
    () => paymentPieData.reduce((sum, item) => sum + item.value, 0),
    [paymentPieData]
  );

  // const topItemsData = useMemo(() => {
  //   return [...report.item_sales]
  //     .map((item) => ({
  //       name: item.name || item.item_name || "Unknown",
  //       quantity: Number(item.quantity ?? item.qty ?? item.count ?? 0),
  //     }))
  //     .sort((a, b) => b.quantity - a.quantity)
  //     .slice(0, 8);
  // }, [report.item_sales]);

  const avgBillValue =
    report.total_bills > 0 ? report.total_sales / report.total_bills : 0;

  return (
    <RestaurantLayout>
      <div className="sales-report-page">
        <div className="sales-header no-print">
          <div>
            <h1>Sales Report</h1>
            <p>View date-wise sales, GST, discount and payment collection.</p>
          </div>

          <button className="print-report-btn" onClick={printReport}>
            Print Report
          </button>
        </div>

        <div className="filter-section no-print">
          <div className="filter-box">
            <label>Single Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="filter-box">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">All</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>

          <button className="apply-btn" onClick={fetchSalesReport}>
            Apply
          </button>

          <button className="reset-btn" onClick={clearFilters}>
            Clear
          </button>
        </div>

        {loading ? (
          <div className="loading-box">Loading sales report...</div>
        ) : (
          <>
            <div className="print-title">
              <h2>SmartDine Pro - Sales Report</h2>
              <p>Generated Report</p>
            </div>

            <div className="summary-grid">
              <div className="summary-box">
                <h3>₹{formatMoney(report.total_sales)}</h3>
                <p>Total Sales</p>
              </div>

              <div className="summary-box">
                <h3>₹{formatMoney(report.total_gst)}</h3>
                <p>GST Collection</p>
              </div>

              <div className="summary-box">
                <h3>₹{formatMoney(report.total_discount)}</h3>
                <p>Total Discount</p>
              </div>

              <div className="summary-box">
                <h3>{report.total_bills}</h3>
                <p>Total Bills</p>
              </div>
            </div>

            <div className="payment-grid">
              <div className="payment-card">
                <h3>₹{formatMoney(report.cash_sales)}</h3>
                <p>Cash Collection</p>
              </div>

              <div className="payment-card">
                <h3>₹{formatMoney(report.upi_sales)}</h3>
                <p>UPI Collection</p>
              </div>

              <div className="payment-card">
                <h3>₹{formatMoney(report.card_sales)}</h3>
                <p>Card Collection</p>
              </div>
            </div>

            {/* ---------------- Analytics Charts ---------------- */}
            <div className="report-card no-print">
              <h2>Sales Analytics</h2>

              <div className="analytics-summary-strip">
                <div>
                  <h4>₹{formatMoney(report.total_sales)}</h4>
                  <span>Revenue</span>
                </div>
                <div>
                  <h4>₹{formatMoney(report.total_gst)}</h4>
                  <span>GST</span>
                </div>
                <div>
                  <h4>{report.total_bills}</h4>
                  <span>Bills</span>
                </div>
                <div>
                  <h4>₹{formatMoney(avgBillValue)}</h4>
                  <span>Avg Bill</span>
                </div>
              </div>

              <div className="charts-grid">
                {/* Sales Trend - Line Chart */}
                <div className="chart-box">
                  <h3>Sales Trend</h3>
                  {trendData.length === 0 ? (
                    <p className="chart-empty">No date-wise sales to chart.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`₹${formatMoney(value)}`, "Sales"]}
                        />
                        <Line
                          type="monotone"
                          dataKey="total"
                          stroke="#6366f1"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Payment Distribution - Pie Chart */}
                <div className="chart-box">
                  <h3>Payment Distribution</h3>
                  {paymentPieData.length === 0 ? (
                    <p className="chart-empty">No payment data to chart.</p>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie
                            data={paymentPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={2}
                            label={({ value }) =>
                              paymentTotal > 0
                                ? `${Math.round((value / paymentTotal) * 100)}%`
                                : ""
                            }
                            labelLine={false}
                          >
                            {paymentPieData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  PAYMENT_COLORS[entry.name] ||
                                  FALLBACK_COLORS[index % FALLBACK_COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value, name) => [`₹${formatMoney(value)}`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pie-legend">
                        {paymentPieData.map((entry, index) => (
                          <div className="pie-legend-item" key={entry.name}>
                            <span
                              className="pie-legend-swatch"
                              style={{
                                backgroundColor:
                                  PAYMENT_COLORS[entry.name] ||
                                  FALLBACK_COLORS[index % FALLBACK_COLORS.length],
                              }}
                            />
                            <span className="pie-legend-label">{entry.name}</span>
                            <span className="pie-legend-value">
                              ₹{formatMoney(entry.value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="report-card">
              <h2>Payment Summary</h2>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Payment Method</th>
                    <th>Total Bills</th>
                    <th>Total Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {report.payment_summary.length === 0 ? (
                    <tr>
                      <td colSpan="3">No payment data found.</td>
                    </tr>
                  ) : (
                    report.payment_summary.map((item, index) => (
                      <tr key={index}>
                        <td>{item.payment_method || "-"}</td>
                        <td>{item.count || 0}</td>
                        <td>₹{formatMoney(item.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="report-card">
              <h2>Date-wise Sales</h2>

              <table className="report-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Bills</th>
                    <th>Total Sales</th>
                  </tr>
                </thead>

                <tbody>
                  {report.date_wise_sales.length === 0 ? (
                    <tr>
                      <td colSpan="3">No date-wise sales found.</td>
                    </tr>
                  ) : (
                    report.date_wise_sales.map((item, index) => (
                      <tr key={index}>
                        <td>{getDateWiseDate(item)}</td>
                        <td>{getDateWiseBills(item)}</td>
                        <td>₹{formatMoney(item.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="report-card">
              <h2>Bill Details</h2>

              <table className="report-table bill-detail-table">
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Discount</th>
                    <th>GST</th>
                    <th>Final Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {report.bills.length === 0 ? (
                    <tr>
                      <td colSpan="11">No bills found.</td>
                    </tr>
                  ) : (
                    report.bills.map((bill) => (
                      <tr key={bill.id}>
                        <td>#{bill.bill_number || bill.id}</td>
                        <td>Order #{bill.order || "-"}</td>
                        <td>{bill.customer_name || "Walk-in Customer"}</td>
                        <td>{bill.phone || "-"}</td>
                        <td>₹{formatMoney(bill.total_amount)}</td>
                        <td>₹{formatMoney(bill.discount)}</td>
                        <td>₹{formatMoney(bill.tax_amount)}</td>
                        <td className="green-price">
                          ₹{formatMoney(bill.final_amount)}
                        </td>
                        <td>{bill.payment_method || "-"}</td>
                        <td>{bill.payment_status || "-"}</td>
                        <td>{formatDate(bill.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </RestaurantLayout>
  );
}

export default SalesReportPage;