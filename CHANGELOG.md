# Changelog

All notable changes to Rune Of The Day are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/).

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
