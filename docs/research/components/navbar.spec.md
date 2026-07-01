# Navbar Specification

## Overview
- **Target file:** `src/components/Navbar.tsx`
- **Screenshot:** `docs/design-references/hero-top.png`
- **Interaction model:** scroll-triggered background change

## DOM Structure
Fixed header div → inner container (max-width) → [Logo | Nav links | CTA buttons]

## Computed Styles

### Container
- position: fixed
- top: 0, left: 0, right: 0
- z-index: 10
- height: 71px
- background: transparent initially → rgba(255,255,255,0.95) + backdrop-filter: blur(8px) on scroll
- border-bottom: none initially → 1px solid #ededed on scroll
- transition: background 0.2s ease

### Inner wrapper
- max-width: ~1280px
- margin: 0 auto
- padding: 0 32px
- display: flex
- align-items: center
- justify-content: space-between
- height: 100%

### Logo
- Left side: SVG icon (square icon with rounded corners, looks like a chat/fabric icon) + "Fabric" text
- SVG icon: ~28px × 28px
- "Fabric" text: Inter or GT Alpina, ~16-18px, font-weight 500, color #000
- Gap between icon and text: 8px

### Nav Links (center)
- Items: "For individuals" | "For teams" | "Features ▾" | "Download ▾" | "Pricing"
- Font: Inter, 16px, weight 400, color: #000
- Gap between items: 24-32px
- Hover: opacity 0.7
- "Features" and "Download" have dropdown chevron (▾)

### Right side buttons
- "Log in": plain text link, Inter 15px, weight 400, color #000
- "Try for $0": black pill button
  - background: #0a0a0a
  - color: #ffffff
  - border-radius: 8px
  - padding: 10px 18px
  - font-size: 15px
  - font-weight: 500
  - font-family: Inter

## States & Behaviors

### Scroll-triggered transparent → solid
- **Trigger:** scroll position > 50px
- **State A (top):** background: transparent, border-bottom: none
- **State B (scrolled):** background: rgba(255,255,255,0.95), backdrop-filter: blur(8px), border-bottom: 1px solid #ededed
- **Transition:** transition: background 0.2s ease, border 0.2s ease
- **Implementation:** useEffect with scroll event listener, toggle CSS class `nav-scrolled`

### Mobile responsive
- **Below 768px:** hide nav links, show hamburger icon (≡)
- Hamburger: 3 lines, ~20px, color #000

## Text Content (verbatim)
- Logo: "Fabric"
- Nav: "For individuals" | "For teams" | "Features" | "Download" | "Pricing"
- Right: "Log in" | "Try for $0"

## Responsive Behavior
- **Desktop (1440px):** full nav visible
- **Mobile (<768px):** only logo + "Log in" + "Try for $0" + hamburger visible; center links hidden
- **Breakpoint:** ~768px

## Assets
- Fabric logo SVG: inline SVG (icon is a rounded square with abstract shape inside, black on white)
- No external images

## Notes
- The Fabric icon SVG can be reconstructed or use a placeholder similar to the screenshot
- "For individuals" is the active/current page indicator — slightly different style (bold or underline)
