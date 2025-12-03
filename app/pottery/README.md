# Pottery Commission Form - Implementation Notes

## Current Status
- ✅ Form structure and MadLibs layout complete
- ✅ Styling with warm, organic feel (not corporate SaaS)
- ✅ Speckled background pattern (#E8ECEE)
- ✅ Generous spacing (70/30 ratio embraced)
- ✅ Placeholder SVG illustrations (NEED REPLACEMENT)
- ✅ Responsive design across all breakpoints
- 🚧 Illustrations require custom hand-drawn artwork from GF

## ⚠️ CRITICAL: Illustration Replacement Needed

The current SVG illustrations are **code-generated placeholders** with organic curves. They're better than geometric shapes but still feel digital.

### What GF Needs to Create

**Style Requirements:**
- Hand-drawn with intentional wobbles and imperfections
- Line weight: 2-3px (can vary slightly for organic feel)
- Color: #B87D6C (clay terracotta) for ALL lines
- Style: Clean but not perfect - subtle organic variation is key
- Format: SVG (outline only, no fill)
- **NOT perfectly geometric** - circles should be slightly wonky, lines should have character

### Three Illustrations Needed

**1. Top Illustration (Entry Screen)**
- Subject: Organic planter with succulent/simple plant
- Size: ~100px wide × ~120px tall (desktop)
- Current placeholder location: `page.jsx` line ~80-92
- Vibe: Welcoming, sets the tone for the whole experience

**2. Bottom Illustration (Entry Screen)**
- Subject: Simple cup or small bowl
- Size: ~70px wide × ~60px tall (desktop)
- Current placeholder location: `page.jsx` line ~164-172
- Can be at slight angle for visual interest
- Vibe: Playful, more subtle than top illustration

**3. Confirmation Illustration**
- Subject: Different vessel (vase or different planter)
- Size: ~80px wide × ~100px tall
- Current placeholder location: `page.jsx` line ~187-199
- Vibe: Slightly more celebratory/playful than entry illustrations

### Design Philosophy
From the spec: *"Hand-drawn but intentional - clean lines with subtle organic variation, not perfectly geometric. Outline only, no fill. Minimal detail but recognizable."*

The current placeholders have some curves and wobbles, but they're mathematically generated. GF's artwork should feel like it was drawn by hand - slight imperfections, organic line variation, personality in every stroke.

### How to Replace
1. GF creates SVG files
2. Replace the SVG content in `page.jsx` at the locations noted above
3. Keep the same viewBox and dimensions
4. Ensure stroke color is #B87D6C
5. Test at all breakpoints (illustrations scale responsively)

## Design Changes Made

### From Original Corporate SaaS Feel → Warm, Handmade Studio:

**Colors:**
- Background: Added speckled pattern overlay (subtle texture)
- Form inputs: Changed from pure white (#FFF) to warm off-white (#FEFDFB)
- Borders: Softened from 2px to 1.5px, warmer gray (#E8E5E0)
- Shadows: Made more subtle throughout

**Spacing (Dramatically Increased):**
- Form container padding: 64px → 80px
- Between MadLibs lines: 32px → 48px
- Before button: 48px → 64px
- Opening line spacing: Added extra 56px
- Illustration margins: All increased by 40%

**Form Elements:**
- Input heights: 48px → 52px
- Textarea min-height: 120px → 140px
- Button height: 56px → 60px
- Padding: Increased across all inputs
- Placeholders: Added italic style for personality
- Hover states: Softer transitions (0.2s → 0.25-0.3s)
- Focus glow: Larger, softer (3px → 4px, more transparent)

**Illustrations:**
- Added subtle opacity (0.9-0.95) for less aggressive presence
- Replaced perfect geometric shapes with organic Bézier curves
- Added strokeLinecap="round" for softer line endings
- Variable stroke widths (2.2-2.5px) for organic feel

## Next Sprint: MongoDB Integration

Currently logging to console. Next sprint will add:
- MongoDB connection
- API endpoint for form submission
- Data persistence
- Optional: Email notifications

## Testing
Visit `http://localhost:3000/pottery` to see the current implementation.
