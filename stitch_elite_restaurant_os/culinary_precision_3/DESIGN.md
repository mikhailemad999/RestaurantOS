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
  surface-container-highest: '#353534'
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
  secondary-container: '#00b47d'
  on-secondary-container: '#003e28'
  tertiary: '#bacfff'
  on-tertiary: '#002e69'
  tertiary-container: '#8eb3ff'
  on-tertiary-container: '#004291'
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
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a41'
  on-tertiary-fixed-variant: '#004493'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
  kitchen-new: '#007aff'
  kitchen-preparing: '#f59e0b'
  kitchen-ready: '#10b981'
  kitchen-rush: '#ef4444'
  printer-online: '#059669'
  printer-offline: '#e11d48'
  outline-gold: '#4d4635'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-ticket:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-ticket-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
  numeral-xl:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 40px
  numeral-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 20px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-safe: 24px
  touch-target: 48px
  card-gap: 12px
---

## Brand & Style
The design system is an industrial-grade framework engineered for the high-velocity, high-humidity environment of professional kitchens. The aesthetic is **High-Contrast Modern**, leveraging a "Void" base of deep blacks and charcoal to allow functional status indicators to vibrate with clarity. 

The brand personality is authoritative and focused, mimicking the precision of a chef's knife. It utilizes a dark-mode-first approach to reduce eye strain in varying light conditions—from dim dining rooms to brightly lit prep stations. The emotional response is one of calm, systematic control, where the interface feels like an extension of the kitchen’s physical tools: durable, responsive, and stripped of ornamental distraction.

## Colors
The color strategy prioritizes functional triage. The primary **Chef’s Gold (#d4af37)** is used for navigation anchors and primary command execution. 

Specialized kitchen status colors are mapped to immediate cognitive triggers:
- **Kitchen New:** High-contrast blue for incoming signals.
- **Kitchen Preparing:** Amber/Orange for active workflows.
- **Kitchen Ready:** Vibrant green for hand-off.
- **Kitchen Rush:** A pulsing red for overdue tickets or peak capacity alerts.
- **Printer Status:** Emerald and Rose provide binary clarity on hardware health.

Backgrounds utilize tiered neutrals: **#0e0e0e** for the base canvas and **#20201f** for elevated card containers, ensuring sufficient contrast for the vibrant status indicators.

## Typography
Typography is optimized for "glanceability" across a distance. **Inter** provides a clean, neutral foundation for UI labels and instructions. **JetBrains Mono** is utilized for all critical numeric data (ticket numbers, timers, quantities) to ensure character distinction and prevent layout jitter during count-ups.

In kitchen environments, use `headline-ticket` for order items and `numeral-xl` for quantities. Labels must be bold to remain legible through steam or at low brightness. For mobile handhelds, typography scales to maintain high stroke-weight visibility.

## Layout & Spacing
This design system uses a **4px base grid** with a focus on touch-screen ergonomics. 

The layout follows a **Hybrid Grid** model:
- **Kitchen Display System (KDS):** A flexible column-based layout where tickets wrap based on screen width. Gutters are fixed at 16px to prevent visual crowding.
- **Management Dashboards:** A standard 12-column fluid grid.
- **Handheld/POS:** A fixed-width grid with 48px minimum touch targets.

Margins are kept tight (8-12px) within components to maximize the information density of order lists, while external safe areas are maintained at 24px to prevent interaction errors near device bezels.

## Elevation & Depth
In the "Void" theme, traditional drop shadows are ineffective. Depth is conveyed through **Chromatic Layering** and **Luminous Borders**.

- **Surface Levels:** The background is `#131313`. Active containers use `#20201f`. Floating elements or high-priority tickets use `#2a2a2a`.
- **Ghost Outlines:** Instead of shadows, use 1px solid outlines (`#353535`) to define component boundaries. 
- **Status Glows:** High-priority "Rush" tickets may use a subtle outer glow (5px blur, 20% opacity) in the status color to draw peripheral attention.
- **Glassmorphism:** Reserved for temporary overlays, using a 15px backdrop blur and a slight white tint to differentiate the overlay from the dark content beneath.

## Shapes
The shape language is **Soft-Industrial**. 

The base radius of 4px (`rounded-sm`) is used for buttons and input fields to maintain a technical, efficient look. Larger containers like Kitchen Tickets use an 8px radius (`rounded-lg`) to soften the density of the information. Status indicators for "Printer Online/Offline" use a 2px radius or a strict pill-shape for immediate recognition as a non-interactive status badge.

## Components
- **Kitchen Tickets (Cards):** Use a tiered header system. The header background color must reflect the kitchen status (e.g., Blue for New). Item quantities use `numeral-xl` in a high-contrast box. Modifiers (e.g., "No Onions") must use `label-bold-lg` in `kitchen-rush` red.
- **Printer Monitor Cards:** Compact cards with a 1px border. The status color is applied as a 4px vertical "light bar" on the left edge.
- **Action Buttons:** Must be a minimum of 48px height. Primary actions use the Gold fill; secondary actions use a 1px Gold outline.
- **Status Chips:** Solid fills with `data-mono` white text. For "Rush" states, the chip should incorporate a subtle animation (1s pulse).
- **Input Fields:** Dark background (#0e0e0e) with a persistent Gold focus ring. No floating labels—use fixed, bold labels above the field for speed.
- **Progress Bars:** Thin 4px bars used within tickets to indicate "Time Elapsed" versus "Target Prep Time," color-shifting from Green to Amber to Red.