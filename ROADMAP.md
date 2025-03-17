
# Roadmap for Rune of the Day

This roadmap tracks the development progress of the "Rune of the Day" app, detailing completed tasks and future plans across core features, styling, testing, debugging, and enhancements.

## Core Features

- [x] Initialize Expo project with TypeScript.
- [x] Define rune data (symbols, names, meanings) in `src/data/`.
- [x] Implement daily rune selection with `AsyncStorage` to persist the daily choice.
- [x] Add custom font support for rune symbols.
- [x] Build the main screen to show the daily rune.
- [x] Set up tab navigation using React Navigation.
- [x] Create a rune list screen with all 24 Elder Futhark runes.
- [x] Develop a flashcard screen with flip functionality.
- [x] Enable light/dark mode theming with a custom hook.

## Styling

- [ ] Polish the UI for a cohesive design:
  - [ ] Standardize typography, colors, and spacing across screens.
  - [ ] Add smooth animations (e.g., flashcard flips, screen transitions).
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

- [ ] Fix navigation container nesting issue causing render errors.
- [ ] Troubleshoot font loading/rendering glitches on some devices.
- [ ] Confirm `AsyncStorage` reliability across platforms.
- [ ] Optimize performance for faster navigation and animations.

## Future Enhancements

- [ ] Add a settings screen (e.g., manual theme toggle).
- [ ] Implement a rune history log for past daily runes.
- [ ] Create a quiz mode to test rune knowledge.
- [ ] Support multiple languages via localization.
- [ ] Explore backend integration for user accounts and rune sharing.

## Documentation

- [x] Write `README.md` with setup and contribution guidelines.
- [ ] Add inline comments to complex code sections.
- [ ] Document custom hooks and components.
- [ ] Create a user guide for app features.