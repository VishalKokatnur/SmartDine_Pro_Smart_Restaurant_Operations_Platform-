import { useRef, useState } from "react";
import axios from "axios";
import "./LoginPage.css";
import vkLogo from "../assets/vk-logo.png";

// Render backend API
const LOGIN_API =
  "https://smartdine-pro-smart-restaurant.onrender.com/api/token/";

function LoginPage() {
  const scrollRef = useRef(null);

  const dragRef = useRef({
    active: false,
    startY: 0,
    scrollTop: 0,
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getRoleRedirectPath = (role) => {
    if (role === "Chef") return "/kitchen";
    if (role === "Cashier") return "/billing";
    if (role === "Waiter") return "/orders";

    return "/dashboard";
  };

  const handleMouseDown = (e) => {
    const blockedElement = e.target.closest(
      "input, button, select, textarea, a"
    );

    if (blockedElement) return;

    if (!scrollRef.current) return;

    dragRef.current.active = true;
    dragRef.current.startY = e.pageY;
    dragRef.current.scrollTop = scrollRef.current.scrollTop;

    scrollRef.current.classList.add("is-dragging");
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.active || !scrollRef.current) return;

    e.preventDefault();

    const moveY = e.pageY - dragRef.current.startY;

    scrollRef.current.scrollTop =
      dragRef.current.scrollTop - moveY;
  };

  const stopDrag = () => {
    dragRef.current.active = false;

    if (scrollRef.current) {
      scrollRef.current.classList.remove("is-dragging");
    }
  };

  const scrollToLogin = () => {
    const loginCard = document.getElementById(
      "smartdine-login-card"
    );

    if (loginCard) {
      loginCard.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username.trim()) {
      alert("Please enter username");
      return;
    }

    if (!password.trim()) {
      alert("Please enter password");
      return;
    }

    try {
      setLoading(true);

      console.log("Sending login request to:", LOGIN_API);

      const response = await axios.post(
        LOGIN_API,
        {
          username: username.trim(),
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data || {};

      console.log("Login response:", data);

      /*
       * Django Simple JWT normally returns:
       *
       * {
       *   "refresh": "...",
       *   "access": "..."
       * }
       *
       * Your backend may also return role/user information.
       */

      const accessToken =
        data.access ||
        data.access_token ||
        data.token ||
        data.jwt;

      const refreshToken =
        data.refresh ||
        data.refresh_token ||
        "";

      const role =
        data.role ||
        data.user_role ||
        data.group ||
        data.user?.role ||
        data.user?.group;

      // Token must exist
      if (!accessToken) {
        console.log("Backend response:", data);

        alert(
          "Login successful, but access token was not received from the backend."
        );

        return;
      }

      /*
       * Save authentication information.
       */

      localStorage.setItem("access", accessToken);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("token", accessToken);

      if (refreshToken) {
        localStorage.setItem("refresh", refreshToken);
        localStorage.setItem("refresh_token", refreshToken);
      }

      localStorage.setItem("username", username.trim());

      /*
       * If backend sends role, save it.
       */
      if (role) {
        localStorage.setItem("role", role);
      }

      /*
       * Redirect according to role.
       *
       * If backend does not return role,
       * dashboard is used as fallback.
       */
      const redirectPath = getRoleRedirectPath(role);

      console.log("User role:", role);
      console.log("Redirecting to:", redirectPath);

      window.location.href = redirectPath;
    } catch (error) {
      console.error("Login error:", error);

      /*
       * Django usually returns:
       *
       * {
       *   "detail": "No active account found with the given credentials"
       * }
       */

      const backendMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error;

      if (backendMessage) {
        alert(backendMessage);
      } else if (error.response) {
        alert(
          `Login failed. Server returned status ${error.response.status}.`
        );
      } else if (error.request) {
        alert(
          "Cannot connect to the backend server. Please check that the Render backend is running."
        );
      } else {
        alert("Unable to login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="smartdine-drag-page"
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* ================= NAVBAR ================= */}

      <header className="smartdine-landing-nav">
        <div className="smartdine-nav-brand">
          <img
            src={vkLogo}
            alt="VK Logo"
            className="smartdine-login-logo"
          />

          <div>
            <h2>SmartDine Pro</h2>
            <p>Premium Restaurant Management</p>
          </div>
        </div>

        <nav>
          <button type="button">POS</button>
          <button type="button">Kitchen</button>
          <button type="button">Billing</button>
          <button type="button">Inventory</button>
        </nav>

        <button
          type="button"
          className="smartdine-nav-login-btn"
          onClick={scrollToLogin}
        >
          Login
        </button>
      </header>

      {/* ================= MAIN ================= */}

      <main className="smartdine-landing-main">

        {/* ================= HERO ================= */}

        <section className="smartdine-hero-section">
          <div className="smartdine-hero-content">

            <span className="smartdine-mini-pill">
              Finally restaurant software that runs like it should
            </span>

            <h1>
              Smart restaurant
              <br />
              operations for
              <br />
              premium dining.
            </h1>

            <p>
              Manage dining tables, kitchen orders, GST billing,
              inventory, purchases, customers and daily reports
              from one elegant restaurant control center.
            </p>

            <div className="smartdine-hero-actions">
              <button
                type="button"
                onClick={scrollToLogin}
              >
                Login to Dashboard
              </button>

              <button
                type="button"
                className="outline"
              >
                View Features
              </button>
            </div>

            <div className="smartdine-hero-stats">
              <div>
                <strong>60s</strong>
                <span>Order entry</span>
              </div>

              <div>
                <strong>POS</strong>
                <span>Billing ready</span>
              </div>

              <div>
                <strong>KOT</strong>
                <span>Kitchen flow</span>
              </div>

              <div>
                <strong>GST</strong>
                <span>Invoice ready</span>
              </div>
            </div>
          </div>

          {/* ================= LOGIN CARD ================= */}

          <div
            className="smartdine-login-card"
            id="smartdine-login-card"
          >
            <div className="smartdine-card-top">
              <img
                src={vkLogo}
                alt="VK Logo"
                className="smartdine-login-logo"
              />

              <div>
                <h2>Welcome Back</h2>
                <p>Login to SmartDine Pro</p>
              </div>
            </div>

            <form onSubmit={handleLogin}>

              {/* USERNAME */}

              <div className="smartdine-field">
                <label htmlFor="username">
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              {/* PASSWORD */}

              <div className="smartdine-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="smartdine-password-row">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="smartdine-login-submit"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Login to Dashboard"}
              </button>
            </form>

            <div className="smartdine-role-box">
              <span>
                Role-based access enabled
              </span>

              <strong>
                Admin / Manager / Waiter / Chef / Cashier
              </strong>
            </div>
          </div>
        </section>

        {/* ================= MARQUEE ================= */}

        <div className="smartdine-marquee">
          <span>Role-Based Access</span>
          <span>GST Billing</span>
          <span>Kitchen Order Tickets</span>
          <span>Inventory Tracking</span>
          <span>Low Stock Alerts</span>
          <span>Sales Reports</span>
        </div>

        {/* ================= FEATURES ================= */}

        <section className="smartdine-section">
          <div className="smartdine-section-title">
            <span>Built for restaurants</span>

            <h2>
              Not just another admin panel.
              <br />
              Built for daily restaurant workflow.
            </h2>
          </div>

          <div className="smartdine-feature-grid">

            <div className="smartdine-feature-card">
              <span>OD</span>
              <h3>Order Management</h3>
              <p>
                Create table-wise orders, select menu
                items and send orders to the kitchen
                workflow.
              </p>
            </div>

            <div className="smartdine-feature-card">
              <span>KT</span>
              <h3>Kitchen Display</h3>
              <p>
                Chef can move orders from Pending to
                Cooking and Ready with clean queue
                visibility.
              </p>
            </div>

            <div className="smartdine-feature-card">
              <span>BL</span>
              <h3>Billing Counter</h3>
              <p>
                Generate GST bills, track payment
                method and make tables available
                after billing.
              </p>
            </div>

            <div className="smartdine-feature-card">
              <span>IN</span>
              <h3>Inventory Control</h3>
              <p>
                Manage grocery items, purchase restock,
                recipes and low stock alerts.
              </p>
            </div>

            <div className="smartdine-feature-card">
              <span>TB</span>
              <h3>Table Status</h3>
              <p>
                Track Available, Occupied and Billing
                tables automatically from order flow.
              </p>
            </div>

            <div className="smartdine-feature-card">
              <span>RP</span>
              <h3>Reports</h3>
              <p>
                View daily sales, payment summary,
                GST, bills and revenue reports.
              </p>
            </div>

          </div>
        </section>

        {/* ================= RESTAURANT FLOW ================= */}

        <section className="smartdine-menu-section">

          <span className="smartdine-flow-badge">
            <i className="ti ti-bolt"></i>
            Fast restaurant workflow
          </span>

          <div className="smartdine-flow-heading">
            Your entire restaurant flow
            <br />
            in <span>one dashboard</span>
          </div>

          <p className="smartdine-flow-desc">
            SmartDine Pro keeps waiter, kitchen,
            cashier and manager work connected so your
            restaurant runs smoothly during rush hours.
          </p>

          <div className="smartdine-flow-checklist">

            <div className="smartdine-flow-check-item">
              <span className="smartdine-flow-check-icon">
                <i className="ti ti-check"></i>
              </span>

              <span>Waiter creates order</span>
            </div>

            <div className="smartdine-flow-check-item">
              <span className="smartdine-flow-check-icon">
                <i className="ti ti-check"></i>
              </span>

              <span>
                Chef prepares and marks ready
              </span>
            </div>

            <div className="smartdine-flow-check-item">
              <span className="smartdine-flow-check-icon">
                <i className="ti ti-check"></i>
              </span>

              <span>
                Cashier generates GST bill
              </span>
            </div>

            <div className="smartdine-flow-check-item">
              <span className="smartdine-flow-check-icon">
                <i className="ti ti-check"></i>
              </span>

              <span>
                Inventory updates from purchases
                and recipes
              </span>
            </div>

          </div>

          <div className="smartdine-flow-card">

            <div>
              <span>1</span>
              <strong>Table order</strong>
            </div>

            <div>
              <span>2</span>
              <strong>Kitchen queue</strong>
            </div>

            <div>
              <span>3</span>
              <strong>Billing counter</strong>
            </div>

            <div>
              <span>4</span>
              <strong>Sales report</strong>
            </div>

          </div>
        </section>

        {/* ================= MODULES ================= */}

        <section className="smartdine-pricing-section">

          <div className="smartdine-section-title">
            <span>Software modules</span>

            <h2>
              Simple. Professional. Ready for clients.
            </h2>
          </div>

          <div className="smartdine-module-grid">

            <div>
              <h3>Restaurant</h3>
              <p>
                Orders, Kitchen, Billing, Tables,
                Customers
              </p>
            </div>

            <div>
              <h3>Inventory</h3>
              <p>
                Stock, Purchase, Recipe,
                Low Stock Alerts
              </p>
            </div>

            <div>
              <h3>Reports</h3>
              <p>
                Sales, GST, Payment Summary,
                Bill History
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}

export default LoginPage;