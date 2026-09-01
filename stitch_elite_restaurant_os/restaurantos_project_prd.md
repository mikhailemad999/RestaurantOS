# Project Brief: RestaurantOS
**A Full-Suite Restaurant Management & POS Platform**

---

## 1. Executive Summary
RestaurantOS is a production-grade, end-to-end management platform designed for modern food businesses. It bridges the gap between Front-of-House (FOH), Back-of-House (BOH), and administrative workflows through a unified, high-performance dark-themed interface. The system prioritizes speed, role-based security, and real-time data synchronization.

---

## 2. Project Vision & Goals
- **Operational Efficiency:** Minimize clicks for high-frequency staff (Cashiers, Waiters).
- **Data-Driven Management:** Provide actionable Business Intelligence for owners and managers.
- **Role-Based Precision:** Ensure staff only access tools relevant to their specific duties (RBAC).
- **Premium Brand Identity:** Maintain a "Culinary Precision" aesthetic—modern, high-contrast, and professional.

---

## 3. Core Modules & Functionality

### A. Front-of-House (FOH)
- **POS Terminal:** High-speed order entry with a three-column layout (Categories, Menu Grid, Active Cart).
- **Table Management:** Interactive floor plan with real-time status indicators (Available, Occupied, Reserved, Bill Requested).
- **Guest CRM & Loyalty:** Detailed customer profiles, spending analytics, and tiered loyalty point tracking.

### B. Back-of-House (BOH)
- **Kitchen Display System (KDS):** Real-time production queue with station filtering, preparation timers, and prioritized modifiers.
- **Inventory & Stock Control:** Tracking of raw ingredients, waste management, and theoretical vs. actual consumption analysis.
- **Menu Management:** Centralized editor for categories, items, variants, and recipe costing.

### C. Logistics & Administration
- **Delivery Dispatch Board:** Logistics hub featuring driver status tracking, order aging, and map-based dispatching.
- **Manager BI Dashboard:** Executive overview of Sales KPIs, revenue trends, occupancy rates, and low-stock alerts.
- **Staff & Role Management:** Directory management with a granular permission matrix for system-wide access control.

---

## 4. Design Principles (Culinary Precision)
- **Visual Identity:** `DARK` mode theme using deep blacks (#131313) and "Chef's Gold" (#d4af37) accents.
- **Typography:** Clean, high-legibility sans-serif (Inter) across all information-dense screens.
- **Component Strategy:** Shared navigation (TopNavBar, SideNavBar) and consistent card-based UI patterns to reduce cognitive load during multi-role transitions.

---

## 5. Technical Specification (Recommended)
- **Frontend:** React + TypeScript with Tailwind CSS and Shadcn/UI for consistent componentry.
- **State Management:** Redux Toolkit / RTK Query for real-time server-state synchronization.
- **Real-Time:** WebSocket (Socket.io) for instant kitchen-to-captain and order-to-dispatch updates.
- **Security:** JWT-based authentication with PIN-entry support for POS terminals.
- **Database:** PostgreSQL for relational integrity (Orders, Inventory, Users).

---

## 6. Implementation Status
The project currently has all core operational interfaces designed and mapped to the "Culinary Precision" design system. The system is ready for full-stack engineering handoff based on the established UI/UX patterns.