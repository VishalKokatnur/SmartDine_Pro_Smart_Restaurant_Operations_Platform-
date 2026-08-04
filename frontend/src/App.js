
import CustomerMenuPage from "./pages/CustomerMenuPage";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ThemeProvider } from "./context/ThemeContext";
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
import ProtectedRoute from "./routes/ProtectedRoute";
import UnauthorizedPage from "./pages/UnauthorizedPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/order/:tableId" element={<CustomerMenuPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/menu"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tables"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "Waiter"]}>
              <TablesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "Cashier", "Waiter"]}>
              <OrdersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <InventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/purchase"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <PurchasePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <RoomsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employees"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <EmployeesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports/sales"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager", "Cashier"]}>
              <SalesReportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/billing"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier"]}>
              <BillingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bills"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier"]}>
              <BillHistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Chef"]}>
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Cashier", "Waiter"]}>
              <CustomersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reservations"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <ReservationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/low-stock"
          element={
            <ProtectedRoute allowedRoles={["Admin", "Manager"]}>
              <LowStockPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;