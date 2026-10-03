# Full-Screen Modal Redesign

## Context

The app currently has two families of overlay components:

- **9 `Modal`-based components** (`components/ui/modal`), used for data entry and detail views: `CreateCampaignModal`, `SelectCharacterModal`, `AssignItemModal`, `SelectCardCategoryModal`, `AddItemModal`, `CharacterDetailsModal`, `SelectCardModal`, `EditCharacterModal`, `DangerLevelModal`. Most render as a centered card (`size="md"`, `h-[85%]`) with a header (title + `X` close button), scrollable body, and footer action row. `DangerLevelModal` is already full-screen (`size="full"`) but with a bespoke layout: no title, a hardcoded floating `X` at `top-14 right-6`, no footer.
- **3 `AlertDialog`-based components** (`components/ui/alert-dialog`), used for brief info/confirmation popups: `NavigationInfoModal`, `DisclaimerModal`, `CardsInfoModal`. These stay as compact centered dialogs — out of scope for this change.

Each of the 9 `Modal`-based components currently hand-rolls its own header/body/footer scaffold, leading to minor inconsistencies (e.g. `SelectCardCategoryModal` and `CharacterDetailsModal` have no footer at all; `DangerLevelModal` has no header). This redesign converts all 9 to a full-screen layout sharing one consistent scaffold.

## Goals

- All 9 `Modal`-based components render as full-screen takeovers instead of partial centered dialogs.
- Visual consistency: identical header layout (centered title, top-right `X` close button), identical footer bar pattern, identical enter/exit animation, across all 9.
- Centralize the shared scaffold in one component so future modals automatically match, instead of relying on copy-paste discipline.

## Non-Goals

- `AlertDialog`-based popups (`NavigationInfoModal`, `DisclaimerModal`, `CardsInfoModal`) are not touched.
- No changes to the underlying gluestack-generated primitive at `components/ui/modal/index.tsx`.
- No changes to modal business logic (data flow, store actions, validation) — this is purely a presentational/layout change.

## Architecture: `FullScreenModal` shared component

New file: `components/shared/FullScreenModal.tsx` (new `shared/` folder — this component is consumed by both `components/screens/` and `components/campain/tabs/`, so it doesn't belong under either).

It composes the existing `components/ui/modal` primitives (`Modal`, `ModalBackdrop`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`) — it does not replace or modify them.

### Props

```ts
interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;   // body content
  footer?: React.ReactNode;    // omitted → default full-width "Close" button
  scrollEnabled?: boolean;     // default true, forwarded to ModalBody
}
```

### Behavior

- `Modal`: `isOpen`, `onClose`, `size="full"` (reuses the primitive's existing `full` size variant).
- `ModalBackdrop`: unchanged, kept for Android hardware back-button / overlay press semantics even though it's visually fully covered.
- `ModalContent`: `className="bg-background h-full w-full rounded-none border-0 p-0"`. Enter/exit animation is overridden per-instance via `entering`/`exiting` props (`SlideInDown`/`SlideOutDown` from `react-native-reanimated`), replacing the primitive's default `ZoomIn`/`FadeOut` — the primitive already spreads `...props` after its defaults, so this requires no primitive edit.
- Header: a `View` padded with `useSafeAreaInsets().top`, laid out as a relative row. Title is a `Text` absolutely centered (`absolute inset-x-0 text-center`); the `X` close button (via `ModalCloseButton`, same icon/color convention as today — `lucide-react-native` `X` + `THEME_COLORS[resolvedTheme].mutedForeground`) is pinned top-right.
- Body: `ModalBody` with `className="flex-1 px-4"`, `scrollEnabled` forwarded, `showsVerticalScrollIndicator={false}`.
- Footer: a `View` padded with `useSafeAreaInsets().bottom`, rendering the `footer` prop if provided. If `footer` is omitted, renders a default `<Button className="flex-1 bg-secondary active:opacity-90" onPress={onClose}><ButtonText>Close</ButtonText></Button>`.

## Per-component migration

Each of the 9 files replaces its existing `Modal`/`ModalBackdrop`/`ModalContent`/`ModalHeader`/`ModalCloseButton`/`ModalBody`/`ModalFooter` boilerplate with `<FullScreenModal isOpen={...} onClose={...} title="...">...</FullScreenModal>`, moving the existing body JSX into children and existing footer buttons into the `footer` prop.

| Component | Title | Footer |
|---|---|---|
| `CreateCampaignModal` | "New Campaign" / "Edit Campaign" (existing conditional) | Cancel + Create/Save row (existing) |
| `SelectCharacterModal` | "Select Character" | Done button (existing) |
| `AssignItemModal` | "Assign Item" | Done button (existing) |
| `SelectCardCategoryModal` | "Add a Card" / "Discard a Card" (existing conditional) | *(omitted → default Close button)* |
| `AddItemModal` | "Add Item to Box" | Done button (existing) |
| `CharacterDetailsModal` | Character name | *(omitted → default Close button)* |
| `SelectCardModal` | existing conditional title | Done button (existing) |
| `EditCharacterModal` | existing conditional title | Done button (existing) |
| `DangerLevelModal` | "Danger Level" *(new — currently has no title)* | *(omitted → default Close button)* |

### `DangerLevelModal` special case

This component is a direct-manipulation control (drag a ring; value commits live on drag-end) rather than a form, so a persistent action bar doesn't map to anything. It adopts the standard header (title + `X`, replacing the current hardcoded `top-14 right-6` floating `Pressable`) but keeps the default Close-button footer rather than inventing a no-op custom footer — consistent with every other component in the table, and harmless since dismissing via Close vs. the old floating X has identical semantics (both just call `onClose`).

## Testing

Presentational-only change; no new store logic or business rules to unit test. Verification is manual: use the `run` skill to launch the app and open each of the 9 modals, confirming full-screen takeover, centered title, slide-up/down animation, correct footer (default Close vs. custom actions per the table above), and correct safe-area insets top and bottom.
