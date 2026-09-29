# RestaurantOS

> **Production-Ready Restaurant Management, POS, Kitchen Display, Delivery & Business Intelligence System**

Built with **Django REST Framework** (Python 3.12) + **React 19** + **TypeScript** + **Tailwind CSS v4** + **MySQL 8.4**.

---

## 🌟 Highlights

- **Fast POS & Floor Management**: Minimum-click order taking, split billing, table visual layout.
- **Granular RBAC Engine**: 70+ granular permissions across 12 modules with custom role builder.
- **PIN & Email Auth**: Superfast 4-digit PIN authentication for tablets alongside secure JWT credentials.
- **Kitchen Display System (KDS)**: Real-time order dispatch with bump bar support and color-coded SLA timers.
- **Delivery Dispatching**: In-house driver routing and partner integration webhooks.
- **Inventory & Recipe BOM**: Ingredient deduction on menu item sales, low stock alerts, supplier orders.
- **Bright White Premium UI**: Surgical high-contrast light theme with Plus Jakarta Sans & Inter typography.

---

## 🛠️ Project Structure

```
├── backend/                  # Django REST API Backend
│   ├── config/               # Settings (base/dev/prod), ASGI, WSGI, URLs, Celery
│   ├── apps/
│   │   ├── core/             # BaseModel, RBAC permission engine, pagination, error handler
│   │   ├── accounts/         # User, Role, Permission models, JWT auth & PIN login
│   │   ├── restaurant/       # Restaurant profile, branches, system settings
│   │   ├── menu/             # Categories, Menu Items, Modifiers, Combos (Phase 2)
│   │   ├── tables/           # Floor plans, Tables, QR dining (Phase 3)
│   │   ├── orders/           # POS, Orders, Kitchen Tickets (Phase 4)
│   │   ├── kitchen/          # KDS, Bump stations, Prep timers (Phase 5)
│   │   ├── payments/         # Billing, Shifts, Cash drawers (Phase 6)
│   │   ├── delivery/         # Driver dispatch, map routes (Phase 7)
│   │   ├── inventory/        # Stock, Recipes, BOM, Suppliers (Phase 8)
│   │   ├── customers/        # CRM, Loyalty points, Reservations (Phase 9)
│   │   ├── promotions/       # Coupons, Happy hour discounts (Phase 9)
│   │   ├── reports/          # Business intelligence & sales reports (Phase 10)
│   │   ├── audit/            # Security audit trail & logs (Phase 11)
│   │   └── notifications/    # Push alerts & real-time notices (Phase 11)
│   └── manage.py
│
└── frontend/                 # Vite + React 19 + TypeScript + Tailwind v4
    ├── src/
    │   ├── api/              # RTK Query API slices (auth, users, roles, restaurant)
    │   ├── app/              # Redux store & hooks
    │   ├── components/       # UI Library (Button, Input, Select, Modal, Badge, Card, etc.)
    │   ├── features/         # Feature modules (Dashboard, Users, Roles, Settings, etc.)
    │   ├── layouts/          # AppLayout with collapsible sidebar & role filtering
    │   └── index.css         # Bright White Premium design system
    └── vite.config.ts
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data
python manage.py runserver
```

**Default Credentials:**
- **Email**: `owner@restaurantos.com`
- **Password**: `owner123456`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`
