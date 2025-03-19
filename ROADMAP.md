# Roadmap for Rune of the Day

This roadmap tracks the development progress of the "Rune of the Day" app, detailing completed tasks and future plans across core features, styling, testing, debugging, and enhancements.

## Core Features

- [x] Initialize Expo project with TypeScript.
- [x] Define rune data (symbols, names, meanings, deities) in `src/data/`.
- [x] Implement daily rune selection with `AsyncStorage` to persist the daily choice.
- [x] Add custom font support for rune symbols.
- [x] Build the main screen to show the daily rune.
- [x] Set up tab navigation using React Navigation.
- [x] Create a rune list screen with all 24 Elder Futhark runes.
- [x] Develop a flashcard screen with flip functionality.
- [x] Enable light/dark mode theming with a custom hook.
- [x] Add haptic feedback for enhanced user interaction:
  - [x] Success feedback when daily rune loads
  - [x] Medium feedback for card flips
  - [x] Light feedback for navigation and list interactions
  - [x] Platform-safe implementation with web support
- [x] Display associated deities for each rune across all screens:
  - [x] Main screen: Below rune meaning
  - [x] Rune list: As subtitle
  - [x] Flashcards: On back of card
- [ ] Properly refactor to use Expo Router

## App Store Preparation

- [x] Set up GitHub Pages for privacy policy and app landing page
- [x] Create comprehensive privacy policy
- [x] Generate app store screenshots for all required sizes
- [x] Create compelling app store descriptions
- [x] Complete app store listing assets:
  - [x] Feature graphic
  - [x] Promo video (optional)
  - [x] App icon in required sizes
- [ ] Configure build process:
  - [x] Set up EAS build configuration
  - [x] Configure environment variables
  - [ ] Generate and secure Android keystore
  - [ ] Set up iOS certificates and provisioning profiles

## Styling

- [x] Polish the UI for a cohesive design:
  - [x] Standardize typography, colors, and spacing across screens.
  - [x] Add smooth animations (e.g., flashcard flips, screen transitions).
- [ ] Ensure responsiveness across screen sizes and orientations.
- [ ] Enhance tab bar with custom rune-inspired icons.

## Testing

- [ ] Write unit tests for key logic:
  - [ ] Test daily rune selection consistency.
  - [ ] Verify `AsyncStorage` persistence.
- [ ] Perform cross-platform testing (iOS, Android, web).
- [ ] Add accessibility features (e.g., screen reader compatibility).
- [ ] Validate theme switching and style consistency.

## Debugging

- [x] Fix navigation container nesting issue causing render errors.
- [x] Troubleshoot font loading/rendering glitches on some devices.
- [ ] Confirm `AsyncStorage` reliability across platforms.
- [x] Optimize performance for faster navigation and animations.

## Future Enhancements

- [x] Add a settings screen (e.g., manual theme toggle).
- [x] Enhance runes and rune details and properly expand on rune knowledge
- [ ] Implement a rune details page that is linked to from the runes list.
- [ ] Create a quiz mode to test rune knowledge.
- [ ] Support multiple languages via localization.
- [ ] Explore backend integration for user accounts and rune sharing.

## Documentation

- [x] Write `README.md` with setup and contribution guidelines.
- [x] Create privacy policy and hosting setup
- [ ] Add inline comments to complex code sections.
- [ ] Document custom hooks and components.
- [ ] Create a user guide for app features.
