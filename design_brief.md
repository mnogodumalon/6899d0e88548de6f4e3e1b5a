# Design Brief: Yoga Kurs Management

## 1. App Analysis

### What This App Does
This is a Yoga course management system ("Yoga Kurs Management") that handles three core areas: course administration (Kursverwaltung) with scheduling and locations, instructor assignment (Kursleiterzuordnung) linking teachers to courses, and participant registration (Teilnehmeranmeldung) where students sign up for courses. It's a complete studio management tool.

### Who Uses This
A yoga studio owner or administrator who manages multiple courses, instructors, and students. They're not technical — they need a clear overview of their studio operations and quick access to add new courses, assign instructors, and register participants.

### The ONE Thing Users Care About Most
**Upcoming courses and their status** — which courses are scheduled, who's teaching them, and how many participants are registered. The studio owner opens this dashboard to get an instant pulse on their studio's activity.

### Primary Actions (IMPORTANT!)
1. **Neuen Kurs erstellen** → Primary Action Button (most frequent: adding new yoga courses to the schedule)
2. Teilnehmer anmelden (register a participant for a course)
3. Kursleiter zuweisen (assign an instructor to a course)

---

## 2. What Makes This Design Distinctive

### Visual Identity
The design draws from the calm, grounded aesthetic of a yoga studio — a warm off-white background with a sage green accent that evokes natural tranquility. The typography uses DM Sans with its soft, rounded geometry that feels approachable yet professional. Cards use subtle warm shadows that create gentle depth without harshness, like light filtering through a studio window.

### Layout Strategy
- The hero element is a wide "Nächste Kurse" (upcoming courses) timeline section that spans the full width on desktop, giving an immediate sense of what's happening in the studio
- The layout is asymmetric on desktop: a dominant left column (65%) holds the hero course timeline and participant list, while a narrower right column (35%) shows quick stats and the instructor overview
- Visual interest comes from the contrast between the large, airy course cards and the compact stat badges above them
- Secondary elements (instructors, participants) use a denser, list-based format that contrasts with the spacious course cards

### Unique Element
The upcoming course cards feature a vertical sage-green accent bar on the left edge with the time displayed prominently, creating a timeline-like visual rhythm. When courses are happening today, the accent bar pulses subtly with a slightly brighter green, giving the dashboard a living, breathing quality.

---

## 3. Theme & Colors

### Font
- **Family:** DM Sans
- **URL:** `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,300&display=swap`
- **Why this font:** DM Sans has soft, rounded letterforms with a geometric foundation — it's warm and approachable (fitting yoga's calming nature) while remaining crisp and readable for data display. Its optical size axis allows excellent rendering at both large hero numbers and small detail text.

### Color Palette
All colors as complete hsl() functions:

| Purpose | Color | CSS Variable |
|---------|-------|--------------|
| Page background | `hsl(40 30% 97%)` | `--background` |
| Main text | `hsl(160 10% 15%)` | `--foreground` |
| Card background | `hsl(0 0% 100%)` | `--card` |
| Card text | `hsl(160 10% 15%)` | `--card-foreground` |
| Borders | `hsl(40 15% 90%)` | `--border` |
| Primary action | `hsl(153 40% 40%)` | `--primary` |
| Text on primary | `hsl(0 0% 100%)` | `--primary-foreground` |
| Accent highlight | `hsl(153 35% 92%)` | `--accent` |
| Muted background | `hsl(40 15% 95%)` | `--muted` |
| Muted text | `hsl(160 5% 50%)` | `--muted-foreground` |
| Success/positive | `hsl(153 50% 45%)` | (component use) |
| Error/negative | `hsl(0 65% 55%)` | `--destructive` |

### Why These Colors
The warm off-white background (`hsl(40 30% 97%)`) avoids clinical coldness and creates a welcoming, studio-like atmosphere. The sage green primary (`hsl(153 40% 40%)`) is deeply associated with wellness, nature, and balance — core yoga values. The muted green tones throughout create cohesion without monotony. Dark text uses a green-tinted near-black for harmony rather than pure black.

### Background Treatment
The page background is a warm cream off-white (`hsl(40 30% 97%)`) — not pure white, giving it warmth. Cards are pure white to create a subtle lift effect against the warm background. No gradients or patterns — the warmth comes from the color temperature itself.

---

## 4. Mobile Layout (Phone)

### Layout Approach
Mobile uses a single-column vertical flow. The hero section (upcoming courses) dominates the first viewport fold with large, touch-friendly course cards. Stats are presented as a compact horizontal scrolling row of badges rather than cards, preserving vertical space. Each section has clear typographic hierarchy with bold section headers.

### What Users See (Top to Bottom)

**Header:**
- App title "Yoga Studio" in DM Sans 700, 20px
- Right side: primary action button "Neuer Kurs" (pill shape, sage green, with + icon)

**Hero Section — Nächste Kurse (Upcoming Courses):**
- Takes approximately 50% of viewport height on load
- Section header "Nächste Kurse" in 16px/700 with a small calendar icon
- Course cards are stacked vertically, each ~100px tall
- Each card has: left sage-green accent bar (4px wide), course name (16px/700), date/time below (14px/300 muted), location as a subtle badge, instructor name in muted text
- Cards have 12px border-radius, white background, subtle shadow
- Maximum 3 visible initially; "Alle anzeigen" link if more exist
- Why hero: the studio owner's #1 question is "what's coming up?"

**Section 2: Studio-Übersicht (Quick Stats)**
- Horizontal scroll row of 3 compact stat badges
- Each badge: icon + number + label (e.g., "5 Kurse", "3 Leiter", "12 Teilnehmer")
- Background: muted green (`hsl(153 35% 92%)`), pill-shaped, inline
- These are NOT cards — they're compact inline badges that take one row

**Section 3: Teilnehmer (Participants)**
- Section header "Teilnehmer" with person icon, and a "+" button to add new participant
- Simple list of participant entries: "Vorname Nachname" (16px/500), email below (13px muted)
- Each row has edit (pencil) and delete (trash) icon buttons on the right
- Compact spacing, no cards — just rows with subtle bottom borders

**Section 4: Kursleiter (Instructors)**
- Section header "Kursleiter" with users icon, and a "+" button to add new instructor
- List of instructors: "Vorname Nachname" (16px/500), phone below (13px muted), assigned course as a small green badge
- Each row has edit and delete icon buttons
- Same compact list style as participants

**Bottom Navigation / Action:**
- No fixed bottom nav. The primary "Neuer Kurs" button is in the header (always accessible via scroll-to-top).

### Mobile-Specific Adaptations
- Course cards stack vertically (no side-by-side)
- Stats become horizontal scrolling badges instead of grid cards
- Tables become simple list rows with bottom borders
- Edit/delete actions are always visible as small icon buttons (no swipe gestures — simpler)

### Touch Targets
- All buttons minimum 44px touch target
- Course cards are fully tappable for drill-down to detail view
- Edit/delete icons have 40px tap zones with padding

### Interactive Elements
- Tapping a course card opens a detail dialog showing full description, schedule, location, assigned instructor, and registered participants
- Tapping a participant name shows their registered courses

---

## 5. Desktop Layout

### Overall Structure
Two-column asymmetric layout with 65%/35% split:
- **Left column (65%):** Hero course timeline + Participant management
- **Right column (35%):** Quick stats (stacked vertically) + Instructor management

The eye flows: top-left stats row → hero course list (left) → instructor panel (right) → participants (bottom left).

A full-width header spans both columns with the app title and primary action.

### Section Layout

**Header (full width):**
- Left: "Yoga Studio" title (24px/700) + subtitle "Kurs Management" (14px/300 muted)
- Right: Primary action button "Neuen Kurs erstellen" (sage green, with + icon, pill shape)

**Top area — Stats Row (full width, above columns):**
- 3 stat cards in a row, equal width
- Each card: white background, subtle shadow, icon top-left (muted green), large number (32px/700), label below (14px/300 muted)
- Stats: "Aktive Kurse" (count of courses), "Kursleiter" (count of instructors), "Teilnehmer" (count of participants)

**Left Column (65%):**
- **Nächste Kurse** section with header and course cards
- Course cards arranged vertically with the sage-green left accent bar
- Each card shows: course name, date/time, location badge, instructor name, participant count badge
- Below: **Teilnehmer** section — a clean table with columns: Name, E-Mail, Angemeldete Kurse, Aktionen (edit/delete)

**Right Column (35%):**
- **Kursleiter** section — card-based list of instructors
- Each instructor card: name (16px/700), phone (14px muted), assigned course badge
- Edit/delete buttons on each card
- Below: any additional context or empty space for breathing room

### What Appears on Hover
- Course cards: slight shadow elevation increase, cursor pointer
- Table rows: light muted background highlight
- Edit/delete buttons: background highlight on hover
- Stat cards: subtle scale(1.02) transform

### Clickable/Interactive Areas
- Course cards → open detail dialog with full course info, instructor, and participant list
- Participant name in table → shows participant detail dialog with their registered courses
- Instructor cards → shows detail with their assigned course info

---

## 6. Components

### Hero KPI
The hero is NOT a single KPI number — it's the **Upcoming Courses list** that dominates the view.

- **Title:** Nächste Kurse
- **Data source:** Kursverwaltung app, sorted by `kurs_zeitplan` ascending (soonest first)
- **Calculation:** Filter courses where `kurs_zeitplan` is today or in the future; show all if none upcoming
- **Display:** Vertical card list with sage-green accent bars, each card showing course name, datetime, location, and linked instructor
- **Context shown:** Instructor name (resolved from Kursleiterzuordnung via applookup), participant count
- **Why this is the hero:** The studio owner's primary concern is always "what's happening next?" — the upcoming schedule drives all other decisions

### Secondary KPIs

**Aktive Kurse**
- Source: Kursverwaltung
- Calculation: Count of all course records
- Format: number
- Display: Stat card with calendar icon, large number, "Aktive Kurse" label

**Kursleiter**
- Source: Kursleiterzuordnung
- Calculation: Count of all instructor records
- Format: number
- Display: Stat card with users icon, large number, "Kursleiter" label

**Teilnehmer**
- Source: Teilnehmeranmeldung
- Calculation: Count of all participant records
- Format: number
- Display: Stat card with user-plus icon, large number, "Teilnehmer" label

### Chart
No chart is needed for this dashboard. The data is categorical (courses, instructors, participants) rather than time-series. The course timeline cards serve as the visual anchor instead. A chart would add complexity without providing meaningful insight for a yoga studio manager.

### Lists/Tables

**Nächste Kurse (Course List)**
- Purpose: Show what's happening in the studio — the core of the dashboard
- Source: Kursverwaltung, enriched with Kursleiterzuordnung data
- Fields shown: kurs_name, kurs_zeitplan (formatted), kurs_ort, linked instructor name, participant count
- Mobile style: stacked cards with accent bar
- Desktop style: stacked cards with accent bar (same treatment, wider)
- Sort: By kurs_zeitplan ascending (soonest first)
- Limit: Show all courses

**Teilnehmer (Participant Table/List)**
- Purpose: Manage participant registrations
- Source: Teilnehmeranmeldung
- Fields shown: teilnehmer_vorname + teilnehmer_nachname (combined as "Name"), teilnehmer_email, angemeldete_kurse (resolved to course names)
- Mobile style: simple list rows
- Desktop style: table with columns
- Sort: By nachname alphabetically
- Limit: Show all

**Kursleiter (Instructor List)**
- Purpose: See and manage instructor assignments
- Source: Kursleiterzuordnung
- Fields shown: kursleiter_vorname + kursleiter_nachname (combined), kursleiter_kontakt, zugewiesener_kurs (resolved to course name)
- Mobile style: simple list rows
- Desktop style: card list in right column
- Sort: By nachname alphabetically
- Limit: Show all

### Primary Action Button (REQUIRED!)

- **Label:** "Neuen Kurs erstellen" (desktop) / "Neuer Kurs" (mobile)
- **Action:** add_record
- **Target app:** Kursverwaltung
- **What data:** Form with fields: Kursname (text input, required), Kursbeschreibung (textarea), Zeitplan (datetime-local input, required — format as YYYY-MM-DDTHH:MM), Ort (text input)
- **Mobile position:** header (top-right, pill button)
- **Desktop position:** header (top-right, pill button)
- **Why this action:** Creating new courses is the most frequent administrative task — the schedule is the foundation everything else builds on

### CRUD Operations Per App (REQUIRED!)

**Kursverwaltung (Course Management) CRUD Operations**

- **Create (Erstellen):**
  - Trigger: Primary action button "Neuen Kurs erstellen" in header
  - Form fields: Kursname (text, required), Kursbeschreibung (textarea), Zeitplan (datetime-local — store as YYYY-MM-DDTHH:MM, required), Ort (text)
  - Form style: Dialog/Modal
  - Required fields: Kursname, Zeitplan
  - Default values: Zeitplan defaults to tomorrow at 10:00

- **Read (Anzeigen):**
  - List view: Course cards with accent bar in hero section
  - Detail view: Click card → Dialog showing all fields + assigned instructor + registered participants list
  - Fields shown in list: kurs_name, kurs_zeitplan, kurs_ort, instructor name, participant count
  - Fields shown in detail: All fields + instructor + participants
  - Sort: By kurs_zeitplan ascending
  - Filter/Search: No filter needed (typically few courses)

- **Update (Bearbeiten):**
  - Trigger: Edit (pencil) icon button in course detail dialog
  - Edit style: Same dialog as Create but pre-filled with current values
  - Editable fields: All fields (kurs_name, kurs_beschreibung, kurs_zeitplan, kurs_ort)

- **Delete (Löschen):**
  - Trigger: Delete (trash) icon button in course detail dialog
  - Confirmation: AlertDialog with warning
  - Confirmation text: "Möchtest du den Kurs '{kurs_name}' wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden."

**Teilnehmeranmeldung (Participant Registration) CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button next to "Teilnehmer" section header
  - Form fields: Vorname (text, required), Nachname (text, required), E-Mail (email), Angemeldete Kurse (multi-select of available courses from Kursverwaltung)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Table rows (desktop) / list items (mobile)
  - Detail view: Click participant name → Dialog showing all fields + listed course names
  - Fields shown in list: Full name, email, course count badge
  - Fields shown in detail: All fields with course names resolved
  - Sort: By nachname alphabetically
  - Filter/Search: No filter (simple list)

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button on each row
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash icon button on each row
  - Confirmation: AlertDialog
  - Confirmation text: "Möchtest du die Anmeldung von '{vorname} {nachname}' wirklich löschen?"

**Kursleiterzuordnung (Instructor Assignment) CRUD Operations**

- **Create (Erstellen):**
  - Trigger: "+" button next to "Kursleiter" section header
  - Form fields: Vorname (text, required), Nachname (text, required), Kontakt (tel), Zugewiesener Kurs (select dropdown of courses from Kursverwaltung)
  - Form style: Dialog/Modal
  - Required fields: Vorname, Nachname
  - Default values: None

- **Read (Anzeigen):**
  - List view: Cards (desktop right column) / list items (mobile)
  - Detail view: Click instructor → Dialog with all fields + assigned course details
  - Fields shown in list: Full name, phone, assigned course badge
  - Fields shown in detail: All fields + full course info
  - Sort: By nachname alphabetically
  - Filter/Search: No filter

- **Update (Bearbeiten):**
  - Trigger: Pencil icon button on each card/row
  - Edit style: Same dialog as Create, pre-filled
  - Editable fields: All fields

- **Delete (Löschen):**
  - Trigger: Trash icon button on each card/row
  - Confirmation: AlertDialog
  - Confirmation text: "Möchtest du die Zuordnung von '{vorname} {nachname}' wirklich löschen?"

---

## 7. Visual Details

### Border Radius
Rounded (12px for cards, 8px for buttons, 20px for pill buttons and badges)

### Shadows
Subtle — `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` for cards at rest. On hover: `0 4px 12px rgba(0,0,0,0.08)`. No harsh drop shadows.

### Spacing
Spacious — 24px between major sections, 16px between cards, 12px internal card padding on mobile, 20px on desktop. The breathing room reinforces the calm yoga aesthetic.

### Animations
- **Page load:** Subtle stagger fade-in — cards appear one by one with 50ms delay, opacity 0→1 and translateY 8px→0
- **Hover effects:** Cards lift slightly with shadow increase (200ms ease). Buttons darken slightly.
- **Tap feedback:** Buttons scale to 0.97 on active state (100ms)

---

## 8. CSS Variables (Copy Exactly!)

The implementer MUST copy these values exactly into `src/index.css`:

```css
:root {
  --radius: 0.75rem;
  --background: hsl(40 30% 97%);
  --foreground: hsl(160 10% 15%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(160 10% 15%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(160 10% 15%);
  --primary: hsl(153 40% 40%);
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(153 20% 95%);
  --secondary-foreground: hsl(153 40% 30%);
  --muted: hsl(40 15% 95%);
  --muted-foreground: hsl(160 5% 50%);
  --accent: hsl(153 35% 92%);
  --accent-foreground: hsl(153 40% 25%);
  --destructive: hsl(0 65% 55%);
  --border: hsl(40 15% 90%);
  --input: hsl(40 15% 90%);
  --ring: hsl(153 40% 40%);
  --chart-1: hsl(153 40% 40%);
  --chart-2: hsl(153 50% 55%);
  --chart-3: hsl(40 40% 65%);
  --chart-4: hsl(200 40% 55%);
  --chart-5: hsl(280 30% 60%);
  --sidebar: hsl(40 20% 96%);
  --sidebar-foreground: hsl(160 10% 15%);
  --sidebar-primary: hsl(153 40% 40%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(153 35% 92%);
  --sidebar-accent-foreground: hsl(153 40% 25%);
  --sidebar-border: hsl(40 15% 90%);
  --sidebar-ring: hsl(153 40% 40%);
}
```

---

## 9. Implementation Checklist

The implementer should verify:
- [ ] Font loaded from URL above (DM Sans with weights 300, 500, 700)
- [ ] All CSS variables copied exactly from Section 8
- [ ] Mobile layout matches Section 4 (single column, hero courses, horizontal stat badges, list rows)
- [ ] Desktop layout matches Section 5 (65/35 split, course hero left, instructors right)
- [ ] Hero element (course timeline) is prominent as described
- [ ] Colors create the warm, calm sage-green mood described in Section 2
- [ ] CRUD patterns are consistent across all 3 apps (same dialog style, same button placement)
- [ ] Delete confirmations are in place for all 3 apps
- [ ] Course cards have the distinctive left sage-green accent bar
- [ ] Stats show real counts from API data
- [ ] Instructor names are resolved on course cards via applookup
- [ ] Participant course names are resolved via multipleapplookup
