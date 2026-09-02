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
import IncomingCallSimulator from './components/IncomingCallSimulator';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ToastProvider>
          <BrowserRouter>
            <Layout>
            <Routes>
              {/* Executive & Intelligence Suite */}
              <Route path="/" element={<CommandCenterPage />} />
              <Route path="/command-center" element={<CommandCenterPage />} />
              <Route path="/daily-brief" element={<DailyBriefPage />} />
              <Route path="/health" element={<HealthScorePage />} />
              <Route path="/ai-manager" element={<AIManagerPage />} />
              <Route path="/branch-intelligence" element={<BranchIntelligencePage />} />

              {/* FOH & Guest Operations */}
              <Route path="/pos" element={<POSPage />} />
              <Route path="/delivery-order" element={<DeliveryOrderPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/waitlist" element={<WaitlistPage />} />
              <Route path="/waiter-pos" element={<WaiterPOSPage />} />
              <Route path="/kiosk" element={<KioskPage />} />
              <Route path="/qr-ordering" element={<QROrderingPage />} />
              <Route path="/online-ordering" element={<OnlineOrderingPage />} />
              <Route path="/order" element={<OnlineOrderingPage />} />
              <Route path="/customer" element={<OnlineOrderingPage />} />
              <Route path="/order-tracking/:id" element={<OrderTrackingPage />} />

              {/* Kitchen Command Center & Dedicated Stations */}
              <Route path="/kitchen" element={<KitchenCommandCenterPage />} />
              <Route path="/kitchen-command-center" element={<KitchenCommandCenterPage />} />
              <Route path="/kitchen/station/:stationCode" element={<StationScreenPage />} />
              <Route path="/station-screens" element={<StationScreenPage />} />

              {/* Smart Printer Fleet & Routing */}
              <Route path="/settings/printers" element={<PrinterSettingsPage />} />
              <Route path="/settings/printers/monitor" element={<PrinterMonitorPage />} />
              <Route path="/printer-monitor" element={<PrinterMonitorPage />} />
              <Route path="/settings/printers/routing" element={<PrinterRoutingPage />} />
              <Route path="/printer-routing" element={<PrinterRoutingPage />} />
              <Route path="/settings/printers/template" element={<TicketTemplateEditorPage />} />
              <Route path="/ticket-template" element={<TicketTemplateEditorPage />} />

              {/* BOH, Menu & Supply Intelligence */}
              <Route path="/kds" element={<KDSPage />} />
              <Route path="/menu-engineering" element={<MenuEngineeringPage />} />
              <Route path="/pricing" element={<SmartPricingPage />} />
              <Route path="/inventory-intelligence" element={<InventoryIntelligencePage />} />
              <Route path="/suppliers" element={<SupplierAnalyticsPage />} />
              <Route path="/waste-analytics" element={<WasteAnalyticsPage />} />
              <Route path="/kitchen-analytics" element={<KitchenAnalyticsPage />} />
              <Route path="/menu" element={<MenuManagementPage />} />
              <Route path="/inventory" element={<InventoryPage />} />

              {/* Growth, Governance & Logistics */}
              <Route path="/customer-intelligence" element={<CustomerIntelligencePage />} />
              <Route path="/marketing" element={<MarketingPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/risk-center" element={<RiskCenterPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/expenses" element={<ExpenseAnalyticsPage />} />
              <Route path="/staff-performance" element={<StaffPerformancePage />} />
              <Route path="/dispatch" element={<DeliveryDispatchPage />} />
              <Route path="/driver" element={<DriverAppPage />} />
              <Route path="/crm" element={<CRMPage />} />
              <Route path="/customers/:id" element={<CustomerProfilePage />} />

              {/* Analytics & System Management */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/reports" element={<FinancialReportsPage />} />
              <Route path="/owner-mobile" element={<OwnerMobilePage />} />
              <Route path="/manager-mobile" element={<ManagerMobilePage />} />
              <Route path="/staff" element={<StaffPage />} />
              <Route path="/system-health" element={<SystemHealthPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="*" element={<Navigate to="/command-center" replace />} />
            </Routes>
            <IncomingCallSimulator />
          </Layout>
        </BrowserRouter>
      </ToastProvider>
    </LanguageProvider>
  </AuthProvider>
  );
}
