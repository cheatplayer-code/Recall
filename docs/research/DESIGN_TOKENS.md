# Fabric.so Design Tokens

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#ffffff` | Page background |
| `--surface` | `#fafafa` (rgb(250,250,250)) | Cards, feature boxes |
| `--surface-muted` | `rgba(242,242,245,0.5)` | Subtle card bg |
| `--border` | `#ededed` (rgb(237,237,237)) | Dividers, borders |
| `--foreground` | `#000000` | Primary text |
| `--muted-foreground` | `#666666` (rgb(102,102,102)) | Secondary/muted text |
| `--brand-navy` | `#19154E` (rgb(25,21,78)) | "Learn more" links, brand accents |
| `--cta-dark` | `#0a0a0a` (rgb(10,10,10)) | CTA button background |
| `--electric-blue` | `#0610FF` (rgb(6,16,255)) | Accent blue highlight |
| `--purple-accent` | `#5C4FED` | AI section backgrounds (visual) |

## Typography

### Heading Font: GT Alpina Light
- **H1**: 80px, weight 300, line-height 78.4px, letter-spacing -1.6px, color #000
- **H2 (large)**: 52px, weight 300, line-height ~56px
- **H2 (section)**: 35px, weight 300, line-height 37.8px
- Used for: all major headings, hero text

### Body Font: Inter
- **Nav links**: 16px, weight 400, color #000
- **Body large**: 18px, weight 500, color #19154E (for feature descriptions)
- **Body regular**: 16px, weight 400
- **Small/caption**: 12–14px, weight 400

### Accent Font: Manrope
- Used for: specific UI labels and badges

## Font Loading
- GT Alpina Light: loaded from framerusercontent CDN (commercial font by Grilli Type)
  - Use Google Fonts alternative: **Lora** (light) or use `@font-face` self-hosted
  - Framer fallback: "GT Alpina Light Placeholder" (system serif)
- Inter: Google Fonts (weight 400, 500, 600)
- Manrope: Google Fonts (weight 400, 500)

## Spacing
- Base unit: 4px
- Common values: 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120px

## Border Radius
- Buttons: 8px
- Cards/feature boxes: 12–16px
- Pills/tags: 100px (fully rounded)

## Navigation
- Height: 71px
- Position: fixed, z-index 10
- Initial background: transparent
- Scrolled background: white with subtle border (scroll-triggered)
- Font: Inter 16px weight 400

## Shadows
- Cards: subtle box-shadow (verify via inspection)
- Modals: stronger shadow

## Breakpoints
- Desktop: 1440px
- Tablet: 768px
- Mobile: 390px
