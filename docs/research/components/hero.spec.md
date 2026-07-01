# Hero Section Specification

## Overview
- **Target file:** `src/components/HeroSection.tsx`
- **Interaction model:** static (floating card decorations)

## DOM Structure
Full-width section → centered content column → [rating badge | H1 | subtext | CTA button]
Plus: absolute-positioned floating UI cards (left and right of center)

## Layout
- Background: white (#ffffff)
- Padding top: ~120px (to clear fixed nav)
- Padding bottom: ~80px
- Center column: max-width ~680px, centered

## Computed Styles

### Rating badge (top)
- Layout: inline-flex, align-items center, gap 8px
- Stars: ⭐⭐⭐⭐⭐ (5 gold stars, ~16px each), color: #F5A623 (gold)
- "4.7": font Inter, 16px, weight 600, color #000
- "2.8K+ app ratings": font Inter, 14px, weight 400, color #666
- margin-bottom: 24px

### H1 "The workspace that thinks with you."
- Font: GT Alpina Light (var(--font-gt-alpina))
- font-size: 80px
- font-weight: 300
- line-height: 78.4px (98%)
- letter-spacing: -1.6px
- color: #000000
- text-align: center
- max-width: 720px
- margin: 0 auto 32px

### Subtext paragraph 1
- "Think, make, collaborate, and publish."
- "Alongside your own personal AI."
- Font: Inter, 18px, weight 400, color #555
- text-align: center
- line-height: 26px
- margin-bottom: 8px

### Subtext paragraph 2
- "A living home for all your projects, ideas, memories, files, & meetings."
- Font: Inter, 18px, weight 400, color #555
- text-align: center
- margin-bottom: 40px

### CTA Button "Try for $0"
- background: #0a0a0a
- color: #ffffff
- border-radius: 8px
- padding: 14px 28px
- font-size: 16px
- font-weight: 500
- font-family: Inter
- display: inline-flex
- align-items: center
- cursor: pointer
- transition: opacity 0.15s ease
- hover: opacity 0.85

## Floating Cards (decorative UI elements)

### Left card (photo collage)
- Position: absolute, left side
- Contains: 3 overlapping polaroid-style photos (nature/lifestyle photos)
- Photos are rotated at slight angles (-5deg, 0deg, 5deg)
- Each photo: white border, slight shadow
- Images: `/images/wtiAfgOy1jMohgG7xJaoOaT3UyE.png` etc.
- Size: ~300px wide

### Right card top (meeting notes UI)
- Position: absolute, right side top
- Dark UI card with text: "Q1 Roadmap Sync", meeting transcript, "Recording" badge
- Background: #1a1a1a (near-black)
- border-radius: 12px
- padding: 16px
- width: ~280px
- Font: Inter 12-13px, white text

### Right card bottom (document card)
- "The cost of lost knowledge" 
- White card with text, user avatar badge "Emma"
- White background, border-radius 12px
- Width: ~240px

## Assets
- Photo 1: `/images/wtiAfgOy1jMohgG7xJaoOaT3UyE.png` (standing person on cliff)
- Photo 2: `/images/UEQLPZ3DXqnE2u4l9xi6Re3KJUA.png` (hands/plant)
- Photo 3: `/images/4qUnQAJJAK1PxcI61JJeP2FyQM.png` (similar)
- App screenshot: `/images/MY6eadrZvyaW2bgOMyLHRcQQ.png`
- Meeting notes UI: `/images/cES0iJ9BNmZjFFnhIYu4ithkfho.png`

## Text Content (verbatim)
- Rating: "4.7 ⭐⭐⭐⭐⭐ 2.8K+ app ratings"
- H1: "The workspace that thinks with you."
- P1: "Think, make, collaborate, and publish. Alongside your own personal AI."
- P2: "A living home for all your projects, ideas, memories, files, & meetings."
- CTA: "Try for $0"

## Responsive Behavior
- **Desktop (1440px):** floating cards visible left and right, centered text
- **Tablet (768px):** floating cards may be hidden or scaled down
- **Mobile (390px):** no floating cards, stacked single column
- **Breakpoint:** 768px — hide floating decorations
