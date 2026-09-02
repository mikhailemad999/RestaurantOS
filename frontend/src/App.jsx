import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout';

// Core Operations Pages
import POSPage from './pages/POSPage';
import KDSPage from './pages/KDSPage';
import TablesPage from './pages/TablesPage';
import MenuManagementPage from './pages/MenuManagementPage';
import InventoryPage from './pages/InventoryPage';
import DeliveryDispatchPage from './pages/DeliveryDispatchPage';
import DriverAppPage from './pages/DriverAppPage';
import CRMPage from './pages/CRMPage';
import KioskPage from './pages/KioskPage';
import DashboardPage from './pages/DashboardPage';
import FinancialReportsPage from './pages/FinancialReportsPage';
import ManagerMobilePage from './pages/ManagerMobilePage';
import WaiterPOSPage from './pages/WaiterPOSPage';
import StaffPage from './pages/StaffPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

// Enterprise Intelligence & Platform Pages
import CommandCenterPage from './pages/CommandCenterPage';
import HealthScorePage from './pages/HealthScorePage';
import MenuEngineeringPage from './pages/MenuEngineeringPage';
import SmartPricingPage from './pages/SmartPricingPage';
import InventoryIntelligencePage from './pages/InventoryIntelligencePage';
import SupplierAnalyticsPage from './pages/SupplierAnalyticsPage';
import WasteAnalyticsPage from './pages/WasteAnalyticsPage';
import KitchenAnalyticsPage from './pages/KitchenAnalyticsPage';
import CustomerIntelligencePage from './pages/CustomerIntelligencePage';
import MarketingPage from './pages/MarketingPage';
import QROrderingPage from './pages/QROrderingPage';
import OnlineOrderingPage from './pages/OnlineOrderingPage';
import WaitlistPage from './pages/WaitlistPage';
import StaffPerformancePage from './pages/StaffPerformancePage';
import ApprovalsPage from './pages/ApprovalsPage';
import RiskCenterPage from './pages/RiskCenterPage';
import FeedbackPage from './pages/FeedbackPage';
import DailyBriefPage from './pages/DailyBriefPage';
import OwnerMobilePage from './pages/OwnerMobilePage';
import BranchIntelligencePage from './pages/BranchIntelligencePage';
import ExpenseAnalyticsPage from './pages/ExpenseAnalyticsPage';
import AIManagerPage from './pages/AIManagerPage';
import SystemHealthPage from './pages/SystemHealthPage';
import DeliveryOrderPage from './pages/DeliveryOrderPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import KitchenCommandCenterPage from './pages/KitchenCommandCenterPage';
import StationScreenPage from './pages/StationScreenPage';
import PrinterMonitorPage from './pages/PrinterMonitorPage';
import PrinterRoutingPage from './pages/PrinterRoutingPage';
import TicketTemplateEditorPage from './pages/TicketTemplateEditorPage';
import PrinterSettingsPage from './pages/PrinterSettingsPage';
import MasterBusinessSettingsPage from './pages/MasterBusinessSettingsPage';
import UniversalTablesPage from './pages/UniversalTablesPage';
import KitchenExpoPage from './pages/KitchenExpoPage';
import CateringEventsPage from './pages/CateringEventsPage';
import MultiBrandBIPage from './pages/MultiBrandBIPage';
import MenuPricingEnginePage from './pages/MenuPricingEnginePage';
import ProtectedRoute from './components/ProtectedRoute';
import OwnerWorkspacePage from './pages/OwnerWorkspacePage';
import ManagerWorkspacePage from './pages/ManagerWorkspacePage';
import CashierWorkspacePage from './pages/CashierWorkspacePage';
import CaptainWorkspacePage from './pages/CaptainWorkspacePage';
import ChefWorkspacePage from './pages/ChefWorkspacePage';
import PackingWorkspacePage from './pages/PackingWorkspacePage';
import CallCenterWorkspacePage from './pages/CallCenterWorkspacePage';
import UnifiedRoleLoginPage from './pages/UnifiedRoleLoginPage';
import IncomingCallSimulator from './components/IncomingCallSimulator';
import { useAuth, getRoleHomePath } from './context/AuthContext';

function RootRedirect() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={currentUser.role_home_path || getRoleHomePath(currentUser.role)} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <Layout>
            <Routes>
              {/* Root & Role Workspaces */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/owner" element={<ProtectedRoute allowedRoles={['ADMIN']}><OwnerWorkspacePage /></ProtectedRoute>} />
              <Route path="/manager" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ManagerWorkspacePage /></ProtectedRoute>} />
              <Route path="/cashier" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}><CashierWorkspacePage /></ProtectedRoute>} />
              <Route path="/captain" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><CaptainWorkspacePage /></ProtectedRoute>} />
              <Route path="/chef" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><ChefWorkspacePage /></ProtectedRoute>} />
              <Route path="/packing" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'PACKING']}><PackingWorkspacePage /></ProtectedRoute>} />
              <Route path="/call-center" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CALL_CENTER']}><CallCenterWorkspacePage /></ProtectedRoute>} />
              <Route path="/driver" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DRIVER']}><DriverAppPage /></ProtectedRoute>} />

              {/* Login & Role Access */}
              <Route path="/login" element={<UnifiedRoleLoginPage />} />
              <Route path="/login/:roleKey" element={<UnifiedRoleLoginPage />} />

              {/* Executive & Intelligence Suite */}
              <Route path="/command-center" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CommandCenterPage /></ProtectedRoute>} />
              <Route path="/multi-brand" element={<ProtectedRoute allowedRoles={['ADMIN']}><MultiBrandBIPage /></ProtectedRoute>} />
              <Route path="/executive-bi" element={<ProtectedRoute allowedRoles={['ADMIN']}><MultiBrandBIPage /></ProtectedRoute>} />
              <Route path="/daily-brief" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><DailyBriefPage /></ProtectedRoute>} />
              <Route path="/health" element={<ProtectedRoute allowedRoles={['ADMIN']}><HealthScorePage /></ProtectedRoute>} />
              <Route path="/ai-manager" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><AIManagerPage /></ProtectedRoute>} />
              <Route path="/branch-intelligence" element={<ProtectedRoute allowedRoles={['ADMIN']}><BranchIntelligencePage /></ProtectedRoute>} />

              {/* FOH & Guest Operations */}
              <Route path="/pos" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER']}><POSPage /></ProtectedRoute>} />
              <Route path="/delivery-order" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'CALL_CENTER']}><DeliveryOrderPage /></ProtectedRoute>} />
              <Route path="/tables" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><UniversalTablesPage /></ProtectedRoute>} />
              <Route path="/tables-v2" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><UniversalTablesPage /></ProtectedRoute>} />
              <Route path="/catering" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CateringEventsPage /></ProtectedRoute>} />
              <Route path="/catering-events" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CateringEventsPage /></ProtectedRoute>} />
              <Route path="/waitlist" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><WaitlistPage /></ProtectedRoute>} />
              <Route path="/waiter-pos" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'WAITER']}><WaiterPOSPage /></ProtectedRoute>} />
              <Route path="/kiosk" element={<KioskPage />} />
              <Route path="/qr-ordering" element={<QROrderingPage />} />
              <Route path="/online-ordering" element={<OnlineOrderingPage />} />
              <Route path="/order" element={<OnlineOrderingPage />} />
              <Route path="/customer" element={<OnlineOrderingPage />} />
              <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />

              {/* Kitchen Command Center & Dedicated Stations */}
              <Route path="/kitchen" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><KitchenCommandCenterPage /></ProtectedRoute>} />
              <Route path="/kitchen-command-center" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><KitchenCommandCenterPage /></ProtectedRoute>} />
              <Route path="/kitchen/expo" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF', 'PACKING']}><KitchenExpoPage /></ProtectedRoute>} />
              <Route path="/expo" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF', 'PACKING']}><KitchenExpoPage /></ProtectedRoute>} />
              <Route path="/kitchen/station/:stationCode" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><StationScreenPage /></ProtectedRoute>} />
              <Route path="/station-screens" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><StationScreenPage /></ProtectedRoute>} />

              {/* Smart Printer Fleet & Routing */}
              <Route path="/settings/printers" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterSettingsPage /></ProtectedRoute>} />
              <Route path="/settings/printers/monitor" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterMonitorPage /></ProtectedRoute>} />
              <Route path="/printer-monitor" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterMonitorPage /></ProtectedRoute>} />
              <Route path="/settings/printers/routing" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterRoutingPage /></ProtectedRoute>} />
              <Route path="/printer-routing" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><PrinterRoutingPage /></ProtectedRoute>} />
              <Route path="/settings/printers/template" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><TicketTemplateEditorPage /></ProtectedRoute>} />
              <Route path="/ticket-template" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><TicketTemplateEditorPage /></ProtectedRoute>} />

              {/* BOH, Menu & Supply Intelligence */}
              <Route path="/kds" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><KDSPage /></ProtectedRoute>} />
              <Route path="/menu/pricing-engine" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MenuPricingEnginePage /></ProtectedRoute>} />
              <Route path="/pricing-engine" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MenuPricingEnginePage /></ProtectedRoute>} />
              <Route path="/menu-engineering" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MenuEngineeringPage /></ProtectedRoute>} />
              <Route path="/pricing" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><SmartPricingPage /></ProtectedRoute>} />
              <Route path="/inventory-intelligence" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVENTORY']}><InventoryIntelligencePage /></ProtectedRoute>} />
              <Route path="/suppliers" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVENTORY']}><SupplierAnalyticsPage /></ProtectedRoute>} />
              <Route path="/waste-analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF', 'INVENTORY']}><WasteAnalyticsPage /></ProtectedRoute>} />
              <Route path="/kitchen-analytics" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CHEF']}><KitchenAnalyticsPage /></ProtectedRoute>} />
              <Route path="/menu" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MenuManagementPage /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'INVENTORY']}><InventoryPage /></ProtectedRoute>} />

              {/* Growth, Governance & Logistics */}
              <Route path="/customer-intelligence" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><CustomerIntelligencePage /></ProtectedRoute>} />
              <Route path="/marketing" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><MarketingPage /></ProtectedRoute>} />
              <Route path="/approvals" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ApprovalsPage /></ProtectedRoute>} />
              <Route path="/risk-center" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><RiskCenterPage /></ProtectedRoute>} />
              <Route path="/feedback" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><FeedbackPage /></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ExpenseAnalyticsPage /></ProtectedRoute>} />
              <Route path="/staff-performance" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><StaffPerformancePage /></ProtectedRoute>} />
              <Route path="/dispatch" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'DRIVER', 'PACKING', 'CALL_CENTER']}><DeliveryDispatchPage /></ProtectedRoute>} />
              <Route path="/crm" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'CALL_CENTER']}><CRMPage /></ProtectedRoute>} />
              <Route path="/customers/:id" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'CASHIER', 'CALL_CENTER']}><CustomerProfilePage /></ProtectedRoute>} />

              {/* Analytics & System Management */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><FinancialReportsPage /></ProtectedRoute>} />
              <Route path="/owner-mobile" element={<ProtectedRoute allowedRoles={['ADMIN']}><OwnerMobilePage /></ProtectedRoute>} />
              <Route path="/manager-mobile" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><ManagerMobilePage /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}><StaffPage /></ProtectedRoute>} />
              <Route path="/system-health" element={<ProtectedRoute allowedRoles={['ADMIN']}><SystemHealthPage /></ProtectedRoute>} />
              <Route path="/settings/business" element={<ProtectedRoute allowedRoles={['ADMIN']}><MasterBusinessSettingsPage /></ProtectedRoute>} />
              <Route path="/master-settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><MasterBusinessSettingsPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />

              <Route path="*" element={<RootRedirect />} />
            </Routes>
            <IncomingCallSimulator />
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  </AuthProvider>
  );
}
