# Create Section Specification

## Overview
- **Target file:** `src/components/CreateSection.tsx`
- **Interaction model:** scroll-driven (features reveal on scroll)

## Structure
- Section heading: "Create." (GT Alpina, large)
- Sub-description
- 5 feature cards stacked vertically, alternating left/right layout

## Section Header

### Heading "Create."
- Font: GT Alpina Light
- font-size: 52px
- font-weight: 300
- color: #000
- margin-bottom: 12px

### Sub-description
- "Create whiteboards, documents, spaces, tasks, and meeting notes."
- Font: Inter, 18px, weight 400, color: #666
- margin-bottom: 48px

## Feature Cards Layout
Each feature card:
- background: #fafafa
- border-radius: 16px
- overflow: hidden
- margin-bottom: 16px
- display: grid, 2 columns (image | text) or (text | image) alternating
- min-height: ~400px

### Feature 1: Canvas
- **Image side:** App screenshot with canvas/moodboard UI, flowers photo pinned to canvas
  - Image: from framerusercontent CDN (canvas UI screenshot)
- **Text side:**
  - Heading: "An infinite canvas."
  - Sub: "Draw, moodboard, and think."
  - Body: "Create whiteboards, documents, and spaces to think visually."
  - Link: "Learn more →" (color: #19154E, Inter 18px weight 500)
- Image: `/images/MY6eadrZvyaW2bgOMyLHRcQQ.png`

### Feature 2: Notes & Docs
- **Image side:** Text editor UI mockup (diary-style entry, formatting toolbar)
  - White/light bg card
- **Text side:**
  - Heading: "Write full documents or quick notes."
  - Sub: "A beautifully minimal text editor that gives your ideas room to grow and flourish."
  - Body: "Effortlessly embed or link to another file, note or anything else."
  - Link: "Learn more →"

### Feature 3: Voice Notes (AI)
- **Image side:** Voice transcription UI (blue/purple bg), "My notes | Transcript | Summary" tabs
- **Text side:**
  - Heading: "Create meeting or voice notes."
  - Sub: "Record, transcribe, and summarize with AI."
  - Link: "Learn more →"

### Feature 4: Tasks
- **Image side:** Purple/blue gradient bg with floating task UI: "Reminder" pill, "High priority" / "Medium priority" labels, checkmark icons
  - background: linear-gradient(135deg, #4338ca, #6366f1) or similar blue-purple
- **Text side:**
  - Heading: "Create tasks with reminders."
  - Body: "Take action and plan, all in the same place."
  - Body2: "Set priority, a due date, reminders, and connect relevant files."
  - Link: "Learn more →"

### Feature 5: Spaces
- **Image side:** Research documents / academic papers UI
- **Text side:**
  - Heading: "Create a space and gather your ideas."
  - Body: "A home for every project. Collect, organize, and reference everything."
  - Link: "Learn more →"

## Card Text Styles (all features)
- Feature heading: Inter, 22px, weight 600, color #000
- Feature body: Inter, 16px, weight 400, color #666, line-height 24px
- "Learn more →": Inter, 18px, weight 500, color #19154E
  - Hover: arrow moves 4px right (transition: transform 0.2s)

## Card padding (text side)
- padding: 48px 40px
- display: flex, flex-direction: column, justify-content: center
- gap: 12px

## Responsive Behavior
- **Desktop:** 2-column grid per card (image | text)
- **Mobile:** stacked (image above, text below)
- **Breakpoint:** 768px
