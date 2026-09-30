# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.2.1-alpha] - 2026-09-29

### Security

- Validated the persisted theme `mode` against the known theme whitelist (`THEME_NAMES` + `'system'`) before it is interpolated into the web build's inline bootstrap `<script>`, and switched to `JSON.stringify` instead of manual string interpolation (`components/ui/gluestack-ui-provider/index.web.tsx`)
- Added a `version: 1` + `migrate` step to `themeStore` (`re-theme-store`) that validates the rehydrated theme mode against the same whitelist and falls back to `'dark'` if it's corrupted or foreign
- Replaced `Math.random()`-only campaign ID generation with a collision-checked generator (`generateCampaignId`) in `campaignStore`
- Hardened `campaignStore`'s persist `migrate` step against a malformed or foreign persisted blob missing `allCampaigns`, falling back to an empty campaign list instead of throwing
- Fixed `resetCampaign()` to actually clear `allCampaigns` (previously only cleared `currentCampaignId`, contrary to its name and intended dev/testing use)
- Broadened `.gitignore` to ignore all `.env*` files (was `.env*.local` only) and `*.apk` build artifacts

## [0.2.0-alpha] - 2026-09-09

### Added

- GitHub Actions CI workflow running Prettier check, ESLint, `tsc --noEmit`, and Jest on push/PR, plus a pull request template
- `.github/workflows/build-apk.yml` — manual (`workflow_dispatch`) CI job that builds a debug Android APK via `expo prebuild` + Gradle and uploads it as a build artifact
- Jest unit tests for campaign creation and deletion (`tests/campaignCreation.test.ts`, `tests/campaignDeletion.test.ts`)
- `CardsInfoModal`, and a unified `CardsTab` (renamed from `DiscardedCardsTab`) covering both added and discarded card piles, backed by `SelectCardModal`
- Kerosene tracking for active characters, with an `updateActiveCharacterKerosene` action and `KEROSENE_MAX` constant
- Redesigned Danger Level control: new `DangerLevelModal` and `DangerRing` dial components, `utils/dangerLevelGeometry.ts` geometry helpers, and Jest coverage (`tests/dangerLevel.test.ts`, `tests/dangerLevelGeometry.test.ts`)
- `NavigationInfoModal` explaining scenario navigation and unlock rules
- Explicit delete-confirmation dialogs for characters, cards, and item-box entries

### Changed

- Refreshed all RE1 static card data (encounter, mission, narrative, tension, item) from the reference spreadsheet, with corresponding `CardType`/`Item` type adjustments
- Updated all character avatar images to higher-resolution artwork
- Repositioned the Danger Level control within `CampaignHeader`
- Upgraded to Expo SDK 57
- Fixed multiple unnecessary re-renders and reformatted code with Prettier across the danger level and tab components

### Fixed

- Jest configuration issues (config file extension, test runner setup) preventing the unit test suite from running in CI

## [0.1.0-alpha] - 2026-08-12

### Added

- Initial project scaffold with Expo, React Native, and TypeScript
- Gluestack UI component library integrated locally (Button, Card, Modal, Input, Select, Checkbox, Slider, Toast, AlertDialog, etc.)
- UniWind (Tailwind CSS v4) styling engine with runtime-switchable **light**, **dark**, and **red** themes (`store/themeStore.ts`, persisted as `re-theme-store`)
- Core domain types in `types/index.ts`: `Campaign`, `Card`, `CardType`, `Item`, `ItemType`, `ActiveCharacter`, `CharacterHealth`, `Scenario`, `ScenarioStatus`, `GameVersion`, `GameExpansion`, `Player`
- Zustand `campaignStore` with `persist` middleware backed by AsyncStorage (`re-campaign-store`) as the single source of truth for all campaign data, enabling full offline usage
- Campaign lifecycle actions: `createCampaign`, `updateCampaign`, `deleteCampaign`, `setCurrentCampaignId`, `resetCampaign`
- Character management actions: `addActiveCharacter`, `removeActiveCharacter`, `moveCharacterToReserve`, `addReserveCharacter`, `updateActiveCharacterHealth`, `updateActiveCharacterPlayerName`
- Character inventory actions: `addItemToActiveCharacter`, `removeItemFromActiveCharacter`, `updateActiveCharacterInventory`, `resetActiveCharacterInventory`
- Shared item box actions: `addItemToBox`, `removeFromItemsBox`, `updateItemAmmunition`
- Card pile actions: `addedCard`, `discardCard`, `removeFromAddedCards`, `removeFromDiscardedCard` (quantity-aware, supports Item/Encounter/Narrative/Mission/Tension/Map/Boss/CharacterProfile types)
- Scenario actions: `updateScenarioStatus`, `unlockScenario`, `toggleExpansion` (per-campaign expansion enablement)
- Danger level tracking via `setDangerLevel`
- RE1 static game data: characters, encounter cards, mission cards, narrative cards, tension cards, items, and scenarios (`data/RE1/`)
- Dashboard screen listing all campaigns with create/edit/delete flows and a floating action button
- `CreateCampaignModal` for campaign creation and editing (name, game version, difficulty)
- Current Campaign screen with tabbed navigation: Overview (Summary), Characters, Item Box, Cards, Scenarios (`CampaignTabBar`)
- `SummaryTab` overview cards (active roster, items in box, added/discarded card counts) and campaign completion helper (`utils/campaignProgress.ts`)
- `CharactersTab`, `CharacterDetailsModal`, `EditCharacterModal`, `AssignItemModal`, `SelectCharacterModal` for roster and inventory management
- `ItemBoxTab` and `AddItemModal` for shared item box management
- `DiscardedCardsTab`, `DiscardCardModal`, `SelectCardCategoryModal` for card pile tracking
- `ScenariosTab` with scenario unlock functionality gated by expansion and danger level
- `DangerLevelControl` component and `constants/dangerLevel.ts` definitions
- `DisclaimerModal` with legal/fan-made disclaimer, shown from the Dashboard
- React Navigation stack (`AppNavigator`) wiring Dashboard and Current Campaign screens
- Character avatar image assets (`assets/character_avatars`)
- Jest unit tests for health track mechanics (`tests/healthMechanics.test.ts`)
- ESLint and Prettier tooling configuration
- Project `README.md` with feature overview, tech stack, and legal disclaimer

### Changed

- Restricted the "add game version" feature flag so only RE1 is currently selectable when creating a campaign, reflecting current data coverage
- Store persistence upgraded to schema `version: 1` with a `migrate` step that backfills `enabledExpansions` (defaulting to `['Core Box']`) on existing persisted campaigns

### Fixed

- Corrected item box quantity aggregation so existing items are incremented instead of duplicated
- Corrected danger level updates to target only the currently active campaign
