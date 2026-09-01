---
name: Culinary Precision
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffbec1'
  on-tertiary: '#67001b'
  tertiary-container: '#ff949c'
  on-tertiary-container: '#8e0029'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  data-pos:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for the high-stakes environment of premium restaurant management. It prioritizes speed of thought and action, evoking a sense of calm control amidst the chaos of a busy kitchen or floor. 

The aesthetic is **High-Contrast Modern**, utilizing a "Void" base (absolute blacks) to make functional data and primary actions pop with surgical precision. The interface draws inspiration from professional kitchen equipment: durable, high-performance, and elegant in its utility. It avoids unnecessary decoration, focusing instead on high-density information architecture that remains legible under the harsh or low-light conditions of hospitality environments.

## Colors
This design system utilizes a tiered dark-mode palette to establish depth and hierarchy without relying on heavy shadows.

- **Primary (Chef's Gold):** Reserved for high-value branding, premium features, and primary calls to action.
- **Secondary (Action Emerald):** Used for "Go" states—confirmations, completed orders, and active statuses.
- **Surface Tiers:** 
    - `Level 0 (#000000)`: Background for POS grids and high-density tables.
    - `Level 1 (#0A0A0A)`: Sidebars and global navigation.
    - `Level 2 (#1A1A1A)`: Card surfaces and modal backgrounds.
- **Functional Accents:** Vibrant Red (#F43F5E) for "Overdue" or "Low Stock" alerts to ensure immediate visual triage.

## Typography
The system uses **Inter** for all UI elements to ensure maximum legibility and a neutral, professional tone. A secondary font, **JetBrains Mono**, is introduced for data-heavy contexts like ticket numbers, timestamps, and inventory counts to provide a technical, "receipt-like" precision.

- **Strict Hierarchy:** Headlines use tighter tracking and heavier weights to anchor sections.
- **Monospaced Data:** All numeric values in POS views and dashboards must use the `label-caps` or `data-pos` roles to prevent layout shifts during real-time updates.
- **Line Heights:** Body text maintains a comfortable 1.5 ratio, while POS labels use a tighter 1.0–1.2 ratio to maximize vertical density.

## Layout & Spacing
This system employs a **4px base grid** designed for high-density information display. 

- **Grid System:** A 12-column fluid grid for dashboards, transitioning to a fixed-aspect ratio grid (4 or 6 columns) for POS touchscreens.
- **Density:** Spacing is "tight but purposeful." In POS views, margins are minimized (8px–12px) to keep more actionable items within the primary thumb-zone.
- **Touch Targets:** Despite high density, all interactive elements must maintain a minimum hit area of 44x44px for high-speed operation.
- **Breakpoints:**
    - Mobile (<600px): Single column, bottom-anchored actions.
    - Tablet (600px - 1024px): Multi-column POS grids.
    - Desktop (>1024px): Management dashboards with persistent sidebars.

## Elevation & Depth
In a black-background environment, traditional shadows are replaced with **Tonal Layering** and **Luminous Outlines**.

- **Stacked Surfaces:** Depth is communicated by increasing the lightness of the grey hex code as the element moves "closer" to the user.
- **Subtle Outlines:** Instead of shadows, use 1px solid borders (color: `#262626`) to define card boundaries against the `#000000` background.
- **Glassmorphism:** Use sparingly for floating overlays (like "New Order" notifications). Apply a 20px backdrop blur with a 10% white tint to maintain legibility without losing the dark aesthetic.
- **Active States:** An active or "pressed" state is indicated by a subtle inner glow using the primary color at 15% opacity.

## Shapes
The shape language is **Soft/Technical**. 

- **Global Radius:** 4px (`rounded-sm`) for most functional components like input fields and small buttons.
- **Card Radius:** 8px (`rounded-lg`) for dashboard containers and POS tiles.
- **Interactive Logic:** Large primary actions (like "Pay Now") may use a more pronounced 12px radius to differentiate them from static data tiles.
- **Status Indicators:** Status badges (Served, Ready) use a 2px radius or a sharp-edged pill to maintain a professional, industrial look.

## Components
- **POS Buttons:** Large, high-contrast tiles. Labels are bottom-aligned. The top-right corner is reserved for "Quantity" or "Price" indicators using monospaced type.
- **Data Tables:** Borderless rows with 1px separators (#262626). Column headers use `label-caps` typography. Hover states use `#1A1A1A` background tint.
- **Status Badges:** Solid background with white text for high contrast. 
    - *Preparing:* Charcoal background with Gold text.
    - *Ready:* Emerald background with White text.
    - *Overdue:* Red background with pulsing shimmer effect.
- **Input Fields:** Darker than the container surface, utilizing a 1px border that shifts to Gold (#D4AF37) on focus. No labels inside the field; use persistent top-aligned labels.
- **Dashboard Cards:** Minimalist. No drop shadows. Use 1px borders. Value-based metrics should be 200% larger than descriptive text.
- **Real-time Indicators:** A small 8px "pulse" dot in the corner of cards to indicate live data syncing or active kitchen tickets.