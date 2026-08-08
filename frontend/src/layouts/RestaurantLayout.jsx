import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  NavLink,
} from "react-router-dom";

import "./RestaurantLayout.css";

import {
  useTheme,
} from "../context/ThemeContext";


function RestaurantLayout({ children }) {
  const role = localStorage.getItem("role");

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const menuRef = useRef(null);


  const menus = {
    Admin: [
      ["🏠 Dashboard", "/dashboard"],
      ["📋 Orders", "/orders"],
      ["🍽 Menu", "/menu"],
      ["🪑 Tables", "/tables"],
      ["💳 Billing", "/billing"],
      ["🧾 Bills", "/bills"],
      ["📦 Inventory", "/inventory"],
      ["🛒 Purchase", "/purchase"],
      ["👨‍🍳 Employees", "/employees"],
      ["👥 Customers", "/customers"],
      ["🍳 Kitchen", "/kitchen"],
      ["📈 Sales Report", "/reports/sales"],
      ["📅 Reservations", "/reservations"],
      ["⚠️ Low Stock", "/inventory/low-stock"],
      ["📷 Scan", "/scan-to-order"],
    ],

    Manager: [
      ["🏠 Dashboard", "/dashboard"],
      ["📋 Orders", "/orders"],
      ["🍽 Menu", "/menu"],
      ["🪑 Tables", "/tables"],
      ["📦 Inventory", "/inventory"],
      ["🛒 Purchase", "/purchase"],
      ["📈 Sales Report", "/reports/sales"],
      ["⚠️ Low Stock", "/inventory/low-stock"],
      ["📷 Scan", "/scan-to-order"],
    ],

    Cashier: [
      ["🏠 Dashboard", "/dashboard"],
      ["📋 Orders", "/orders"],
      ["💳 Billing", "/billing"],
      ["🧾 Bills", "/bills"],
      ["👥 Customers", "/customers"],
      ["📈 Sales Report", "/reports/sales"],
      ["📷 Scan", "/scan-to-order"],
    ],

    Waiter: [
      ["🏠 Dashboard", "/dashboard"],
      ["📋 Orders", "/orders"],
      ["🪑 Tables", "/tables"],
      ["👥 Customers", "/customers"],
      ["📷 Scan", "/scan-to-order"],
    ],

    Chef: [
      ["🏠 Dashboard", "/dashboard"],
      ["🍳 Kitchen", "/kitchen"],
      ["📷 Scan", "/scan-to-order"],
    ],
  };


  const allowedMenus =
    menus[role] || [];


  useEffect(() => {
    const closeMenu = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(false);
      }
    };


    document.addEventListener(
      "mousedown",
      closeMenu
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        closeMenu
      );
    };
  }, []);


  const logout = () => {
    localStorage.clear();

    window.location.href = "/";
  };


  return (
    <div className="restaurant-dashboard">

      <nav className="restaurant-navbar">

        {/* LOGO */}

        <div className="restaurant-logo">

          <h1>
            SmartDine Pro
          </h1>

          <p>
            Premium Restaurant Management
          </p>

          <span className="role-badge">
            Role: {role}
          </span>

        </div>


        {/* RIGHT SIDE */}

        <div className="sdp-navbar-right">

          {/* THEME BUTTON */}

          <button
            type="button"
            className={`sdp-theme-switch ${theme === "light" ? "sdp-theme-light" : ""}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className="sdp-theme-track">
              <span className="sdp-theme-icon sdp-theme-icon-moon">🌙</span>
              <span className="sdp-theme-icon sdp-theme-icon-sun">☀️</span>
              <span className="sdp-theme-knob" />
            </span>
          </button>


          {/* ALL APPS */}

          <div
            className="sdp-appsmenu"
            ref={menuRef}
          >

            <button
              type="button"
              className={`sdp-appsmenu-btn ${
                menuOpen
                  ? "sdp-open"
                  : ""
              }`}
              onClick={() =>
                setMenuOpen(
                  !menuOpen
                )
              }
            >
              <span className="sdp-appsmenu-dots">
                ⋯
              </span>

              <span className="sdp-appsmenu-label">
                All Apps
              </span>
            </button>


            {menuOpen && (

              <div className="sdp-appsmenu-dropdown">

                <div className="sdp-appsmenu-dropdown-header">
                  <span>
                    Quick Access
                  </span>
                </div>


                <div className="sdp-appsmenu-grid">

                  {allowedMenus.map(
                    (
                      menu,
                      index
                    ) => {

                      const [
                        emojiLabel,
                        path,
                      ] = menu;


                      const [
                        emoji,
                        ...rest
                      ] =
                        emojiLabel.split(
                          " "
                        );


                      const label =
                        rest.join(
                          " "
                        );


                      return (

                        <NavLink
                          key={index}
                          to={path}
                          className={({
                            isActive,
                          }) =>
                            isActive
                              ? "sdp-appsmenu-item sdp-appsmenu-item-active"
                              : "sdp-appsmenu-item"
                          }
                          onClick={() =>
                            setMenuOpen(
                              false
                            )
                          }
                        >

                          <span className="sdp-appsmenu-item-icon">
                            {emoji}
                          </span>

                          <span className="sdp-appsmenu-item-label">
                            {label}
                          </span>

                        </NavLink>

                      );
                    }
                  )}

                </div>


                <div className="sdp-appsmenu-divider"></div>


                <button
                  type="button"
                  className="sdp-appsmenu-logout"
                  onClick={logout}
                >
                  🚪 Logout
                </button>

              </div>

            )}

          </div>

        </div>

      </nav>


      {children}

    </div>
  );
}


export default RestaurantLayout;