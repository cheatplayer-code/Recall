# TrustedBy + Download Platforms Section Specification

## Overview
- **Target file:** `src/components/TrustedBySection.tsx`
- **Interaction model:** static

## Part 1: Trusted By

### Layout
- Full-width, white background
- Centered text: "Trusted by thinkers, creatives, researchers and students at"
- Below: horizontal logo strip (institution/company logos)
- padding: 48px 32px

### Heading text
- Font: Inter, 16px, weight 400, color #666
- text-align: center
- margin-bottom: 24px

### Logo strip
- display: flex, gap: 32-48px, align-items: center, justify-content: center
- flex-wrap: wrap
- Logos: grayscale images (company/university logos)
- Logo images from framerusercontent CDN:
  - `/images/pfSO34tXPcWvXjLwmyhs4y103c.png` (w:308)
  - `/images/XhRgPDiL0Z31WGxLgTSSWfuhXo.png` (w:408)
  - `/images/JAiT3LlagYS7Ovk3fqFSxtypo.png` (w:450)
  - `/images/OItbL3ySDQh3h1l7nM4GBf8J10o.png` (w:288)
  - `/images/jEF8FbMUTOrx44shbSGr0s6wLCo.png`
  - `/images/UiIgIwGvZBSpC99BzWPhWqSX8.png`
  - `/images/3matbM3hFnMuVpLfntXiY2AvTRs.png`
  - `/images/yZWeKgRc9KD9BdM4lqxbYAknus.png`
- Each logo: height ~40px, width: auto, opacity: 0.6-0.8

## Part 2: Download Platforms

### Layout
- Full-width section below Trusted By
- 4-column grid with dividers
- Border-top and border-bottom: 1px solid #ededed
- Background: white
- Each cell padding: 32px 48px

### Grid columns: Web | iOS | Android | Chrome

### Each cell structure
- Icon/illustration (top)
- Platform name: Inter, 20-24px, weight 500, color #000
- Action text: Inter, 14px, weight 400, color #666
  - Web → "Sign in"
  - iOS → "Get app"
  - Android → "Get app"
  - Chrome → "Get extension"
- Vertical dividers between cells: 1px solid #ededed
- Horizontal borders top and bottom: 1px solid #ededed

### Cell styles
- padding: 40px
- text-align: center
- gap between icon and text: 12px

## Text Content (verbatim)
Trusted by: "Trusted by thinkers, creatives, researchers and students at"
Downloads:
- "Web" / "Sign in"
- "iOS" / "Get app"
- "Android" / "Get app"
- "Chrome" / "Get extension"

## Responsive Behavior
- **Desktop:** 4 columns side by side
- **Tablet:** 2×2 grid
- **Mobile:** 2×2 grid, smaller padding
