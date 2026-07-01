# Fabric.so — Behavior Bible

## Global Behaviors

### Smooth Scroll
- No Lenis or Locomotive Scroll detected
- Standard browser scroll

### Navbar Scroll Behavior
- **Trigger**: scroll past ~50px from top
- **State A (top)**: background transparent, no border
- **State B (scrolled)**: background white (#fff), possibly border-bottom 1px solid #ededed
- **Transition**: probably CSS transition: background 0.2s ease
- **Implementation**: scroll event listener or IntersectionObserver on hero sentinel

### Section Animations (scroll-triggered)
- Elements animate in when they enter the viewport
- Common animation: fade up (opacity 0→1, translateY 20px→0)
- Likely using IntersectionObserver or CSS @keyframes with `animation-timeline`
- Framer typically uses transform + opacity animations

## Section-Specific Behaviors

### Hero Section
- **Floating cards**: positioned with absolute/transform, may have subtle animation (float up/down)
- **Rating stars**: static display
- **CTA button**: hover darkens slightly

### Feature Cards (Create Section)
- **Interaction model**: scroll-driven revelation (not tabs/clicks)
- Feature cards appear one after another as user scrolls
- Each card has: image left/right, text right/left
- Hover: subtle elevation change on cards

### AI Section
- **Interaction model**: scroll-driven
- Purple background appears on certain sub-sections
- AI model selector UI shows dropdown on click

### Search Section
- Animated search input with blinking cursor
- Results appear with animation
- Purple glow/gradient background

## Hover States
- Nav links: slight opacity or underline on hover
- "Learn more →" links: arrow moves right on hover (likely CSS transform)
- CTA buttons: slight bg darkening, box-shadow appears
- Feature cards: subtle shadow/lift

## Responsive Behavior
- **Desktop (1440px)**: full nav, side-by-side feature cards
- **Tablet (768px)**: nav collapses to hamburger (hamburger icon visible in mobile screenshots), stacked layout
- **Mobile (390px)**: single column, mobile nav overlay

### Mobile Nav
- Hamburger button appears (≡)
- Clicking opens full-screen overlay menu
- Menu items: For individuals, For teams, Features, Download, Pricing, Log in, Try for $0

## Animation Details
- Framer typically injects CSS `@keyframes` and `animation` properties
- Elements have `opacity: 0` initially, then fade in
- Duration: ~0.4–0.6s
- Easing: ease-out or cubic-bezier(0.4, 0, 0.2, 1)
