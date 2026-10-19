---
name: Monochrome Pro Dark
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6c9'
  on-secondary: '#2f3033'
  secondary-container: '#4a4b4e'
  on-secondary-container: '#bbbbbe'
  tertiary: '#ffffff'
  on-tertiary: '#2f3038'
  tertiary-container: '#e3e1ec'
  on-tertiary-container: '#63646c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e2e2e5'
  secondary-fixed-dim: '#c6c6c9'
  on-secondary-fixed: '#1a1c1e'
  on-secondary-fixed-variant: '#454749'
  tertiary-fixed: '#e3e1ec'
  tertiary-fixed-dim: '#c6c5cf'
  on-tertiary-fixed: '#1a1b22'
  on-tertiary-fixed-variant: '#46464e'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies a razor-sharp, high-focus atmosphere engineered for ambitious talent and top-tier employers. Built on an ethos of structural minimalism, high contrast, and tactile restraint, the interface strips away unnecessary visual noise to foreground opportunity, metrics, and career progression.

### Target Audience & Tone
The audience comprises tech-forward job seekers, software engineers, product designers, interns, and high-velocity hiring teams. The interface evokes discipline, architectural precision, and uncompromising quality—creating a quiet, confident workspace where candidates and roles meet without visual distractions.

### Visual Aesthetic
A rigorous blend of **Modern Minimalism** and **Linear Industrial Design**:
- Ultra-deep zinc canvases provide immediate depth and reduce eye fatigue.
- Deliberate, high-contrast monochrome accentuation replaces generic color gradients.
- Micro-interactions are snappy, linear, and functional, relying on precise perimeter shifts, surface light-ups, and crystalline typography.

## Colors

The palette operates on a strict monochromatic hierarchy anchored in deep zinc tones. Color is eschewed in favor of luminous values and structural contrast.

### Palette Architecture
- **Canvas Base (`#09090B`)**: The deepest ground layer, grounding the entire screen estate in pure dark zinc.
- **Card & Container Surface (`#18181B`)**: Elevated structural layer offering a clean, distinct plane for actionable blocks, metrics, and listing rows.
- **Surface Hover & Highlight (`#27272A`)**: Interactive surface state for table rows, hovered cards, and secondary inputs.
- **Elevated Borders & Dividers (`#303036`)**: The crisp line token defining boundaries between modules without competing for attention.
- **Primary Interactive Token (`#FFFFFF`)**: Pure, unadorned white reserved strictly for primary actions, critical toggles, and brand beacons. Text set on this token drops to `#09090B`.
- **Primary Typographic Fill (`#E4E4E7`)**: Crisp silver-zinc for prominent headlines, candidate names, and salary ranges.
- **Muted Typographic Fill (`#A1A1AA`)**: Secondary zinc for body copy, company locations, metadata, and timestamps.
- **Subtle Metadata (`#71717A`)**: De-emphasized tokens for breadcrumbs, disabled states, and auxiliary counter badges.
- **Subtle Feedback Indicators**: Success, warning, and alert states stay restrained, deploying desaturated accents with luminous borders rather than hyper-saturated neon fills.

## Typography

Inter is implemented globally across all display, narrative, and utility surfaces. The hierarchy depends on weight contrasts and precise negative letter spacing to create an assertive, product-first cadence.

### Typographic Principles
- **Tracking & Kern Strategy**: Negative letter spacing on all titles above 16px produces an editorial density reminiscent of swiss modernism. Labels below 12px utilize slight positive tracking for scannability on dense dashboards.
- **Contrast Pairing**: Primary headers leverage `#E4E4E7` in 600 or 700 weights, immediately followed by subheaders and metadata in `#A1A1AA` in 400 or 500 weights to establish an intuitive eye-scan path.
- **Numerical Alignment**: Use tabular figures (`font-variant-numeric: tabular-nums`) for salary tiers, applicant counters, dates, and analytics metrics to ensure strict visual balance.

## Layout & Spacing

The layout model utilizes a standard 12-column responsive fluid grid pinned to an 8px base rhythm, structured inside a max-width container of `1280px` for discovery feeds and `1440px` for applicant dashboards.

### Responsive Behaviors
- **Desktop (1024px and up)**: 12 columns with `1.5rem` (24px) gutters and `2rem` (32px) outer margins. Multi-pane navigation splits into persistent left-hand subnav (240px fixed), primary listings pane (fluid), and contextual detail drawer (480px fixed).
- **Tablet (768px – 1023px)**: 8 columns with `1rem` (16px) gutters and `1.5rem` (24px) outer margins. Contextual sidebars collapse into bottom sheets or stacked accordions.
- **Mobile (below 768px)**: 4 columns with `1rem` (16px) gutters and `1rem` (16px) outer margins. Cards switch from multi-column flex layouts to strictly vertical stacks, pinning primary CTAs to a sticky bottom dock.

### Spatial Discipline
Component paddings are strictly harmonized: compact interactive items (badges, chips) deploy `space-xs` and `space-sm`, standard cards utilize `space-lg`, and large surface containers use `space-xl`.

## Elevation & Depth

Visual hierarchy does not rely on heavy drop shadows. Depth is achieved through **Tonal Layering** combined with **Low-Contrast Structural Borders**.

### Layering Hierarchy
1. **Base Layer (Elevation 0 - `#09090B`)**: Full canvas backdrop.
2. **Surface Layer (Elevation 1 - `#18181B`)**: Applied to job cards, filter menus, and candidate lists. Bound by a solid 1px border (`#303036`).
3. **Interactive / Raised Layer (Elevation 2 - `#27272A`)**: Hovered cards, expanded accordions, and active dropdown triggers.
4. **Overlay Layer (Elevation 3 - `#18181B` with Ambient Glow)**: Modals, slide-out job application drawers, and search palettes. This tier utilizes a subtle, non-colored drop shadow (`0px 20px 40px rgba(0, 0, 0, 0.7)`) layered over a `1px` `#3F3F46` border and a backdrop blur of `12px` over the underlying canvas.

### Border Rules
Borders are never thicker than `1px`. Hover states should never shift layout dimensions; stroke color shifts from `#303036` to `#52525B` provide all feedback.

## Shapes

The interface embraces a tight, refined curvature standard between 12px and 16px to soften the industrial precision of the dark monochrome palette without sliding into playful or casual aesthetics.

### Shape Scale Applications
- **Input Fields & Buttons**: Fixed at `0.75rem` (12px) for a focused, compact structural feel.
- **Cards, Panels, & Dialogs**: Fixed at `1rem` (16px) border-radius (`rounded-lg`) to comfortably house internal content without clipping elevated borders.
- **Pills & Tags**: Set to full circular radii (`9999px`) exclusively for dynamic status chips (e.g., "Full-Time", "Internship", "Remote") and micro-indicators.
- **Inner Containers**: When nested within a 16px card with `space-md` (16px) padding, nested surfaces must carry a `0.5rem` (8px) radius to maintain concentric geometry.

## Components

### Buttons
- **Primary Action (Apply, Post Job)**: Surface `#FFFFFF`, text `#09090B`, font weight 600. No border. On hover: background drops subtly to `#E4E4E7`. On active: slight scale down (`scale(0.98)`).
- **Secondary Action (Save, Filter, Details)**: Surface transparent, border 1px solid `#303036`, text `#E4E4E7`. On hover: surface `#18181B`, border `#52525B`.
- **Tertiary / Ghost Action (Cancel, Clear)**: Surface transparent, border none, text `#A1A1AA`. On hover: text `#FFFFFF`, background `#18181B`.

### Job Cards & Listing Items
- **Card Structure**: Background `#18181B`, border 1px solid `#303036`, border-radius 16px, padding `1.5rem`.
- **Header**: Company mark in a 40x40px rounded-lg container (`#27272A` border `#303036`), job title in `#E4E4E7` (`title-md`), and timestamp in `#71717A`.
- **Meta Bar**: Inline flex grouping of badges with salary range, work location, and experience requirements.
- **Hover State**: Border transitions to `#52525B` over 150ms ease-out.

### Chips & Metadata Badges
- **Status Chips**: Background `#27272A`, border 1px solid `#303036`, border-radius 9999px. Text `#A1A1AA` (`label-xs`).
- **Active Filter Chips**: Background `#FFFFFF`, text `#09090B`, border none. Includes a miniature stroke-based close icon.

### Input Fields & Search Bars
- **Base Style**: Background `#18181B`, border 1px solid `#303036`, border-radius 12px, typography `body-md` in `#E4E4E7`. Placeholder set in `#71717A`.
- **Focus State**: Border transitions to `#FFFFFF`, accompanied by an exterior ring: `0 0 0 1px #FFFFFF`.

### Checkboxes & Radio Buttons
- **Unchecked**: 18x18px box/circle, border 1px solid `#52525B`, background transparent.
- **Checked**: Surface `#FFFFFF`, checkmark icon `#09090B` with 2px stroke weight.

### Specialty Components: Jobify Portal
- **Salary Band Slider**: Track in `#27272A`, filled range in `#E4E4E7`, handle in solid `#FFFFFF` with elevated inner stop.
- **Internship Tag**: Distinct high-contrast badge utilizing a solid `#09090B` interior framed inside a double-weight outline of `#E4E4E7` to cleanly distinguish emerging talent roles from senior listings.
- **Application Status Indicator**: Minimal monochrome dot array: empty circle (`#303036`) for pending, half-filled (`#A1A1AA`) for reviewed, and solid bright white (`#FFFFFF`) for interview scheduled.