import { useEffect, useState } from "react";

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    // Apply theme to HTML element
    document.documentElement.setAttribute("data-theme", theme);

    // Save theme
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark" ? "light" : "dark"
    );
  };

  return (
    <div className="restaurant-dashboard">

      {/* NAVBAR */}
      <nav className="restaurant-navbar">

        <div className="restaurant-logo">
          <h1>SmartDine Pro</h1>
          <p>Restaurant Management System</p>
        </div>

        <div className="restaurant-links">

          <a href="#dashboard" className="active-link">
            Dashboard
          </a>

          <a href="#menu">Menu</a>
          <a href="#orders">Orders</a>
          <a href="#kitchen">Kitchen</a>

          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "dark"
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

        </div>

      </nav>

      {/* HERO */}
      <section className="fine-dining-hero">

        <div>
          <h1>
            Welcome to <span>SmartDine</span>
          </h1>

          <p>
            Manage your restaurant with elegance,
            efficiency, and intelligence.
          </p>

          <button
            type="button"
            className="add-btn"
          >
            Explore Dashboard
          </button>
        </div>

        <div className="dark-panel page-box">

          <h2>Today's Overview</h2>

          <div className="panel-row">
            <span>Total Orders</span>
            <strong>128</strong>
          </div>

          <div className="panel-row">
            <span>Revenue</span>
            <strong>₹84,500</strong>
          </div>

          <div className="panel-row">
            <span>Active Tables</span>
            <strong>24</strong>
          </div>

        </div>

      </section>

      {/* SUMMARY CARDS */}
      <section className="kitchen-summary-grid">

        <div className="luxury-metric-card page-box">
          <h3>Total Revenue</h3>
          <h2>₹84,500</h2>
          <p>Today's revenue</p>
        </div>

        <div className="luxury-metric-card page-box">
          <h3>Total Orders</h3>
          <h2>128</h2>
          <p>Orders received today</p>
        </div>

        <div className="luxury-metric-card page-box">
          <h3>Active Tables</h3>
          <h2>24</h2>
          <p>Currently occupied</p>
        </div>

      </section>

    </div>
  );
}

export default App;