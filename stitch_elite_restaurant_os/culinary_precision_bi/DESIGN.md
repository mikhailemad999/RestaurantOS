---
name: Culinary Precision BI
colors:
  surface: '#16130b'
  surface-dim: '#16130b'
  surface-bright: '#3d392f'
  surface-container-lowest: '#110e07'
  surface-container-low: '#1f1b13'
  surface-container: '#231f17'
  surface-container-high: '#2d2a21'
  surface-container-highest: '#38342b'
  on-surface: '#eae1d4'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#eae1d4'
  inverse-on-surface: '#343027'
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
  tertiary: '#bfcdff'
  on-tertiary: '#082b72'
  tertiary-container: '#97b0ff'
  on-tertiary-container: '#254188'
  error: '#f43f5e'
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
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#27438a'
  background: '#131313'
  on-background: '#eae1d4'
  surface-variant: '#38342b'
  success: '#10b981'
  warning: '#f59e0b'
  info: '#3b82f6'
  surface-data: '#1c1c1c'
  border-muted: '#2a2a2a'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  data-table-header:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.05em
  data-table-cell:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 1rem
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 1rem
  stat-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  grid-margin: 24px
  gutter: 16px
  pane-padding: 12px
  cell-padding-v: 8px
  cell-padding-h: 12px
  compact-gap: 4px
---

## Brand & Style
The design system for this high-performance BI and Operations platform is defined by **Industrial Minimalism** and **Technical Sophistication**. It is engineered for environments where split-second decision-making meets deep analytical dive-ins. The aesthetic leverages the existing dark-mode base to minimize eye strain during long-duration monitoring while using vibrant semantic accents to highlight critical operational shifts.

The personality is authoritative and precise—evoking the feeling of a high-tech "flight deck" for restaurant operations. It balances the premium, "front-of-house" elegance of the original brand with a "back-of-house" focus on raw data utility, speed, and real-time responsiveness.

## Colors
This design system operates on a deep black base (`#131313`) to maximize the luminance of data visualizations. **Chef's Gold** remains the primary interactive accent, used for branding and primary navigational anchors.

A specialized semantic palette is introduced for operational awareness:
- **Success (Emerald):** Positive trends, completed logistics, and healthy margins.
- **Warning (Amber):** Approaching thresholds, late orders, or inventory warnings.
- **Error (Rose):** Critical system failures, immediate action required, or negative budget variances.
- **Informational (Azure):** General system notifications and neutral data points.

Data visualization should use these semantic colors against the dark background, ensuring a high contrast ratio for legibility in fast-paced operational environments.

## Typography
The typography system is split into two functional roles: **Inter** handles the UI structure and narrative, while **JetBrains Mono** handles the technical payload.

For the BI platform, we introduce **High-Density Variants**:
- **Monospaced Data:** All tabular data and metrics must use JetBrains Mono to ensure numerical alignment (tabular figures), making it easier for users to scan columns of figures for discrepancies.
- **Density Scaling:** In multi-pane dashboards, use `data-table-cell` and `label-xs` to maximize information density without sacrificing clarity.
- **Impact Metrics:** Key Performance Indicators (KPIs) utilize `stat-lg` in Inter for immediate visual impact.

## Layout & Spacing
The layout follows a **Fluid Grid** philosophy designed for multi-monitor setups and high-resolution tablets. The system uses a 12-column grid for standard dashboards, but transitions to a "Tile-Based" layout for operational panes.

**Density Standards:**
- **Operations Density:** A strict 4px base unit controls spacing.
- **Multi-Pane View:** Dashboards are divided into flexible panes. Each pane uses `pane-padding: 12px` to allow for maximum data visualization space while maintaining distinct visual boundaries.
- **Responsive Reflow:** On mobile, complex tables collapse into "Card-List" views, while 3-column dashboards stack vertically. High-priority KPI tiles are always pinned to the top.

## Elevation & Depth
In this design system, depth is communicated through **Tonal Layering** rather than traditional drop shadows, which can muddy the clarity of a dark UI.

- **Background (`#131313`):** The absolute base level.
- **Surface (`#1c1c1c`):** Used for dashboard cards and primary panes.
- **Elevated Surface (`#2a2a2a`):** Used for hover states, tooltips, and dropdown menus.
- **Borders:** Instead of shadows, use 1px solid borders (`#2a2a2a`) to define containers. For "Active" or "Focused" states, the border transitions to **Chef's Gold** or the relevant semantic color.
- **Glassmorphism:** Apply a subtle `backdrop-filter: blur(10px)` on sticky headers and sidebars to provide a sense of place during scrolling without distracting from the data.

## Shapes
The shape language is **Soft** but disciplined. A global radius of `0.25rem` (4px) is applied to buttons, input fields, and small UI components to maintain a professional, technical appearance.

Larger containers and dashboard cards may use `0.5rem` (8px) to provide a clearer distinction between the workspace and individual data modules. Interactive elements like "Trend Indicators" (up/down arrows) should be contained within small, rounded squares rather than circles to maintain the industrial aesthetic.

## Components
- **Data Tables:** High-density with sticky headers. Rows use a 1px bottom border. "Loading" states are represented by skeleton shimmers that match the `surface-data` tone.
- **Trend Indicators:** Small badges adjacent to metrics. Use `Success` (up) or `Error` (down) semantic colors with a background opacity of 10% for a subtle "tint" effect.
- **Operational Tiles:** Modular cards containing a single KPI. Must support "Empty" states with a centered, muted icon and "No Data Available" text in `label-xs`.
- **Buttons:**
    - *Primary:* Solid Chef's Gold with black text.
    - *Secondary:* Outlined with 1px Chef's Gold.
    - *Ghost:* Transparent with Gold text for low-priority actions.
- **Input Fields:** Dark background (`#0e0e0e`) with a subtle `border-muted`. On focus, the border glows with a 2px Chef's Gold stroke.
- **Status Chips:** Small, pill-shaped indicators using the semantic palette. Text is always uppercase `label-xs` for a "technical tag" look.