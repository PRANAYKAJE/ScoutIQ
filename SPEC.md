# ScoutIQ - VC Intelligence & Company Discovery Platform

## 1. Project Overview

**Project Name:** ScoutIQ  
**Project Type:** Full-stack Web Application (MVP)  
**Core Functionality:** A VC intelligence platform for discovering companies, enriching them with AI-powered insights, and organizing them into curated lists.  
**Target Users:** Venture capital investors, analysts, and scouts looking to discover and track potential portfolio companies.

---

## 2. UI/UX Specification

### Layout Structure

**App Shell:**
- Fixed left sidebar (280px width) - collapsible on mobile
- Top header bar (64px height) with global search
- Main content area with max-width 1400px, centered
- Responsive: sidebar becomes drawer on < 768px

**Pages:**
1. `/companies` - Company discovery list
2. `/companies/[id]` - Company detail/enrichment
3. `/lists` - List management
4. `/saved` - Saved searches

### Visual Design

**Color Palette:**
- Background: `#0A0A0B` (near-black)
- Surface: `#141416` (card backgrounds)
- Surface Elevated: `#1C1C1F` (hover states)
- Border: `#27272A` (subtle borders)
- Primary: `#10B981` (emerald green - trust/growth)
- Primary Hover: `#059669`
- Accent: `#F59E0B` (amber - for signals/highlights)
- Text Primary: `#FAFAFA`
- Text Secondary: `#A1A1AA`
- Text Muted: `#71717A`
- Error: `#EF4444`
- Success: `#22C55E`

**Typography:**
- Font Family: `Inter` (headings), `DM Sans` (body)
- H1: 32px / 700 weight / -0.02em tracking
- H2: 24px / 600 weight / -0.01em tracking
- H3: 18px / 600 weight
- Body: 14px / 400 weight / 1.5 line-height
- Small: 12px / 400 weight
- Monospace: `JetBrains Mono` for domains/IDs

**Spacing System:**
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

**Visual Effects:**
- Cards: 1px border with `#27272A`, 8px border-radius
- Shadows: `0 4px 24px rgba(0,0,0,0.4)` for modals/dropdowns
- Transitions: 150ms ease for all interactive elements
- Glassmorphism on sidebar: `backdrop-blur-xl bg-opacity-80`

### Components

**Sidebar:**
- Logo at top (ScoutIQ with emerald accent)
- Navigation items with icons
- Active state: emerald left border, subtle background
- Hover: background `#1C1C1F`

**Company Table:**
- Sticky header
- Row hover: background `#1C1C1F`
- Columns: Name, Domain, Industry, Actions
- Sortable columns with indicator
- Pagination at bottom

**Search Bar:**
- Full-width in header
- Icon prefix
- Placeholder: "Search companies, industries..."
- Debounced input (300ms)

**Enrichment Card:**
- Loading skeleton with shimmer animation
- Success: emerald checkmark, expanded data
- Error: red border, retry button

**Buttons:**
- Primary: emerald bg, white text, 8px radius
- Secondary: transparent, border, white text
- Ghost: no border, text only
- Sizes: sm (32px), md (40px), lg (48px)

**Input Fields:**
- Dark background `#1C1C1F`
- Border `#27272A`
- Focus: emerald border
- 8px radius

---

## 3. Functionality Specification

### Core Features

**Company Discovery (`/companies`):**
- Display 15 mock companies in paginated table (10 per page)
- Search by name, domain, or description (client-side)
- Filter by industry dropdown
- Sort by name (A-Z, Z-A), industry
- Pagination: prev/next buttons, page indicator

**Company Profile (`/companies/[id]`):**
- Show company details from mock data
- Notes section: textarea, auto-save to localStorage on blur
- Save to list: dropdown to select existing list or create new
- Signals section: placeholder with "Coming soon"
- **ENRICHMENT BUTTON**: triggers AI enrichment flow

**Enrichment Flow:**
1. User clicks "Enrich" button
2. Button shows loading spinner, disables
3. POST request to `/api/enrich` with company domain
4. Backend:
   - Fetches website HTML (homepage)
   - Extracts text content
   - Sends to AI (Gemini or OpenAI) with structured prompt
   - Returns JSON with: summary, what_they_do, keywords, signals, sources, timestamp
5. Frontend:
   - Shows loading state during API call
   - On success: displays enriched data in expandable card
   - On error: shows error message with retry option
6. Enriched data stored in localStorage (cache)

**Lists (`/lists`):**
- Create new list: name input, create button
- View all lists with company count
- Click list to see companies in it
- Add company to list from profile page
- Remove company from list
- Export list as JSON or CSV (download)
- Delete list (with confirmation)

**Saved Searches (`/saved`):**
- Save current search state (query, filters, sort)
- Name the saved search
- Re-run saved search (applies filters to /companies)
- Delete saved search
- Store in localStorage

### Data Handling

**localStorage Keys:**
- `scoutiq_notes_{companyId}`: string
- `scoutiq_lists`: JSON array of list objects
- `scoutiq_saved_searches`: JSON array of search objects
- `scoutiq_enrichments_{domain}`: JSON object (cached enrichment)

**Mock Data (15 companies):**
```json
{
  "id": "string",
  "name": "string",
  "domain": "string",
  "industry": "string",
  "description": "string"
}
```

### Edge Cases

- Empty states for: no companies, no lists, no saved searches
- Network error handling for enrichment API
- Rate limiting consideration for AI API
- Graceful degradation if localStorage unavailable

---

## 4. Technical Architecture

### Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Server-side API routes
- localStorage for persistence

### API Routes
- `POST /api/enrich` - AI-powered company enrichment

### Environment Variables
- `GEMINI_API_KEY` or `OPENAI_API_KEY` - AI provider

---

## 5. Acceptance Criteria

### Visual Checkpoints
- [ ] Dark theme applied consistently
- [ ] Sidebar navigation functional with active states
- [ ] Company table displays with sorting indicators
- [ ] Search input has proper debouncing
- [ ] Loading states show skeleton animations
- [ ] Error states display clearly with retry options

### Functional Checkpoints
- [ ] Can browse companies with pagination
- [ ] Can search and filter companies
- [ ] Can view company detail page
- [ ] Can add/edit notes (persisted in localStorage)
- [ ] Can click "Enrich" and see AI-generated data
- [ ] Can create, view, and delete lists
- [ ] Can add companies to lists
- [ ] Can save and re-run searches
- [ ] Can export lists as JSON/CSV

### Performance
- [ ] Page loads under 2 seconds
- [ ] No layout shift during loading
- [ ] Smooth transitions (no jank)

---

## 6. Priority Order

1. **API enrichment working** - Critical path
2. **Company profile page** - Core feature
3. **Companies list** - Discovery engine
4. **Lists + saved** - Organization features
5. **UI polish** - Production feel
