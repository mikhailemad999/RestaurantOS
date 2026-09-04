const API_BASE = 'http://127.0.0.1:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Request failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Auth & Staff
  pinLogin: (pin_code) => request('/staff/pin-login/', { method: 'POST', body: JSON.stringify({ pin_code }) }),
  getStaff: () => request('/staff/'),
  createStaff: (data) => request('/staff/', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id, data) => request(`/staff/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  updateStaffLanguage: (staff_id, language) => request('/staff/update-language/', { method: 'POST', body: JSON.stringify({ staff_id, language }) }),

  // Menu & Categories
  getCategories: () => request('/categories/'),
  getMenuItems: () => request('/menu/'),
  getMenu: () => request('/menu/'),
  createMenuItem: (data) => request('/menu/', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data) => request(`/menu/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id) => request(`/menu/${id}/`, { method: 'DELETE' }),
  toggleItemAvailability: (id) => request(`/menu/${id}/toggle-availability/`, { method: 'POST' }),
  getModifiers: () => request('/modifiers/'),

  // Tables & Floor
  getSections: () => request('/sections/'),
  getTables: () => request('/tables/'),
  createTable: (data) => request('/tables/', { method: 'POST', body: JSON.stringify(data) }),
  updateTable: (id, data) => request(`/tables/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTable: (id) => request(`/tables/${id}/`, { method: 'DELETE' }),
  updateTableStatus: (id, status) => request(`/tables/${id}/update-status/`, { method: 'POST', body: JSON.stringify({ status }) }),
  clearTable: (id) => request(`/tables/${id}/clear/`, { method: 'POST' }),

  // Orders & POS
  getOrders: () => request('/orders/'),
  getOrderById: (id) => request(`/orders/${id}/`),
  createPosOrder: (data) => request('/orders/create-pos-order/', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/update-status/`, { method: 'POST', body: JSON.stringify({ status }) }),
  processPayment: (id, paymentData) => request(`/orders/${id}/process-payment/`, { method: 'POST', body: JSON.stringify(paymentData) }),

  // KDS
  getKDSTickets: (station = 'ALL') => request(`/kds/?station=${station}`),
  bumpKDSItem: (item_id) => request('/kds/bump-item/', { method: 'POST', body: JSON.stringify({ item_id }) }),
  bumpKDSTicket: (order_id) => request('/kds/bump-ticket/', { method: 'POST', body: JSON.stringify({ order_id }) }),
  recallKDSTicket: (order_id) => request('/kds/recall-ticket/', { method: 'POST', body: JSON.stringify({ order_id }) }),

  // Inventory
  getInventory: () => request('/inventory/'),
  adjustStock: (id, quantity_delta, reason) => request(`/inventory/${id}/adjust-stock/`, { method: 'POST', body: JSON.stringify({ quantity_delta, reason }) }),
  logWaste: (item_id, quantity, reason) => request('/inventory/log-waste/', { method: 'POST', body: JSON.stringify({ item_id, quantity, reason }) }),

  // Delivery & Dispatch
  getDeliveryOrders: () => request('/delivery/'),
  getDrivers: () => request('/delivery/drivers/'),
  assignDriver: (id, driver_id) => request(`/delivery/${id}/assign-driver/`, { method: 'POST', body: JSON.stringify({ driver_id }) }),
  updateDeliveryStatus: (id, delivery_status) => request(`/delivery/${id}/update-status/`, { method: 'POST', body: JSON.stringify({ delivery_status }) }),
  markDeliveryPickedUp: (id) => request(`/delivery/${id}/mark-picked-up/`, { method: 'POST' }),
  markDeliveryDelivered: (id, collected_amount) => request(`/delivery/${id}/mark-delivered/`, { method: 'POST', body: JSON.stringify({ collected_amount }) }),
  markDeliveryFailed: (id, reason) => request(`/delivery/${id}/mark-failed/`, { method: 'POST', body: JSON.stringify({ reason }) }),
  getDeliveryZones: () => request('/delivery-zones/'),
  createDeliveryZone: (data) => request('/delivery-zones/', { method: 'POST', body: JSON.stringify(data) }),

  // Delivery Customer CRM & Addresses
  getCustomers: (q = '') => request(q ? `/customers/search/?q=${encodeURIComponent(q)}` : '/customers/'),
  getCustomerById: (id) => request(`/customers/${id}/`),
  createCustomer: (data) => request('/customers/', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  checkDuplicateCustomer: (phone, name = '', exclude_id = null) => request('/customers/check-duplicate/', { method: 'POST', body: JSON.stringify({ phone, name, exclude_id }) }),
  getCustomerLastOrder: (id) => request(`/customers/${id}/last-order/`),
  getCustomerFavorites: (id) => request(`/customers/${id}/favorites/`),
  getCustomerProfileStats: (id) => request(`/customers/${id}/profile-stats/`),

  // Customer Addresses
  getCustomerAddresses: (customerId) => request(`/customer-addresses/?customer=${customerId}`),
  createCustomerAddress: (data) => request('/customer-addresses/', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomerAddress: (id, data) => request(`/customer-addresses/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCustomerAddress: (id) => request(`/customer-addresses/${id}/`, { method: 'DELETE' }),
  setDefaultAddress: (id) => request(`/customer-addresses/${id}/set-default/`, { method: 'POST' }),

  // Customer Notes
  getCustomerNotes: (customerId) => request(`/customer-notes/?customer=${customerId}`),
  createCustomerNote: (data) => request('/customer-notes/', { method: 'POST', body: JSON.stringify(data) }),

  // Basic Reports & Shifts
  getBIMetrics: () => request('/reports/bi-summary/'),
  getFinancialAnalytics: () => request('/reports/financial-analytics/'),
  getShifts: () => request('/shifts/'),
  getSettings: () => request('/settings/'),

  // ============================================================
  // ENTERPRISE INTELLIGENCE & ANALYTICS APIs
  // ============================================================
  getHealthScore: () => request('/reports/health-score/'),
  getMenuEngineering: () => request('/reports/menu-engineering/'),
  getInventoryForecasting: () => request('/reports/inventory-forecasting/'),
  getCommandCenter: () => request('/reports/command-center/'),
  getDailyBrief: () => request('/reports/daily-brief/'),
  queryAIAssistant: (query) => request('/reports/ai-manager-query/', { method: 'POST', body: JSON.stringify({ query }) }),

  // Multi-Branch
  getBranches: () => request('/branches/'),
  createBranch: (data) => request('/branches/', { method: 'POST', body: JSON.stringify(data) }),

  // Pricing Intelligence & Approvals
  getPriceRequests: () => request('/pricing-requests/'),
  createPriceRequest: (data) => request('/pricing-requests/', { method: 'POST', body: JSON.stringify(data) }),
  approvePriceRequest: (id) => request(`/pricing-requests/${id}/approve/`, { method: 'POST' }),
  rejectPriceRequest: (id) => request(`/pricing-requests/${id}/reject/`, { method: 'POST' }),

  // Suppliers & Purchasing
  getSuppliers: () => request('/suppliers/'),
  createSupplier: (data) => request('/suppliers/', { method: 'POST', body: JSON.stringify(data) }),
  getPurchaseOrders: () => request('/purchase-orders/'),
  createPurchaseOrder: (data) => request('/purchase-orders/', { method: 'POST', body: JSON.stringify(data) }),
  approvePurchaseOrder: (id) => request(`/purchase-orders/${id}/approve/`, { method: 'POST' }),

  // Marketing Campaigns
  getCampaigns: () => request('/campaigns/'),
  createCampaign: (data) => request('/campaigns/', { method: 'POST', body: JSON.stringify(data) }),
  launchCampaign: (id) => request(`/campaigns/${id}/launch/`, { method: 'POST' }),

  // QR Ordering & Sessions
  getQRSessions: () => request('/qr-sessions/'),
  callWaiterQR: (table_id) => request('/qr-sessions/call-waiter/', { method: 'POST', body: JSON.stringify({ table_id }) }),
  requestBillQR: (table_id) => request('/qr-sessions/request-bill/', { method: 'POST', body: JSON.stringify({ table_id }) }),

  // Waitlist & Reservations
  getWaitlist: () => request('/waitlist/'),
  createWaitlistEntry: (data) => request('/waitlist/', { method: 'POST', body: JSON.stringify(data) }),
  seatWaitlistEntry: (id) => request(`/waitlist/${id}/seat/`, { method: 'POST' }),
  getReservations: () => request('/reservations/'),
  createReservation: (data) => request('/reservations/', { method: 'POST', body: JSON.stringify(data) }),

  // Staff Attendance
  getAttendance: () => request('/attendance/'),
  clockInStaff: (staff_id) => request('/attendance/clock-in/', { method: 'POST', body: JSON.stringify({ staff_id }) }),
  clockOutStaff: (id) => request(`/attendance/${id}/clock-out/`, { method: 'POST' }),

  // Approvals & Governance
  getApprovals: () => request('/approvals/'),
  createApproval: (data) => request('/approvals/', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: (id) => request(`/approvals/${id}/approve/`, { method: 'POST' }),
  rejectRequest: (id) => request(`/approvals/${id}/reject/`, { method: 'POST' }),

  // Risk & Fraud Center
  getRiskAlerts: () => request('/risk-alerts/'),
  resolveRiskAlert: (id) => request(`/risk-alerts/${id}/resolve/`, { method: 'POST' }),

  // Customer Feedback
  getFeedback: () => request('/feedback/'),
  createFeedback: (data) => request('/feedback/', { method: 'POST', body: JSON.stringify(data) }),
  resolveFeedback: (id) => request(`/feedback/${id}/resolve/`, { method: 'POST' }),

  // Targets & Expenses
  getTargets: () => request('/targets/'),
  getExpenses: () => request('/expenses/'),
  createExpense: (data) => request('/expenses/', { method: 'POST', body: JSON.stringify(data) }),

  // AI Management Recommendations
  getRecommendations: () => request('/recommendations/'),
  acceptRecommendation: (id) => request(`/recommendations/${id}/accept/`, { method: 'POST' }),
  dismissRecommendation: (id) => request(`/recommendations/${id}/dismiss/`, { method: 'POST' }),

  // Kitchen Stations & Station Screens
  getKitchenStations: () => request('/kitchen-stations/'),
  getStationTickets: (stationCode = 'ALL') => request(`/kitchen-stations/tickets/?station=${stationCode}`),

  // Printers & Hardware Management
  getPrinters: () => request('/printers/'),
  createPrinter: (data) => request('/printers/', { method: 'POST', body: JSON.stringify(data) }),
  updatePrinter: (id, data) => request(`/printers/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrinter: (id) => request(`/printers/${id}/`, { method: 'DELETE' }),
  togglePrinterStatus: (id, status) => request(`/printers/${id}/toggle-status/`, { method: 'POST', body: JSON.stringify({ status }) }),
  testPrintPrinter: (id) => request(`/printers/${id}/test-print/`, { method: 'POST' }),
  getPrinterFleetSummary: () => request('/printers/fleet-summary/'),

  // Smart Printer Routing Rules
  getPrinterRoutingRules: () => request('/printer-routing-rules/'),
  createPrinterRoutingRule: (data) => request('/printer-routing-rules/', { method: 'POST', body: JSON.stringify(data) }),
  updatePrinterRoutingRule: (id, data) => request(`/printer-routing-rules/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrinterRoutingRule: (id) => request(`/printer-routing-rules/${id}/`, { method: 'DELETE' }),
  simulatePrinterRoute: (data) => request('/printer-routing-rules/simulate/', { method: 'POST', body: JSON.stringify(data) }),

  // Print Queue & Jobs
  getPrintJobs: (params = '') => request(`/print-jobs/${params ? `?${params}` : ''}`),
  retryPrintJob: (id) => request(`/print-jobs/${id}/retry/`, { method: 'POST' }),
  reroutePrintJob: (id, targetPrinterId) => request(`/print-jobs/${id}/reroute/`, { method: 'POST', body: JSON.stringify({ target_printer_id: targetPrinterId }) }),

  // Universal Restaurant Operating System (UROS)
  getBusinessConfig: () => request('/business-config/current/'),
  updateFeatureFlags: (flags) => request('/business-config/update-flags/', { method: 'POST', body: JSON.stringify({ feature_flags: flags }) }),
  setBusinessMode: (mode) => request('/business-config/set-mode/', { method: 'POST', body: JSON.stringify({ business_mode: mode }) }),
  getBrands: () => request('/brands/'),
  getPortfolioSummary: () => request('/brands/portfolio-summary/'),
  updateTableCoursing: (id, coursing) => request(`/tables/${id}/update-coursing/`, { method: 'POST', body: JSON.stringify({ coursing_status: coursing }) }),
  updateTableSeats: (id, seats, guestCount) => request(`/tables/${id}/update-seats/`, { method: 'POST', body: JSON.stringify({ seats_data: seats, guest_count: guestCount }) }),
  tableAction: (id, action, targetTableId) => request(`/tables/${id}/table-action/`, { method: 'POST', body: JSON.stringify({ action, target_table_id: targetTableId }) }),
  getCateringEvents: () => request('/catering-events/'),
  createCateringEvent: (data) => request('/catering-events/', { method: 'POST', body: JSON.stringify(data) }),
  collectCateringDeposit: (id, amount) => request(`/catering-events/${id}/collect-deposit/`, { method: 'POST', body: JSON.stringify({ amount }) }),
  getCateringCalendarStats: () => request('/catering-events/calendar-stats/'),
  getMenuPricingMatrix: () => request('/menu-pricing-rules/matrix/'),
  getMenuPricingRules: () => request('/menu-pricing-rules/'),
  createMenuPricingRule: (data) => request('/menu-pricing-rules/', { method: 'POST', body: JSON.stringify(data) }),
  getKitchenExpoOrders: () => request('/kitchen-expo/'),
  bumpExpoOrder: (orderId) => request('/kitchen-expo/bump-order/', { method: 'POST', body: JSON.stringify({ order_id: orderId }) }),
  // Staff & RBAC
  getRoleAccounts: () => request('/staff/role-accounts/'),
  getSystemHealthObservability: () => request('/system-health-observability/'),
};
