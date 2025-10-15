# Design Guidelines: ICD Medical Code Converter

## Design Approach
**Selected Approach:** Design System-Based (Material Design principles with healthcare customization)

**Justification:** This is a utility-focused medical tool requiring clarity, efficiency, and professional presentation of complex medical data. Healthcare professionals need quick access to accurate conversions without visual distractions.

**Key Design Principles:**
- Clinical clarity over decorative elements
- Information hierarchy optimized for scanning
- Trust signals through professional, clean presentation
- Accessibility for extended professional use

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 220 15% 12% (deep slate)
- Surface: 220 15% 18% (elevated slate)
- Primary: 210 100% 60% (medical blue)
- Text Primary: 0 0% 98%
- Text Secondary: 220 10% 70%
- Success (classified): 142 70% 50% (medical green)
- Warning (not classified): 45 90% 60% (amber)
- Border: 220 15% 25%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Primary: 210 100% 45%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 45%
- Success: 142 70% 40%
- Warning: 45 90% 50%
- Border: 220 10% 85%

### B. Typography

**Font Families:**
- Primary: 'Inter' (Google Fonts) - body text, labels, data
- Monospace: 'JetBrains Mono' (Google Fonts) - medical codes display

**Hierarchy:**
- Page Title: 2xl/3xl, semibold
- Section Headers: xl, semibold
- Data Labels: sm, medium, uppercase, letter-spacing
- Medical Codes: base/lg, monospace, medium
- Body Text: base, regular
- Helper Text: sm, regular

### C. Layout System

**Spacing Primitives:**
Use Tailwind units: 2, 3, 4, 6, 8, 12, 16, 20
- Micro spacing (form elements): p-2, p-3
- Component padding: p-4, p-6
- Section spacing: p-8, gap-6
- Major sections: py-12, py-16, my-20

**Grid Structure:**
- Container: max-w-7xl mx-auto px-4
- Search section: max-w-3xl mx-auto
- Results table: full width within container
- Single column layout (no multi-column for this utility)

### D. Component Library

**Search Interface:**
- Large search input with icon (magnifying glass)
- Real-time search with debouncing
- Autocomplete dropdown with code previews
- Clear button when input has value
- Search container: backdrop-blur, subtle border

**Results Display:**
- Professional data table layout
- Column structure:
  - ICD10 Code (monospace, highlighted)
  - ICD9 Code(s) (monospace, secondary)
  - ELIXHAUSER Classification (badge/pill style)
- Alternating row backgrounds for readability
- Hover states for row selection

**Classification Badges:**
- Classified codes: Success color with subtle background
- "No clasificado": Warning color with subtle background
- Pill shape with py-1 px-3, rounded-full
- Small text (text-sm), medium weight

**Navigation:**
- Simple top bar with app title
- Mode toggle (dark/light) in top right
- No complex navigation needed

**Data Display:**
- Code typography: Monospace font, slightly larger
- Clear visual separation between columns
- Responsive table (stack on mobile)
- Sticky header on scroll

**Forms/Inputs:**
- Input fields: Border style, focus ring in primary color
- Consistent padding (py-3 px-4)
- Label above input pattern
- Placeholder text as examples

**Empty States:**
- Center-aligned messaging
- Icon representation (search icon)
- Helpful text ("Buscar un código ICD10...")

### E. Animations

**Minimal, Purposeful Motion:**
- Search input focus: Subtle border color transition (150ms)
- Dropdown appearance: Fade + slight slide (200ms)
- Row hover: Background color transition (100ms)
- No decorative animations

---

## Medical-Specific Considerations

**Professional Appearance:**
- Clean, sterile aesthetic reflecting medical environment
- High contrast for extended reading
- Monospace codes for precise identification
- Clear visual hierarchy for quick scanning

**Data Integrity Signals:**
- Distinct visual treatment for classified vs unclassified
- Clear code presentation preventing misreading
- Consistent formatting across all results

**Accessibility:**
- WCAG AA contrast ratios minimum
- Keyboard navigation fully supported
- Screen reader optimized labels
- Focus indicators clearly visible

**Workflow Optimization:**
- Search front and center
- Results immediately below search
- No pagination (lazy load on scroll)
- Quick visual scanning of classifications

---

## Images

**No Hero Image Required** - This is a utility application where functional efficiency takes precedence over visual storytelling.

**Icon Usage:**
- Heroicons for UI elements (search, clear, info)
- Medical-appropriate icons for categories if needed
- CDN: https://cdn.jsdelivr.net/npm/heroicons/...

---

## Responsive Behavior

**Desktop (lg+):**
- Full table view with all columns visible
- Generous spacing (p-8, gap-6)
- Search max-width for optimal focus

**Tablet (md):**
- Maintain table structure
- Reduce padding (p-6, gap-4)
- Slightly smaller typography scale

**Mobile (base):**
- Stack table to card layout
- Each result as a card showing all info vertically
- Search full width
- Compact spacing (p-4, gap-3)