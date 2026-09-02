# RestaurantOS Universal Master Architecture

## 1. Architecture Overview
RestaurantOS is transitioning from a modular POS into a **Universal Restaurant Operating System (UROS)**. The architecture is built on a **Multitenant, Multi-brand, and Multi-branch** foundation. 

### Core Pillars:
- **Configurability:** Workflows (Dine-in vs. Delivery) and UI are controlled by Business Modes and Feature Flags.
- **Scalability:** Relational database designed for high-concurrency transactional integrity.
- **Asynchronicity:** Non-blocking operations for physical hardware (printers) and complex computations (forecasting).
- **Localization:** Native RTL/LTR support with per-user language preferences.

## 2. Multi-Branch & Multi-Brand Model
- **Business (Tenant):** The top-level entity (e.g., "Culinary Group").
- **Brand:** Distinct identities under one business (e.g., "Noir Pizza", "Noir Burger").
- **Branch:** Physical or virtual locations (e.g., "Downtown Branch", "Westside Cloud Kitchen").

## 3. Workflow Engine
The system uses a **State Machine** for orders, shifting from `DRAFT` to `COMPLETED` based on channel-specific rules. 
- **Fast Food:** Direct skip to `PREPARING`.
- **Fine Dining:** Includes `HELD` and `FIRED` course states.

## 4. Key Implementation Modules
1. **Master Settings:** Centralized `/settings/business` for all global configurations.
2. **Feature Flags:** Granular control over modules like `enable_ai` or `enable_reservations`.
3. **Universal Table Management:** Supporting sections, zones, and guest-seat ordering.
4. **Intelligent Kitchen Hub:** Unlimited stations and failover printer routing.
5. **AI Recommendation Engine:** Insights into pricing, inventory, and staffing.

---

## 5. Implementation Phases
- **Phase 1: Universal Settings & Business Modes** (Current)
- **Phase 2: Multi-Branch & Multi-Brand Console**
- **Phase 3: Advanced Menu & Modifier Engine 2.0**
- **Phase 4: Global Command Center & AI Manager**
- **Phase 5: Self-Service (Kiosk/QR) Expansion**
