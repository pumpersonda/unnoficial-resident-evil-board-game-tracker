# Campaign Backup: Export & Import as JSON

## Context

Campaigns are stored locally in AsyncStorage via `useCampaignStore` (`store/campaignStore.ts`) and are never leave the device. Players have no way to back up a campaign, move it to another device, or share it with another player. This feature adds a per-campaign "download" (export) action and a matching "import" action, both operating on plain JSON files, native-mobile-only (iOS/Android — no web target).

## Goals

- A button on each campaign card lets the player export that campaign to a JSON file via the native share sheet (save to Files, AirDrop, send in a message, etc.).
- A button on the Dashboard lets the player import a previously exported JSON file as a brand-new campaign.
- Imported campaigns never collide with or overwrite existing ones — always added as new.
- Imported data can't end up with broken character/item artwork or a stale scenario list, even across app updates.

## Non-Goals

- No web/browser download support (mobile only, per user decision).
- No overwrite/merge-on-collision import mode — collisions can't happen because imports always get a fresh id.
- No cloud backup / auto-sync — this is a manual, explicit, one-file-at-a-time operation.

## New dependencies

Three Expo modules, none currently installed:

- `expo-file-system` — write the export JSON to a temp file; read the picked file back as text on import.
- `expo-sharing` — open the native share sheet for the exported file.
- `expo-document-picker` — let the player pick a `.json` file to import.

Install with `npx expo install expo-file-system expo-sharing expo-document-picker` before implementation begins (not run automatically, per project rules).

## The rehydration problem

`Campaign.characters[].character` (a `CharacterProfile`) and `Campaign.itemsBox` / inventory entries (`Item`) embed static game data that includes `avatar` / `image` fields typed `ImageSourcePropType`, populated via `require('@/assets/...')`. These resolve to Metro's internal asset ids at build time — serializing them to JSON and reading them back (possibly on another device or app build) produces meaningless values and broken art.

**Resolution:** on import, never trust the embedded static fields for characters, items, or scenarios. Instead:

- For each `characters[]` entry, look up the canonical `CharacterProfile` by `character.id` via the existing `getGameCharacters(game)` (`data/index.ts`). Keep only the runtime fields from the file (`controlledBy`, `health`, `inventory`, `kerosene`, `isAdvancedVersion`, `isInTheReserve`, `isReserveOnly`); replace `character` itself with the canonical object.
- For each item in `itemsBox` and in every character's `inventory`, look up the canonical `Item` by `id` via the existing `getGameCardData(game, 'Item', id)`. Keep only `quantity` (and `ammunition` where present) from the file; replace the rest with canonical fields.
- For `scenarios`, rebuild the full list from `getGameScenarios(game)` (same as `createCampaign` does today) and overlay `status` from the file for any matching scenario id. This means a backup made before an app update still ends up with any scenarios added since, instead of a stale/incomplete list.
- For `addedCards` / `discardedCards`, rehydrate each entry the same way via `getGameCardData(game, cardType, id)`, keeping `quantity` from the file. These types don't carry image fields, but rehydrating keeps the behavior consistent and guards against hand-edited/corrupted files.

If any `id` anywhere in the file doesn't resolve against the current game's canonical data, the entire import is rejected — no partial imports. This also naturally rejects files from a different/unsupported game version or unrelated JSON files.

## Architecture

### `utils/campaignTransfer.ts` (new, pure logic, no RN/Expo imports)

- `campaignImportSchema`: a `zod` schema (same library already used in `CreateCampaignModal.tsx`) validating the overall shape of a parsed JSON blob — top-level fields (`name`, `game` enum, `difficulty` enum, `dangerLevel` number, `enabledExpansions` array, `createdAt`/`id` ignored on import), and loose structural checks on nested arrays (each character/item/card entry must at least have a string `id` and the expected runtime-state fields).
- `normalizeImportedCampaign(raw: unknown): Omit<Campaign, 'id' | 'createdAt'> | { error: string }`: runs the zod schema, then performs the character/item/scenario/card rehydration described above. Returns a typed error string on any failure (bad shape, unknown id, JSON that isn't an object) so the caller can show a toast without needing to know *why* it's invalid in detail.

### `utils/campaignFile.ts` (new, Expo wrappers)

- `exportCampaignToFile(campaign: Campaign): Promise<void>` — serializes with `JSON.stringify(campaign, null, 2)`, writes to `FileSystem.cacheDirectory + sanitizeFileName(campaign.name) + '.json'`, checks `Sharing.isAvailableAsync()`, then calls `Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save campaign backup' })`. Throws on any failure for the caller to catch.
- `pickCampaignJson(): Promise<string | null>` — opens `DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true })`; returns `null` if the user canceled, otherwise reads the picked file with `FileSystem.readAsStringAsync` and returns the raw text.
- `sanitizeFileName(name: string): string` — strips characters unsafe for a filename, collapses whitespace.

### Store (`store/campaignStore.ts`)

- New action `importCampaign(data: Omit<Campaign, 'id' | 'createdAt'>): void`, structured exactly like `createCampaign`: generates a fresh id via the existing `generateCampaignId(state.allCampaigns)`, sets `createdAt: new Date().toISOString()`, appends to `allCampaigns`. Does **not** set it as the current campaign (matches `createCampaign`'s existing behavior of not auto-navigating).

## UI

### Export — `components/campain/CampaignCard.tsx`

- New prop `onDownload: (id: string) => void`.
- New icon button using a `Download` icon (`lucide-react-native`) in the existing header icon row, ordered Edit → Download → Delete (destructive action stays last).

### `DashboardScreen.tsx`

- `handleExportCampaign(id)`: finds the campaign, calls `exportCampaignToFile`. On failure, shows an error toast ("Couldn't export campaign"). No success toast — the opened share sheet is the confirmation.
- A new small secondary round button (bg-secondary, `Upload` icon) next to the existing red "+" FAB, for importing.
- `handleImportCampaign()`: calls `pickCampaignJson()`; if it returns `null` (canceled), do nothing. Otherwise `JSON.parse`s the text (catch → error toast "This file isn't valid JSON"), passes the result to `normalizeImportedCampaign` (error → error toast with its `error` message, defaulting to "This doesn't look like a valid campaign backup"), and on success calls `importCampaign(data)` plus a success toast ("Campaign imported", with the campaign's name) matching `handleCampaignCreated`'s existing toast style.

## Testing

New `tests/campaignImportExport.test.ts`, following the pattern of the existing `campaignCreation.test.ts` / `campaignDeletion.test.ts`:

- Export → import round-trip produces an equivalent campaign (new id/createdAt, all character/item fields rehydrated to canonical values, runtime state like health/kerosene/quantities preserved).
- Rejects a file referencing an unknown character or item id.
- Rejects malformed JSON text.
- Rejects a validly-parsed JSON value that doesn't match the expected top-level shape (e.g. missing `game`, wrong types).
- Imported campaign is appended to `allCampaigns` without changing `currentCampaignId`.
