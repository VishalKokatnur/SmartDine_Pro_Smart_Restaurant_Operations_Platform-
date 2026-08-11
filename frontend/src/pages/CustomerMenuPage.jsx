
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./CustomerMenuPage.css";
const API_BASE = "https://smartdine-pro-smart-restaurant.onrender.com/api/restaurant";
function CustomerMenuPage() {
  const { tableId: urlTableId } = useParams();

  // Resolved internal table id (from URL for legacy per-table QR,
  // or from the manual table-number lookup for the single shared QR).
  const [resolvedTableId, setResolvedTableId] = useState(urlTableId || null);

  // Table-number entry screen state (only used when there's no urlTableId)
  const [tableNumberInput, setTableNumberInput] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const [table, setTable] = useState(null);
  const [tableError, setTableError] = useState("");

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchText, setSearchText] = useState("");

  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [liveOrder, setLiveOrder] = useState(null);
  const [callSending, setCallSending] = useState("");
  const [callSent, setCallSent] = useState("");

  useEffect(() => {
    if (!resolvedTableId) return; // wait until table is resolved

    loadTable();
    loadMenu();
    loadLiveOrder();

    const interval = setInterval(loadLiveOrder, 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTableId]);

  const handleTableLookup = async (e) => {
    e.preventDefault();
    const number = tableNumberInput.trim();
    if (!number) return;

    try {
      setLookupLoading(true);
      setLookupError("");

      const response = await axios.get(
        `${API_BASE}/public/table-lookup/${encodeURIComponent(number)}/`
      );
      setResolvedTableId(response.data.id);
    } catch (error) {
      setLookupError(
        error.response?.data?.detail ||
          "Could not find that table. Please check the number and try again."
      );
    } finally {
      setLookupLoading(false);
    }
  };

  const loadTable = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/public/table/${resolvedTableId}/`
      );
      setTable(response.data);
      setTableError("");
    } catch (error) {
      setTableError(
        error.response?.data?.detail || "This table could not be found."
      );
    }
  };

  const loadMenu = async () => {
    try {
      const response = await axios.get(`${API_BASE}/public/menu/`);
      setMenuItems(response.data);
    } catch (error) {
      console.log("Menu load error", error);
    }
  };

  const loadLiveOrder = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/public/order-status/${resolvedTableId}/`
      );
      setLiveOrder(response.data.order);
    } catch (error) {
      console.log("Live order error", error);
    }
  };

  const categories = useMemo(() => {
    const unique = menuItems.map((item) => item.category || "Others");
    return ["All", ...new Set(unique)];
  }, [menuItems]);

  const filteredItems = menuItems.filter((item) => {
    const itemCategory = item.category || "Others";
    const matchCategory =
      selectedCategory === "All" || itemCategory === selectedCategory;
    const matchSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return matchCategory && matchSearch;
  });

  const cartEntries = Object.values(cart);
  const cartCount = cartEntries.reduce((sum, entry) => sum + entry.qty, 0);
  const cartSubtotal = cartEntries.reduce(
    (sum, entry) => sum + entry.qty * Number(entry.item.price || 0),
    0
  );
  const cartGst = cartSubtotal * 0.05;
  const cartTotal = cartSubtotal + cartGst;

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const qty = existing ? existing.qty + 1 : 1;
      return { ...prev, [item.id]: { item, qty } };
    });
  };

  const decreaseFromCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (!existing) return prev;

      if (existing.qty <= 1) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }

      return { ...prev, [item.id]: { item, qty: existing.qty - 1 } };
    });
  };

  const getQtyInCart = (itemId) => {
    return cart[itemId]?.qty || 0;
  };

  const placeOrder = async () => {
    if (cartEntries.length === 0) return;

    try {
      setPlacingOrder(true);

      const payload = {
        table: Number(resolvedTableId),
        items: cartEntries.flatMap((entry) =>
          Array(entry.qty).fill(entry.item.id)
        ),
      };

      await axios.post(`${API_BASE}/public/order/`, payload);

      setOrderPlaced(true);
      setCart({});
      setCartOpen(false);
      loadLiveOrder();

      setTimeout(() => setOrderPlaced(false), 4000);
    } catch (error) {
      const data = error.response?.data;
      const message =
        data?.items || data?.table || data?.detail || "Could not place order. Please try again.";
      alert(Array.isArray(message) ? message[0] : message);
    } finally {
      setPlacingOrder(false);
    }
  };

  const sendWaiterCall = async (requestType) => {
    try {
      setCallSending(requestType);

      await axios.post(`${API_BASE}/public/waiter-call/`, {
        table: Number(resolvedTableId),
        request_type: requestType,
      });

      setCallSent(requestType);
      setTimeout(() => setCallSent(""), 3000);
    } catch (error) {
      alert("Could not send request. Please try again.");
    } finally {
      setCallSending("");
    }
  };

  const statusSteps = ["Pending", "Preparing", "Ready", "Served"];
  const statusIndex = liveOrder ? statusSteps.indexOf(liveOrder.status) : -1;

  // ---- Screen 1: no table resolved yet -> ask for table number ----
  if (!resolvedTableId) {
    return (
      <div className="cq-page cq-page-error">
        <div className="cq-error-card">
          <div className="cq-header-brand" style={{ justifyContent: "center", marginBottom: 18 }}>
            <span className="cq-header-mark">SD</span>
            <div>
              <h1>SmartDine Pro</h1>
              <p>Scan. Select. Savor.</p>
            </div>
          </div>

          <h2 style={{ marginBottom: 8 }}>What's your table number?</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
            Check the number printed on your table and enter it below.
          </p>

          <form onSubmit={handleTableLookup} className="cq-entry-form">
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g. 12"
              value={tableNumberInput}
              onChange={(e) => setTableNumberInput(e.target.value)}
              className="cq-entry-input"
              autoFocus
            />

            {lookupError && (
              <p style={{ color: "var(--danger, #d33)", fontSize: 13, marginTop: 10 }}>
                {lookupError}
              </p>
            )}

            <button
              type="submit"
              className="cq-place-order-btn"
              disabled={lookupLoading || !tableNumberInput.trim()}
              style={{ marginTop: 16 }}
            >
              {lookupLoading ? "Checking..." : "Continue to Menu"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (tableError) {
    return (
      <div className="cq-page cq-page-error">
        <div className="cq-error-card">
          <h1>Table Unavailable</h1>
          <p>{tableError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cq-page">
      <header className="cq-header">
        <div className="cq-header-brand">
          <span className="cq-header-mark">SD</span>
          <div>
            <h1>SmartDine Pro</h1>
            <p>Scan. Select. Savor.</p>
          </div>
        </div>

        <div className="cq-header-table">
          <span>Table</span>
          <strong>{table ? table.table_number : "…"}</strong>
        </div>
      </header>

      {liveOrder && (
        <section className="cq-status-strip">
          <div className="cq-status-title">
            <span>Order #{liveOrder.id}</span>
            <strong>{liveOrder.status}</strong>
          </div>

          <div className="cq-status-track">
            {statusSteps.map((step, index) => (
              <div
                key={step}
                className={`cq-status-node ${
                  index <= statusIndex ? "cq-status-done" : ""
                }`}
              >
                <span className="cq-status-dot" />
                <span className="cq-status-label">{step}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {orderPlaced && (
        <div className="cq-toast">Order placed! The kitchen has it now.</div>
      )}

      <section className="cq-category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={selectedCategory === category ? "cq-tab-active" : ""}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className="cq-search">
        <input
          type="text"
          placeholder="Search dishes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </section>

      <section className="cq-menu-list">
        {filteredItems.length === 0 ? (
          <div className="cq-empty">No dishes match your search.</div>
        ) : (
          filteredItems.map((item) => {
            const qty = getQtyInCart(item.id);

            return (
              <div className="cq-menu-card" key={item.id}>
                <div className="cq-menu-info">
                  <h3>{item.name}</h3>
                  <p>{item.category}</p>
                  <strong>₹{Number(item.price).toFixed(2)}</strong>
                </div>

                {qty === 0 ? (
                  <button
                    className="cq-add-btn"
                    onClick={() => addToCart(item)}
                  >
                    Add
                  </button>
                ) : (
                  <div className="cq-qty-stepper">
                    <button onClick={() => decreaseFromCart(item)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>

      <section className="cq-help-row">
        <button
          disabled={callSending === "Water"}
          onClick={() => sendWaiterCall("Water")}
        >
          💧 {callSent === "Water" ? "Sent!" : "Water"}
        </button>

        <button
          disabled={callSending === "Tissue"}
          onClick={() => sendWaiterCall("Tissue")}
        >
          🧻 {callSent === "Tissue" ? "Sent!" : "Tissue"}
        </button>

        <button
          disabled={callSending === "Waiter"}
          onClick={() => sendWaiterCall("Waiter")}
        >
          🙋 {callSent === "Waiter" ? "Sent!" : "Call Waiter"}
        </button>

        <button
          disabled={callSending === "Bill"}
          onClick={() => sendWaiterCall("Bill")}
        >
          🧾 {callSent === "Bill" ? "Sent!" : "Get Bill"}
        </button>
      </section>

      {cartCount > 0 && !cartOpen && (
        <button className="cq-cart-bar" onClick={() => setCartOpen(true)}>
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <strong>₹{cartTotal.toFixed(2)}</strong>
        </button>
      )}

      {cartOpen && (
        <div className="cq-cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cq-cart-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="cq-cart-head">
              <h2>Your Order</h2>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className="cq-cart-items">
              {cartEntries.length === 0 ? (
                <div className="cq-empty">Your cart is empty.</div>
              ) : (
                cartEntries.map((entry) => (
                  <div className="cq-cart-item" key={entry.item.id}>
                    <div>
                      <h4>{entry.item.name}</h4>
                      <p>₹{Number(entry.item.price).toFixed(2)} each</p>
                    </div>

                    <div className="cq-qty-stepper">
                      <button onClick={() => decreaseFromCart(entry.item)}>
                        −
                      </button>
                      <span>{entry.qty}</span>
                      <button onClick={() => addToCart(entry.item)}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="cq-cart-total-box">
              <div>
                <span>Subtotal</span>
                <strong>₹{cartSubtotal.toFixed(2)}</strong>
              </div>

              <div>
                <span>GST 5%</span>
                <strong>₹{cartGst.toFixed(2)}</strong>
              </div>

              <div className="cq-cart-grand">
                <span>Total</span>
                <strong>₹{cartTotal.toFixed(2)}</strong>
              </div>
            </div>

            <button
              className="cq-place-order-btn"
              disabled={cartEntries.length === 0 || placingOrder}
              onClick={placeOrder}
            >
              {placingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMenuPage;