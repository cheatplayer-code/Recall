# Footer Specification

## Overview
- **Target file:** `src/components/Footer.tsx`
- **Interaction model:** static

## Layout
- Background: #000 or very dark (#0a0a0a)
- Color: #ffffff
- padding: 64px 80px 40px
- display: grid, ~5 columns

## Columns

### Column 1: Logo + tagline
- Fabric logo (white version)
- Tagline or short description

### Column 2: For users / Individuals
Links:
- Researchers
- Students  
- Designers
- Writers
- Consultancies
- Law firms
- Architecture studios

### Column 3: Features →
Links:
- Canvas
- AI Assistant
- Notes and docs
- Meeting and voice notes
- Tasks
- Deep search
- Sync & backup
- Publish
- Email-to-Fabric
- Annotations

### Column 4: Product
Links:
- Pricing
- Blog
- Changelog
- Download
- Integrations

### Column 5: Company
Links:
- About
- Careers
- Press
- Contact

## Typography
- Column headers: Inter, 14px, weight 600, color #fff, with "→" for Features
- Links: Inter, 14px, weight 400, color rgba(255,255,255,0.6)
- Hover links: color #fff
- gap between items: 12px

## Bottom bar
- Below main columns
- Separator: 1px solid rgba(255,255,255,0.15)
- Left: "© 2025 Fabric" 
- Right: "Privacy Policy" | "Terms of Service"
- Font: Inter, 13px, color rgba(255,255,255,0.5)

## Responsive
- **Desktop:** 5 columns
- **Mobile:** stacked single column, accordion or visible all
