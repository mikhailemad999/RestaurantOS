import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from '@/app/store'
import LoginPage from '@/features/auth/LoginPage'
import AppLayout from '@/layouts/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { UsersPage } from '@/features/users/UsersPage'
import { RolesPage } from '@/features/roles/RolesPage'
import { RestaurantSettingsPage } from '@/features/settings/RestaurantSettingsPage'
import { BranchesPage } from '@/features/settings/BranchesPage'
import { MenuPage } from '@/features/menu/MenuPage'
import { PosTerminalPage } from '@/features/pos/PosTerminalPage'
import { TablesFloorPage } from '@/features/tables/TablesFloorPage'
import { KitchenKdsPage } from '@/features/kitchen/KitchenKdsPage'
import { InventoryPage } from '@/features/inventory/InventoryPage'
import { DeliveryDispatchPage } from '@/features/delivery/DeliveryDispatchPage'
import { CustomersCrmPage } from '@/features/customers/CustomersCrmPage'
import { PaymentsPage } from '@/features/payments/PaymentsPage'
import { PromotionsPage } from '@/features/promotions/PromotionsPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { AuditLogsPage } from '@/features/audit/AuditLogsPage'

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Screen 3: Manager BI Dashboard */}
              <Route index element={<DashboardPage />} />

              {/* Screen 1: Fast POS Interface */}
              <Route path="pos" element={<PosTerminalPage />} />
              <Route path="orders" element={<PosTerminalPage />} />

              {/* Screen 4: Table Management & Floor Plan */}
              <Route path="tables" element={<TablesFloorPage />} />

              {/* Screen 5: Kitchen Display System (KDS) */}
              <Route path="kitchen" element={<KitchenKdsPage />} />

              {/* Screen 6: Menu Management & Recipes */}
              <Route path="menu" element={<MenuPage />} />

              {/* Screen 7: Inventory & Stock Control */}
              <Route path="inventory" element={<InventoryPage />} />

              {/* Screen 8: Delivery Dispatch Board */}
              <Route path="delivery" element={<DeliveryDispatchPage />} />

              {/* Screen 10: Customer & Loyalty CRM */}
              <Route path="customers" element={<CustomersCrmPage />} />

              {/* Screen 9: Staff & Role Management */}
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />

              {/* Store & Branch Configuration */}
              <Route path="settings/restaurant" element={<RestaurantSettingsPage />} />
              <Route path="settings/branches" element={<BranchesPage />} />

              {/* Phase 6: Payments & Ledger */}
              <Route path="payments" element={<PaymentsPage />} />

              {/* Phase 9: Promotions & Coupon Engine */}
              <Route path="promotions" element={<PromotionsPage />} />

              {/* Phase 10: BI Analytics & Reports */}
              <Route path="reports" element={<ReportsPage />} />

              {/* Phase 11: Security Audit Trail */}
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
