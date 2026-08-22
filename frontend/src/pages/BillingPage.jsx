import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantLayout from "../layouts/RestaurantLayout";
import "./DashboardPage.css";
import "./BillingPage.css";

function BillingPage() {
  // ---- Configure your real UPI details here ----
  const MERCHANT_UPI_ID = "7483251136@ybl"; // <-- replace with your real UPI ID (e.g. yourname@okaxis)
  const MERCHANT_NAME = "SmartDine Pro";
  // ------------------------------------------------

  const [tables, setTables] = useState([]);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [discount, setDiscount] = useState(0);

  const [savedBill, setSavedBill] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const BILLING_ALLOWED_STATUSES = ["Served"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tableRes, orderRes, menuRes, billRes] = await Promise.all([
        axios.get("https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/tables/"),
        axios.get("https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/orders/"),
        axios.get("https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/menu-items/"),
        axios.get("https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/bills/"),
      ]);

      setTables(tableRes.data);
      setOrders(orderRes.data);
      setMenuItems(menuRes.data);
      setBills(billRes.data);
    } catch (error) {
      console.log("Billing fetch error", error);
      alert("Failed to load billing data");
    }
  };

  // Keep digits only and cap at 10 characters
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(digitsOnly);
  };

  const getBackendErrorMessage = (error) => {
    const data = error.response?.data;

    if (!data) return "Bill save failed";

    if (typeof data === "string") return data;

    if (data.order) {
      if (Array.isArray(data.order)) return data.order[0];
      return data.order;
    }

    if (data.stock) {
      if (Array.isArray(data.stock)) return data.stock.join("\n");
      return data.stock;
    }

    if (data.non_field_errors) {
      if (Array.isArray(data.non_field_errors)) {
        return data.non_field_errors[0];
      }
      return data.non_field_errors;
    }

    if (data.detail) return data.detail;

    const messages = [];

    Object.keys(data).forEach((key) => {
      const value = data[key];

      if (Array.isArray(value)) {
        messages.push(`${key}: ${value.join(", ")}`);
      } else {
        messages.push(`${key}: ${value}`);
      }
    });

    return messages.length > 0 ? messages.join("\n") : JSON.stringify(data);
  };

  const orderAlreadyBilled = (orderId) => {
    return bills.some((bill) => Number(bill.order) === Number(orderId));
  };

  const servedUnbilledOrders = orders.filter((order) => {
    const isServed = BILLING_ALLOWED_STATUSES.includes(order.status);
    const isNotBilled = !orderAlreadyBilled(order.id);

    return isServed && isNotBilled;
  });

  const getTableName = (tableId) => {
    const table = tables.find((t) => Number(t.id) === Number(tableId));
    return table ? table.table_number : tableId;
  };

  const getOrderItems = (order) => {
    if (!order || !Array.isArray(order.items)) return [];

    return order.items
      .map((orderItem) => {
        const itemId =
          typeof orderItem === "object"
            ? orderItem.id || orderItem.menu_item || orderItem.menu_item_id
            : orderItem;

        const menuItem = menuItems.find((m) => Number(m.id) === Number(itemId));

        if (!menuItem) return null;

        return {
          id: menuItem.id,
          name: menuItem.name,
          price: Number(menuItem.price || 0),
          quantity: 1,
          subtotal: Number(menuItem.price || 0),
        };
      })
      .filter(Boolean);
  };

  const billItems = getOrderItems(selectedOrder);

  const subtotal = billItems.reduce((sum, item) => {
    return sum + Number(item.subtotal || 0);
  }, 0);

  const gstAmount = subtotal * 0.05;
  const discountAmount = Number(discount || 0);
  const grandTotal = subtotal + gstAmount - discountAmount;

  const getUpiQrUrl = () => {
    const amount = grandTotal > 0 ? grandTotal.toFixed(2) : "0.00";

    const note = selectedOrder
      ? `SmartDine Order ${selectedOrder.id}`
      : "SmartDine Pro Bill";

    const upiUri =
      `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}` +
      `&pn=${encodeURIComponent(MERCHANT_NAME)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent(note)}`;

    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(
      upiUri
    )}`;
  };

  const handleOrderSelect = (e) => {
    const orderId = e.target.value;

    setSelectedOrderId(orderId);
    setSavedBill(null);
    setPaymentConfirmed(false);

    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    const order = orders.find((o) => Number(o.id) === Number(orderId));

    if (!order) {
      setSelectedOrder(null);
      return;
    }

    if (orderAlreadyBilled(order.id)) {
      alert("This order already has a bill. Please print it from Bill History.");
      setSelectedOrderId("");
      setSelectedOrder(null);
      return;
    }

    if (!BILLING_ALLOWED_STATUSES.includes(order.status)) {
      alert("Only Served orders can be billed.");
      setSelectedOrderId("");
      setSelectedOrder(null);
      return;
    }

    setSelectedOrder(order);
  };

  const saveBill = async () => {
    if (!selectedOrder) {
      alert("Please select a served order");
      return;
    }

    if (billItems.length === 0) {
      alert("Selected order has no items");
      return;
    }

    if (savedBill) {
      alert("This bill is already saved. You can print it.");
      return;
    }

    if (phone && phone.length !== 10) {
      alert("Phone number must be exactly 10 digits");
      return;
    }

    if (discountAmount < 0) {
      alert("Discount cannot be negative");
      return;
    }

    if (grandTotal < 0) {
      alert("Grand total cannot be negative");
      return;
    }
    if (
      (paymentMethod === "UPI" || paymentMethod === "Online") &&
      !paymentConfirmed
    ) {
      alert("Please confirm payment before saving the bill.");
      return;
    }
   
    try {
      setLoading(true);

      const payload = {
        order: selectedOrder.id,
        customer_name: customerName || "Walk-in Customer",
        phone: phone || "-",
        total_amount: subtotal.toFixed(2),
        discount: discountAmount.toFixed(2),
        tax_amount: gstAmount.toFixed(2),
        final_amount: grandTotal.toFixed(2),
        payment_method: paymentMethod,
        payment_status: "Paid",
      };

      const response = await axios.post(
        "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant/bills/",
        payload
      );

      alert("Bill saved successfully. Stock deducted automatically.");

      setSavedBill(response.data);

      await fetchData();
    } catch (error) {
      console.log("Bill save error", error);
      alert(getBackendErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const printBill = () => {
    if (!selectedOrder) {
      alert("Please select an order first");
      return;
    }

    window.print();
  };

  const resetBilling = () => {
    setSelectedOrderId("");
    setSelectedOrder(null);
    setSavedBill(null);
    setPaymentConfirmed(false);
    setCustomerName("Walk-in Customer");
    setPhone("");
    setPaymentMethod("Cash");
    setDiscount(0);
    fetchData();
  };

  return (
    <RestaurantLayout>
      <div className="page-box billing-page-box">
        <div className="page-header">
          <div>
            <h1>Billing / POS</h1>
            <p>Create bill only after order is Served.</p>
          </div>
        </div>

        <div className="billing-content">
        <div className="billing-form">
          <div className="billing-field">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="billing-field">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              title="Phone number must be exactly 10 digits"
            />
          </div>

          <div className="billing-field">
            <label>Served Order</label>
            <select value={selectedOrderId} onChange={handleOrderSelect}>
              <option value="">Select Served Order</option>

              {servedUnbilledOrders.map((order) => (
                <option key={order.id} value={order.id}>
                  Order #{order.id} - Table {getTableName(order.table)} -{" "}
                  {order.status}
                </option>
              ))}
            </select>
          </div>

          <div className="billing-field">
            <label>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPaymentConfirmed(false);
              }}
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
            </select>
          </div>
              {paymentMethod === "Cash" && (
                <div className="payment-info">
                  <p>💵 Customer will pay at the counter.</p>
                </div>
              )}

              {paymentMethod === "Card" && (
                <div className="payment-info">
                  <p>💳 Swipe or tap your debit/credit card.</p>
                </div>
              )}

              {paymentMethod === "Online" && (
                <div className="payment-info">
                  <p>🌐 Customer can pay by scanning the QR code below.</p>
                </div>
              )}

          <div className="billing-field">
            <label>Discount</label>
            <input
              type="number"
              min="0"
              placeholder="Discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </div>

          <div className="billing-field button-field">
            <button
              type="button"
              className="refresh-billing-btn"
              onClick={resetBilling}
            >
              Refresh
            </button>
          </div>
        </div>

        {(paymentMethod === "UPI" || paymentMethod === "Online") && (
          <div className="payment-qr-card">
            <div className="payment-qr-image-wrap">
              <img
                src={getUpiQrUrl()}
                alt="Scan to pay"
                className="payment-qr-image"
              />
            </div>

            <div className="payment-qr-details">
              <span className="payment-qr-badge">Scan & Pay</span>

              <h3>
                Scan & Pay
              </h3>

              <p>
                Google Pay • PhonePe • Paytm • BHIM • Any UPI App
              </p>

              <div className="payment-qr-amount">
                <span>Amount</span>
                <strong>₹{grandTotal.toFixed(2)}</strong>
              </div>

              <div className="payment-qr-upi-id">
                UPI ID: <strong>{MERCHANT_UPI_ID}</strong>
              </div>
              <div className="payment-status-box">
                <h4>Payment Status</h4>

                {paymentConfirmed ? (
                  <span className="payment-success">
                    ✅ Payment Received
                  </span>
                ) : (
                  <span className="payment-pending">
                    ⏳ Waiting for customer payment...
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        {(paymentMethod === "Card" || paymentMethod === "Online") && (
          <div className="payment-method-note">
            {paymentMethod === "Card"
              ? "Insert or tap the customer's card on the POS terminal to complete payment."
              : "Complete the payment on your online payment gateway, then save the bill."}
          </div>
        )}

        {servedUnbilledOrders.length === 0 && !selectedOrder && (
          <div className="billing-warning-box">
            No served unbilled orders found. Order must be marked as Served
            before billing.
          </div>
        )}

        {savedBill && (
          <div className="billing-success-box">
            Bill saved successfully. Stock is deducted automatically. Table is
            now available and order is marked as billed. You can print this
            invoice.
          </div>
        )}

        {selectedOrder && (
          <div className="invoice-box" id="invoice">
            <div className="invoice-header">
              <h1>SmartDine Pro</h1>
              <p>Premium Restaurant Management</p>
              <p>GSTIN: 29ABCDE1234F1Z5</p>
              <h2>GST TAX INVOICE</h2>
            </div>

            <div className="invoice-details">
              <div>
                <p>
                  <strong>{savedBill ? "Bill No" : "Order No"}:</strong> #
                  {savedBill?.id || selectedOrder.id}
                </p>

                <p>
                  <strong>Customer:</strong>{" "}
                  {customerName || "Walk-in Customer"}
                </p>

                <p>
                  <strong>Phone:</strong> {phone || "-"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Table:</strong> {getTableName(selectedOrder.table)}
                </p>

                <p>
                  <strong>Date:</strong> {new Date().toLocaleDateString()}
                </p>

                <p>
                  <strong>Time:</strong> {new Date().toLocaleTimeString()}
                </p>
              </div>
            </div>

            <table className="billing-invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {billItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.price.toFixed(2)}</td>
                    <td>₹{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bill-total-box">
              <p>
                Subtotal: <strong>₹{subtotal.toFixed(2)}</strong>
              </p>

              <p>
                GST 5%: <strong>₹{gstAmount.toFixed(2)}</strong>
              </p>

              <p>
                Discount: <strong>₹{discountAmount.toFixed(2)}</strong>
              </p>

              <h2>Grand Total: ₹{grandTotal.toFixed(2)}</h2>

              <p>Payment Mode: {paymentMethod}</p>
            </div>

            <div className="invoice-footer">
              <p>Thank You! Visit Again</p>
              <p>This is a computer-generated invoice.</p>
            </div>
          </div>
        )}
        
        {selectedOrder &&
          (paymentMethod === "UPI" || paymentMethod === "Online") && (
            <button
              type="button"
              className="confirm-payment-btn"
              disabled={paymentConfirmed}
              onClick={() => {
                setPaymentConfirmed(true);
                alert("Payment Confirmed Successfully");
              }}
            >
              {paymentConfirmed
                ? "✅ Payment Confirmed"
                : "✅ Confirm Payment"}
            </button>
        )}
        {selectedOrder && (
          <div className="bill-actions">
            <button
              type="button"
              className="save-bill-btn"
              onClick={saveBill}
              disabled={
                loading ||
                savedBill ||
                ((paymentMethod === "UPI" || paymentMethod === "Online") &&
                  !paymentConfirmed)
              }
            >
              {savedBill
                ? "Bill Saved"
                : loading
                ? "Saving Bill..."
                : "Save Bill"}
            </button>

            <button
                type="button"
                className="print-bill-btn"
                onClick={printBill}
                disabled={!savedBill}
            >
                Print Bill
            </button>
          </div>
        )}
        </div>
      </div>
    </RestaurantLayout>
  );
}

export default BillingPage;