# Changelog

All notable changes to Rune Of The Day are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

## [1.2.0] - 2026-06-26

### Fixed

- **Notification daily trigger could fire a day early.** When the app was
  opened before the daily reset time (e.g., 5 AM with a 6 AM reset), the
  `DAILY` trigger would fire *today* instead of tomorrow, delivering the
  wrong rune a full day early. The scheduler now detects this case and
  falls back to a one-time `TIME_INTERVAL` notification for the first
  fire, re-establishing the daily repeat on the next app open after the
  reset has passed.
- **Loading screen no longer flashes white in dark mode.** The splash
  screen was hardcoded to `#ffffff` with a black spinner. It now respects
  the active theme and uses the gold accent color for the activity
  indicator.
- **404 screen was unstyled and didn't respect theme.** The not-found
  screen used inline styles with no theme awareness. It now features a
  large Algiz (ᛉ) rune glyph, themed background/text, and a gold "Go
  Home" pill button via `StyleSheet.create`.

### Added

- **Norse-inspired color palette.** Both light and dark themes have been
  redesigned with warm gold accents (`#B8860B` / `#D4A857`), deep
  charcoal backgrounds (`#0D1117`), and parchment surfaces (`#F0EDE5`).
  A new `border` color property separates card borders from the muted
  `icon` text color, and a new `accent` property provides the gold for
  headings and highlights.
- **Centralized animation system** (`app/constants/animations.ts`).
  Shared duration constants (`DURATION_QUICK` 150ms,
  `DURATION_STANDARD` 220ms, `DURATION_ENTRANCE` 280ms), easing curves
  (`easeOut`, `easeInOut`), spring configs (`popSpring`,
  `gentleSpring`), stagger delay (35ms), and preset helpers (`fadeInUp`,
  `fadeIn`) ensure every screen feels consistent.
- **Daily rune entrance animation.** The rune symbol on the Today screen
  now fades in with a gentle spring scale (0.85 → 1.0) when it loads,
  and re-animates when the rune changes (e.g., new day).
- **Tab button press animation.** Tab bar buttons now scale down to 0.9
  on press and spring back on release, giving tactile feedback.
- **Flashcard scale "pop" transition.** Card swaps now use a quick
  fade + shrink (150ms) followed by a fade + spring scale back (220ms),
  replacing the previous flat 400ms linear fade.
- **Rune detail slide-up entrance.** The detail screen now fades in
  with a subtle 12px upward slide (280ms, `easeOut`) instead of a
  400ms linear opacity-only fade.
- **Redesigned landing page** (`docs/index.html`). Complete rewrite with
  a dark Norse-inspired theme matching the app: Cinzel/Inter typography,
  hero with rune watermark, 6-card feature grid, "How It Works" steps,
  Elder Futhark about section with sample runes, and a 6-item FAQ
  accordion. App Store button shows "Coming Soon"; Google Play button
  shows "Early Access".
- **Expanded privacy policy** (`docs/privacy.html`). Redesigned to match
  the landing page aesthetic. Added a "Short Version" TL;DR callout,
  detailed list of all 4 stored data items, new Notifications and
  Permissions sections, and a contact card. Updated date to June 2026.

### Changed

- **Rune list entrance is snappier.** Duration reduced from 300ms to
  220ms, stagger delay from 50ms to 35ms (24-item list finishes in
  ~840ms vs ~1.5s), slide distance from 20px to 12px, and easing
  changed from linear to `easeOut`.
- **Rune detail push transition** duration increased from 200ms to 250ms
  to feel natural alongside the content slide-up animation.
- **Tab bar** now has a 1px top border using the dedicated `border`
  color, and the header gets a bottom border for visual separation.
  Header title gets `letterSpacing: 1` for a refined feel.
- **All section titles** across every screen now use the gold `accent`
  color instead of the plain text color.
- **All card borders** across every screen now use the dedicated `border`
  color instead of reusing the muted `icon` color.
- **Rune symbols** on the Today screen, runes list, flashcards, and
  detail screen now render in gold accent with a subtle text-shadow
  glow on the main hero symbol.
- **Tab bar hides on keyboard** via `tabBarHideOnKeyboard: true`.

### Developer

- Added `app/constants/animations.ts` with shared timing/easing/spring
  constants and preset animation helpers.
- Added `border` and `accent` properties to both light and dark color
  themes in `Colors.ts`.
- Updated `useRuneOfTheDay` tests to assert the notification announces
  the fire-date rune (tomorrow) rather than today's rune.
- 94 tests pass, 0 type errors, 0 lint warnings.

## [1.1.0] - 2026-06-25

### Fixed

- **Daily rune notification no longer shows yesterday's rune.** The
  notification was scheduled at app-open time with the rune's text locked
  in at that moment, so by the time it fired the next morning the content
  was always a day behind. The rune is now derived from a deterministic
  daily seed keyed off the local date, so the notification body always
  matches the rune shown in the app on tap.
- **Local date handling** in the daily rune pick. The previous code mixed
  UTC and local time when computing the "logical day", which could let
  the rune flip a few hours early or late near midnight. A new
  `getLocalDateKey()` helper uses local year/month/day consistently.
- **Layout clipping on notched and home-indicator devices.** Every screen
  now respects device safe areas (notch, status bar, home indicator,
  landscape insets) via `react-native-safe-area-context`. Previously,
  content could sit under the notch on iPhones and under the home
  indicator on iPhone X+.

### Added

- **Configurable notification time** in Settings. Pick when the daily
  rune unlocks — 5:00, 5:15, 5:30, … up to 9:45. Defaults to 6:00 AM.
- **Themed status bar** that follows light/dark theme.
- **Stable per-day rune selection.** Same date always yields the same
  rune and reversed state, so the notification and the in-app view can
  never disagree.

### Changed

- **Tab bar height** is now derived from the bottom safe-area inset
  instead of a hardcoded 75px, fixing overlap with the home indicator.
- **Flashcard screen** uses `useWindowDimensions` instead of a
  module-level `Dimensions.get('window')` snapshot, so the card
  re-sizes on rotation or split-screen.
- **Card list (Runes tab)** adds bottom padding to clear the tab bar
  so the last item is never obscured.

### Developer

- Added `app/utils/dateKey.ts` and `app/utils/seededRandom.ts` helpers.
- Test suite grew from 83 to 94 tests, covering the deterministic pick,
  the time picker, and the new settings persistence.
- 0 lint warnings, 0 type errors.

## [1.0.0] - 2026-06-23

### Initial release.

- Daily Elder Futhark rune with primary, additional, and reversed meanings.
- Learn tab with flip-card flashcards for all runes.
- Daily notifications, haptics, and dark/light/system theme support.
