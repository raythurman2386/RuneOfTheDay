# Roadmap for Rune of the Day

This roadmap tracks the development progress of the "Rune of the Day" app, detailing completed tasks and future plans across bug fixes, technical debt, new features, polish, and infrastructure.

---

## Bug Fixes (High Priority)

Fix these before working on new features.

- [ ] **Fix re-render cascade** — `useNotifications` returns a non-memoized object, causing `useRuneOfTheDay`'s effects and 15-min interval to re-run on every parent render. Memoize the hook's return value with `useCallback`/`useMemo`.
  - `app/hooks/useNotifications.ts:249-255` (return object)
  - `app/hooks/useRuneOfTheDay.ts:157-186` (effects re-run)
- [ ] **Move `setNotificationHandler` off module top-level** — called at import time (`useNotifications.ts:8-16`), mutating global notification behavior even in tests. Move inside the hook or guard with a ref.
- [ ] **Move `TabButton` outside component body** — `(tabs)/_layout.tsx:23-32` defines `TabButton` inside `TabLayout`, creating a new component type each render. Tab buttons unmount/remount every render, losing state and replaying animations.
- [ ] **Memoize `SettingsContext` provider value** — `SettingsContext.tsx:87-96` creates a fresh value object every render, re-rendering all `useSettings()` consumers on any state change. Wrap in `useMemo`.
- [ ] **Fix `Animated.Value` created in render body** — `rune/[id].tsx:26` calls `new Animated.Value(0)` directly in render, creating a new value each render. Use `useRef` or `useState`.
- [ ] **Fix double haptic + double navigation on settings tap** — `(tabs)/_layout.tsx:62-71` wraps `SettingsIcon` in a `Pressable` that fires haptics + navigates, but `SettingsIcon.tsx:14-17` _also_ fires haptics + navigates internally. Remove the redundant wrapper or the internal navigation.
- [ ] **Clean up `setTimeout` in `FlashcardScreen`** — `FlashcardScreen.tsx:42` fires `setCurrentIndex` after unmount if user navigates away mid-transition. Store timer ref and clear in cleanup.
- [ ] **Validate AsyncStorage data shape/index bounds** — `useRuneOfTheDay.ts:103,110` parses `StoredData` without validating that `index` is within `runes` bounds. `SettingsContext.tsx:50` casts stored theme string without validation. Add runtime checks.

---

## Technical Debt (Medium Priority)

Address alongside or after bug fixes, before new features.

- [ ] **Extract shared `Card`/`Section` component** — shadow/card styling duplicated across 5 files (`runes.tsx:160-170`, `MainScreen.tsx:178-188`, `FlashcardScreen.tsx:258-268`, `rune/[id].tsx:342-352`, `settings.tsx:236-246`).
- [ ] **Extract `DeitiesList` component** — "Associated Deities" rendering duplicated across 4 screens (`MainScreen.tsx:90-105`, `runes.tsx:93-98`, `FlashcardScreen.tsx:146-165`, `rune/[id].tsx:162-177`).
- [ ] **Extract `DetailSection` component** — `rune/[id].tsx:85-300` repeats the same `<View><Text title/><Text content/></View>` pattern ~10 times. Collapses ~215 lines into ~40.
- [ ] **Remove dead dependency `@bittingz/expo-widgets`** — installed in `package.json:56` but never imported, no plugin registered in `app.json`, no widget source files. Remove until the widget feature is actually built.
- [ ] **Remove dead asset `SpaceMono-Regular.ttf`** — present in `assets/fonts/` but never loaded or referenced.
- [ ] **Wire up or remove notification icon assets** — `notification-icon.png`/`@2x.png` generated but not referenced in `app.json` or notification content code.
- [ ] **Replace duplicate `Rune` interface** — `runes.tsx:16-26` re-declares a partial `Rune` type that diverges from the canonical `Rune` in `data/runes.ts:1-27`. Import the real type.
- [ ] **Remove `any` types** — `runes.tsx:32` (`colors: any`), `(tabs)/_layout.tsx:10-11` (`onPress?: (e: any) => void`, `[key: string]: any`).
- [ ] **Add top-level Error Boundary** — no `ErrorBoundary` or `componentDidCatch` anywhere. Render crashes show a white screen.
- [ ] **Gate `console.log` behind `__DEV__`** — 17 debug `console.log` statements in `useNotifications.ts:127,144,156,173,191,232`, 7 `console.error` in `useRuneOfTheDay.ts`. Remove debug leftovers or route through a centralized logger.
- [ ] **Extract magic numbers to constants** — 6 AM reset hour (`useRuneOfTheDay.ts:37,74`), 15-min interval (`:166`), 150ms sleep (`useNotifications.ts:178`), animation durations (`runes.tsx:43-44`, `FlashcardScreen.tsx:31-32`), tab bar dimensions (`(tabs)/_layout.tsx:42`).
- [ ] **Fix loading screen to respect theme** — `_layout.tsx:24,27` hardcodes `#ffffff` background and `#000000` spinner. Dark-mode users see a white flash on startup.
- [ ] **Remove fragile 150ms sleep workaround** — `useNotifications.ts:178` uses an arbitrary `setTimeout` before verifying scheduled notifications. Poll or rely on the API's resolved promise.
- [ ] **Remove or populate dead schema** — `associations.plants/stones/rituals` declared in `runes.ts:15-17` but never populated in `runes.json` or rendered. Either remove the fields or populate the data.
- [ ] **Memoize `useHaptics` return functions** — `useHaptics.ts:9-41` returns fresh closures every render, invalidating downstream `useCallback` deps (e.g. `runes.tsx:118`). Wrap with `useCallback`.
- [ ] **Standardize hook export style** — `useColorTheme.ts:26-27` exports both named + default; other hooks export default only. Pick one convention.
- [ ] **Memoize `useColorTheme`** — `Appearance.addChangeListener` callback and `effectiveTheme` derivation could benefit from `useCallback`/`useMemo`.

---

## New Features

Prioritized by user interest and impact.

- [ ] **Share runes** — Add a Share button to the Today screen and rune detail screen using `expo-sharing` or `Share` API. Share the rune symbol, name, and meaning as text/image.
- [ ] **Streaks/engagement** — Track daily visits with a streak counter. Show a visual indicator (flame icon + count) on the Today screen. Persist streak data in AsyncStorage. Reset if a day is missed.
- [ ] **Notification time picker** — Add a setting to let users choose their daily notification time instead of the hardcoded 6 AM. Store in `SettingsContext` and use in `useRuneOfTheDay.ts:74`.
- [ ] **Flashcard improvements** — Add shuffle mode, reversed meanings (currently only upright), and a "mark as known" flag for basic spaced repetition. Show reversed rune visual when applicable.
- [ ] **Onboarding flow** — First-run guide explaining: what runes are, what reversed means, how the daily rune works, and app features. Detect first launch via AsyncStorage flag. 3-4 swipeable intro slides.
- [ ] **Daily rune history** — Store past daily runes in an array in AsyncStorage (date, index, isReversed). Add a History view (accessible from Today screen) showing past runes with dates. Limit to last 30 days.
- [ ] **Favorites/bookmarks** — Let users star/favorite runes. Store favorite rune names in AsyncStorage. Add a Favorites filter in the Runes list or a dedicated view.
- [ ] **"View full details" link from Today screen** — Add a button/link on the Today screen that navigates to `rune/[id]` for the current daily rune, so users can access the rich detail without switching tabs.
- [ ] **Notification deep-link to specific rune** — `_layout.tsx:92-103` ignores the notification payload and always navigates to Today root. Read the rune identifier from the notification data and deep-link to `rune/[id]`.
- [ ] **Quiz mode** — Multiple choice questions about rune meanings, matching runes to names/meanings, track user progress and show mastery level.
- [ ] **Localization/i18n** — Add `expo-localization` + i18n library. Extract all hardcoded UI strings (tab titles, section labels, button text, notification text) into translation files.
- [ ] **Widget support** — Android home screen widget showing today's rune. Requires real implementation: register `@bittingz/expo-widgets` plugin in `app.json`, write widget source, update daily via background task or scheduled notification.
- [ ] **Backend integration** — User profiles with favorite runes, daily rune history sync, community interpretations. Requires backend service (out of scope for offline-first phase).
- [ ] **In-app sound** — Add subtle sound effects (flip, reveal) with a settings toggle. Requires `expo-av` dependency and sound assets.

---

## Polish

- [ ] **Responsiveness across screen sizes and orientations** — Test and adjust layouts for tablets, landscape mode. Currently `orientation: "portrait"` locked.
- [ ] **Custom rune-inspired tab bar icons** — Current tab icons use raw rune glyphs. Enhance with custom styled icons or refined typography.
- [ ] **Accessibility: complete labeling** — Add `accessibilityHint` to all interactive elements. Label the haptics `Switch` in settings (`settings.tsx:166`). Add `accessibilityLabel`/`accessibilityRole` to flashcard nav buttons (`FlashcardScreen.tsx:187,204`) and the main rune `Pressable` (`MainScreen.tsx:50`).
- [ ] **Remove inline styles from `LoadingScreen` and `+not-found`** — Extract to `StyleSheet.create` for consistency.
- [ ] **Notifications styled and consistent** — Ensure notification icon, color, and channel are properly configured across all notification types.
- [ ] **README sync with actual architecture** — README references `App.tsx`, `src/data/`, `useTheme` hook, `@react-navigation/native` — none of which exist. Update to reflect Expo Router, `app/` directory, actual hooks, and current structure.

---

## Infrastructure

- [ ] **CI workflow for test + lint + typecheck** — Currently only `format` runs on push to main. Add jobs for `npm test`, `npm run lint`, `npm run typecheck`.
- [ ] **Upgrade `actions/checkout` v2 → v4** — `.github/workflows/format.yml:12` uses deprecated v2.
- [ ] **Add tests for untested files:**
  - `app/hooks/useNotifications.ts` — most complex hook, 258 lines, no test
  - `app/screens/FlashcardScreen.tsx` — 339 lines, no test
  - `app/rune/[id].tsx` — 368 lines, no test (route param handling, not-found branch)
  - `app/(modals)/settings.tsx` — 283 lines, no test (theme switching, haptics toggle, notifications toggle)
  - `app/(tabs)/runes.tsx` — FlatList, navigation, animations
  - `app/contexts/SettingsContext.tsx` — provider load/save, error paths
- [ ] **Verify AsyncStorage persistence across platforms** — Confirm data survives app restarts on iOS and Android.
- [ ] **Cross-platform testing (iOS, Android, web)** — Verify all features work on each platform.
- [ ] **Documentation: inline comments, hook/component docs, user guide** — Document custom hooks, components, and create a user guide for app features.
- [ ] **Configure build process** — Generate and secure Android keystore, set up iOS certificates and provisioning profiles.

---

## Completed

These items are done and preserved for progress tracking.

### Core Features (Completed)

- [x] Initialize Expo project with TypeScript
- [x] Define rune data (symbols, names, meanings, deities) in `app/data/`
- [x] Implement daily rune selection with `AsyncStorage` to persist the daily choice
- [x] Add custom font support for rune symbols
- [x] Build the main screen to show the daily rune
- [x] Set up tab navigation using Expo Router
- [x] Create a rune list screen with all 24 Elder Futhark runes
- [x] Develop a flashcard screen with flip functionality
- [x] Enable light/dark mode theming with a custom hook
- [x] Add haptic feedback for enhanced user interaction (success, medium, light, platform-safe)
- [x] Display associated deities for each rune across all screens
- [x] Refactor to use Expo Router (file-based routing, tab navigation, dynamic routes, transitions, testing)
- [x] Add notifications for daily rune selection

### App Store Preparation (Completed)

- [x] Set up GitHub Pages for privacy policy and app landing page
- [x] Create comprehensive privacy policy
- [x] Generate app store screenshots for all required sizes
- [x] Create compelling app store descriptions
- [x] Complete app store listing assets (feature graphic, promo video, app icon)
- [x] Set up EAS build configuration
- [x] Configure environment variables

### Styling (Completed)

- [x] Polish the UI for a cohesive design (standardized typography, colors, spacing)
- [x] Add smooth animations (flashcard flips, screen transitions)

### Testing (Completed)

- [x] Write unit tests for key logic (daily rune selection consistency)
- [x] Validate theme switching and style consistency

### Debugging (Completed)

- [x] Fix navigation container nesting issue causing render errors
- [x] Troubleshoot font loading/rendering glitches on some devices
- [x] Optimize performance for faster navigation and animations

### Future Enhancements (Completed)

- [x] Add a settings screen (manual theme toggle)
- [x] Enhance runes and rune details with expanded knowledge
- [x] Implement a rune details page linked from the runes list (animations, transitions)

### Documentation (Completed)

- [x] Write `README.md` with setup and contribution guidelines
- [x] Create privacy policy and hosting setup
