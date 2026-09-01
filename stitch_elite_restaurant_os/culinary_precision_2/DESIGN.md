---
name: Culinary Precision
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#38393a'
  surface-container-lowest: '#0c0f0f'
  surface-container-low: '#1a1c1c'
  surface-container: '#1e2020'
  surface-container-high: '#282a2b'
  surface-container-highest: '#333535'
  on-surface: '#e2e2e2'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e2e2e2'
  inverse-on-surface: '#2f3131'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#bfcdff'
  on-tertiary: '#082b72'
  tertiary-container: '#97b0ff'
  on-tertiary-container: '#254188'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#27438a'
  background: '#121414'
  on-background: '#e2e2e2'
  surface-variant: '#333535'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-ar:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md-ar:
    fontFamily: IBM Plex Sans Arabic
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.8'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  inline-start: logical
  inline-end: logical
  unit: 4px
  gutter: 24px
  margin-page: 40px
---

## Brand & Style
The design system embodies the rigor of high-end gastronomy—precise, disciplined, and luxurious. It targets professional chefs and culinary directors who operate in high-pressure, international environments. The aesthetic is a fusion of **Minimalism** and **Modern Corporate**, utilizing heavy whitespace to emphasize content and a dark-themed palette to evoke the atmosphere of a high-end kitchen at night. 

To support a global user base, the system adopts a "Culture-First" localization strategy, ensuring that visual hierarchy and technical precision remain consistent whether the interface is rendered in English or Arabic.

## Colors
The palette is anchored by "Chef's Gold" (#D4AF37), used sparingly for primary actions and critical highlights. The background is a deep, layered charcoal to reduce eye strain in low-light kitchen environments.

For localization management, specific functional colors are introduced:
- **Complete:** A muted emerald, indicating all localized strings are validated.
- **Missing English:** A high-visibility coral, signaling a break in the primary source.
- **Missing Arabic:** A warm amber, signaling pending translation tasks.

## Typography
This design system uses **Inter** for Latin scripts and **IBM Plex Sans Arabic** for RTL localization. Arabic glyphs generally require more vertical breathing room; therefore, line-heights are increased by approximately 15% for Arabic variants to maintain legibility.

**JetBrains Mono** is utilized for technical data (measurements, temperatures, SKU codes) across both languages to maintain a "spec-sheet" aesthetic. When switching to RTL, ensure numerical data remains LTR if they are standard international numerals, but align the container to the right.

## Layout & Spacing
The layout relies on **Logical Properties** rather than physical ones. Use `padding-inline-start` instead of `padding-left` to ensure that when the `dir="rtl"` attribute is applied, the spacing automatically mirrors.

The grid is a 12-column fluid system. In RTL mode, the column sequence starts from the right. Icons that imply direction (arrows, back buttons) must be flipped, while static icons (search, settings, clock) remain unflipped. 

**Common UI Labels:**
- **Search:** [EN] Search / [AR] بحث
- **Save:** [EN] Save / [AR] حفظ
- **Cancel:** [EN] Cancel / [AR] إلغاء
- **Delete:** [EN] Delete / [AR] حذف

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than shadows. In a dark professional UI, shadows can become muddy. 

- **Level 0 (Base):** #0D0D0D (Main background)
- **Level 1 (Surface):** #1A1A1A (Cards, navigation sidebars)
- **Level 2 (Overlay):** #262626 (Modals, dropdowns)

Borders are kept at 1px thickness with low-opacity white (10%) to define edges without adding visual noise. In RTL, the "Level 1" sidebar shifts from the left edge to the right edge.

## Shapes
The shape language is "Soft" (0.25rem), reflecting the precision of a chef's knife—sharp but controlled. Excessive rounding is avoided to maintain a professional, tool-like feel. 

Status indicators (Translation Status) use a circular dot (100% radius) next to the text label to provide a quick visual heat-map of localization progress.

## Components
- **Buttons:** Primary buttons use a solid Chef's Gold background with black text. In RTL, icons within buttons move to the right of the text label.
- **Input Fields:** Use a subtle bottom-border only or a fully enclosed dark-grey box. Labels must align `start` based on the language direction.
- **Translation Chips:** Small, high-contrast chips that use the `status` color tokens. They appear in the corner of component previews in the CMS view.
- **Data Tables:** Numerical columns should remain right-aligned even in Arabic LTR contexts to ensure decimal points align vertically, but the header text should follow the direction of the system language.
- **Directional Toggles:** A specialized component to preview the UI in LTR/RTL instantly, located in the global header for administrators.