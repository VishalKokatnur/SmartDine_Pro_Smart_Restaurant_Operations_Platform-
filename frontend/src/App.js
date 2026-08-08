// import TableHeatMapPage from "./pages/TableHeatMapPage";
// import CustomerMenuPage from "./pages/CustomerMenuPage";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// // import { ThemeProvider } from "./context/ThemeContext";
// import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage";
// import MenuPage from "./pages/MenuPage";
// import TablesPage from "./pages/TablesPage";
// import OrdersPage from "./pages/OrdersPage";
// import InventoryPage from "./pages/InventoryPage";
// import RoomsPage from "./pages/RoomsPage";
// import EmployeesPage from "./pages/EmployeesPage";
// import ReportsPage from "./pages/ReportsPage";
// import BillingPage from "./pages/BillingPage";
// import BillHistoryPage from "./pages/BillHistoryPage";
// import KitchenPage from "./pages/KitchenPage";
// import CustomersPage from "./pages/CustomersPage";
// import ReservationPage from "./pages/ReservationPage";
// import PurchasePage from "./pages/PurchasePage";
// import SalesReportPage from "./pages/SalesReportPage";
// import LowStockPage from "./pages/LowStockPage";
// import ProtectedRoute from "./routes/ProtectedRoute";
// import UnauthorizedPage from "./pages/UnauthorizedPage";
// import ScanToOrder from "./pages/ScanToOrder";
// import OrderTableEntry from "./pages/OrderTableEntry";
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/order" element={<CustomerMenuPage />} />
//         <Route path="/order/:tableId" element={<CustomerMenuPage />} />
//         <Route path="/unauthorized" element={<UnauthorizedPage />} />
//         <Route path="/table-heatmap" element={<TableHeatMapPage />} />
//         <Route path="/scan-to-order" element={<ScanToOrder />} />
//         <Route path="/order" element={<OrderTableEntry />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <DashboardPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/menu"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <MenuPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/tables"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager", "Waiter"]}>
//               <TablesPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/orders"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager", "Cashier", "Waiter"]}>
//               <OrdersPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/inventory"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <InventoryPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/purchase"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <PurchasePage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/rooms"
//           element={
//             <ProtectedRoute allowedRoles={["Admin"]}>
//               <RoomsPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/employees"
//           element={
//             <ProtectedRoute allowedRoles={["Admin"]}>
//               <EmployeesPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/reports"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <ReportsPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/reports/sales"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager", "Cashier"]}>
//               <SalesReportPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/billing"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Cashier"]}>
//               <BillingPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/bills"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Cashier"]}>
//               <BillHistoryPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/kitchen"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Chef"]}>
//               <KitchenPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/customers"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Cashier", "Waiter"]}>
//               <CustomersPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/reservations"
//           element={
//             <ProtectedRoute allowedRoles={["Admin"]}>
//               <ReservationPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/inventory/low-stock"
//           element={
//             <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
//               <LowStockPage />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Pages
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import MenuPage from "./pages/MenuPage";
import TablesPage from "./pages/TablesPage";
import OrdersPage from "./pages/OrdersPage";
import InventoryPage from "./pages/InventoryPage";
import RoomsPage from "./pages/RoomsPage";
import EmployeesPage from "./pages/EmployeesPage";
import ReportsPage from "./pages/ReportsPage";
import BillingPage from "./pages/BillingPage";
import BillHistoryPage from "./pages/BillHistoryPage";
import KitchenPage from "./pages/KitchenPage";
import CustomersPage from "./pages/CustomersPage";
import ReservationPage from "./pages/ReservationPage";
import PurchasePage from "./pages/PurchasePage";
import SalesReportPage from "./pages/SalesReportPage";
import LowStockPage from "./pages/LowStockPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import TableHeatMapPage from "./pages/TableHeatMapPage";

// Customer ordering pages
import CustomerMenuPage from "./pages/CustomerMenuPage";
import OrderTableEntry from "./pages/OrderTableEntry";

// QR page
import ScanToOrder from "./pages/ScanToOrder";

// Route protection
import ProtectedRoute from "./routes/ProtectedRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =====================================================
            PUBLIC ROUTES
            ===================================================== */}

        {/* Login */}
        <Route
          path="/"
          element={<LoginPage />}
        />

        {/* =====================================================
            CUSTOMER QR ORDER FLOW
            ===================================================== */}

        {/* 
          Customer scans QR code.
          QR should open:
          http://YOUR-IP:3000/order

          This displays the table number entry page.
        */}
        <Route
          path="/order"
          element={<OrderTableEntry />}
        />

        {/* 
          After customer enters table number:

          /order/12

          This opens the customer menu.
        */}
        <Route
          path="/order/:tableId"
          element={<CustomerMenuPage />}
        />

        {/* =====================================================
            OTHER PUBLIC ROUTES
            ===================================================== */}

        <Route
          path="/unauthorized"
          element={<UnauthorizedPage />}
        />

        {/* =====================================================
            ADMIN / STAFF ROUTES
            ===================================================== */}

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Menu */}
        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />

        {/* Tables */}
        <Route
          path="/tables"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Manager", "Waiter"]}
            >
              <TablesPage />
            </ProtectedRoute>
          }
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "Manager",
                "Cashier",
                "Waiter",
              ]}
            >
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Inventory */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        {/* Low Stock */}
        <Route
          path="/inventory/low-stock"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <LowStockPage />
            </ProtectedRoute>
          }
        />

        {/* Purchase */}
        <Route
          path="/purchase"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <PurchasePage />
            </ProtectedRoute>
          }
        />

        {/* Rooms */}
        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        {/* Employees */}
        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Sales Reports */}
        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Manager", "Cashier"]}
            >
              <SalesReportPage />
            </ProtectedRoute>
          }
        />

        {/* Billing */}
        <Route
          path="/billing"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Cashier"]}
            >
              <BillingPage />
            </ProtectedRoute>
          }
        />

        {/* Bill History */}
        <Route
          path="/bills"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Cashier"]}
            >
              <BillHistoryPage />
            </ProtectedRoute>
          }
        />

        {/* Kitchen */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Chef"]}
            >
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* Customers */}
        <Route
          path="/customers"
          element={
            <ProtectedRoute
              allowedRoles={[
                "Admin",
                "Cashier",
                "Waiter",
              ]}
            >
              <CustomersPage />
            </ProtectedRoute>
          }
        />

        {/* Reservations */}
        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ReservationPage />
            </ProtectedRoute>
          }
        />

        {/* Table Heatmap */}
        <Route
          path="/table-heatmap"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Manager"]}
            >
              <TableHeatMapPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            SCAN TO ORDER PAGE
            ===================================================== */}

        <Route
          path="/scan-to-order"
          element={
            <ProtectedRoute
              allowedRoles={["Admin", "Manager"]}
            >
              <ScanToOrder />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
            FALLBACK
            ===================================================== */}

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;