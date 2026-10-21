import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Campaign,
  CampaignCharacter,
  Card,
  CardType,
  CharacterHealth,
  GameExpansion,
  GameVersion,
  Item,
  KEROSENE_MAX,
  Scenario,
  ScenarioStatus,
} from '@/types';
import { CreateCampaignForm } from '@/components/screens/CreateCampaignModal';
import { getGameScenarios } from '@/data';
import { DANGER_LEVEL_CONFIG } from '@/constants/dangerLevel';

// Collision-checked local id — Math.random() alone has no uniqueness guarantee
// against the campaigns already on this device.
function generateCampaignId(existingCampaigns: Campaign[]): string {
  let id: string;
  do {
    id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  } while (existingCampaigns.some(c => c.id === id));
  return id;
}

interface CampaignStore {
  currentCampaignId: string | null;
  allCampaigns: Campaign[];

  // Core actions
  createCampaign: (formData: CreateCampaignForm) => void;
  setCurrentCampaignId: (campaignId: string | null) => void;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (campaignId: string) => void;
  resetCampaign: () => void;

  // Fast gameplay actions
  setDangerLevel: (level: number) => void;
  updateScenarioStatus: (scenarioId: string, status: ScenarioStatus) => void;
  unlockScenario: (scenarioId: string) => void;
  toggleExpansion: (expansion: Exclude<GameExpansion, 'Core Box'>) => void;
  updateCharacterHealth: (characterId: string, health: CharacterHealth) => void;
  updateCharacterKerosene: (characterId: string, kerosene: number) => void;
  addCharacter: (character: CampaignCharacter) => void;
  removeCharacter: (characterId: string) => void;
  setCharacterReserved: (characterId: string, isInTheReserve: boolean) => void;
  addItemToCharacter: (characterId: string, item: Item) => void;
  removeItemFromCharacter: (characterId: string, itemId: string, quantity: number) => void;
  updateCharacterInventory: (characterId: string, item: Item) => void;
  resetCharacterInventory: (characterId: string) => void;
  updateCharacterPlayerName: (characterId: string, realName: string) => void;
  addItemToBox: (item: Item) => void;
  removeFromItemsBox: (itemId: string, quantity: number) => void;
  updateItemAmmunition: (itemId: string, ammunition: number) => void;
  addedCard: (cardType: CardType, card: Card) => void;
  discardCard: (cardType: CardType, card: Card) => void;
  removeFromAddedCards: (cardType: CardType, cardId: string, quantity: number) => void;
  removeFromDiscardedCard: (cardType: CardType, cardId: string, quantity: number) => void;
}

export const useCampaignStore = create<CampaignStore>()(
  persist(
    set => ({
      currentCampaignId: null,
      allCampaigns: [],

      createCampaign: formData =>
        set(state => {
          // Generate a unique ID and append all starting campaign defaults
          const game = formData.gameVersion as GameVersion;
          const scenarios: Scenario[] = getGameScenarios(game).map(definition => ({
            id: definition.id,
            name: definition.name,
            expansion: definition.expansion,
            status: definition.isLocked ? 'Locked' : 'Unlocked',
          }));

          const newCampaign: Campaign = {
            id: generateCampaignId(state.allCampaigns),
            name: formData.name,
            game,
            difficulty: formData.difficulty,
            dangerLevel: 0, // Starts at zero threat
            characters: [], // Empty roster at the beginning
            itemsBox: [], // Inventory box starts empty
            scenarios,
            enabledExpansions: ['Core Box'],
            discardedCards: {},
            addedCards: {},
            createdAt: new Date().toISOString(),
          };

          return {
            allCampaigns: [...state.allCampaigns, newCampaign],
            currentCampaignId: newCampaign.id,
          };
        }),

      setCurrentCampaignId: campaignId => set({ currentCampaignId: campaignId }),

      updateCampaign: (campaignId, updates) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c =>
            c.id === campaignId ? { ...c, ...updates } : c
          ),
        })),

      deleteCampaign: campaignId =>
        set(state => ({
          allCampaigns: state.allCampaigns.filter(c => c.id !== campaignId),
          currentCampaignId:
            state.currentCampaignId === campaignId ? null : state.currentCampaignId,
        })),

      resetCampaign: () => set({ currentCampaignId: null, allCampaigns: [] }),

      setDangerLevel: level =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const maxLevel = DANGER_LEVEL_CONFIG[c.game]?.maxLevel ?? level;
            return { ...c, dangerLevel: Math.max(0, Math.min(level, maxLevel)) };
          }),
        })),

      updateScenarioStatus: (scenarioId, status) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              scenarios: c.scenarios.map(s => (s.id === scenarioId ? { ...s, status } : s)),
            };
          }),
        })),

      unlockScenario: scenarioId =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              scenarios: c.scenarios.map(s =>
                s.id === scenarioId && s.status === 'Locked' ? { ...s, status: 'Unlocked' } : s
              ),
            };
          }),
        })),

      toggleExpansion: expansion =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const isEnabled = c.enabledExpansions.includes(expansion);
            return {
              ...c,
              enabledExpansions: isEnabled
                ? c.enabledExpansions.filter(e => e !== expansion)
                : [...c.enabledExpansions, expansion],
            };
          }),
        })),

      updateCharacterHealth: (characterId, newHealth) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch =>
                ch.character.id === characterId ? { ...ch, health: newHealth } : ch
              ),
            };
          }),
        })),

      updateCharacterKerosene: (characterId, kerosene) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch =>
                ch.character.id === characterId
                  ? { ...ch, kerosene: Math.min(KEROSENE_MAX, Math.max(0, kerosene)) }
                  : ch
              ),
            };
          }),
        })),

      addCharacter: character =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: [...c.characters, character],
            };
          }),
        })),

      removeCharacter: characterId =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const characterToRemove = c.characters.find(ch => ch.character.id === characterId);
            if (!characterToRemove) return c;

            const newItemsBox = characterToRemove.inventory.reduce((box, item) => {
              const existingItem = box.find(i => i.id === item.id);
              return existingItem
                ? box.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                  )
                : [...box, item];
            }, c.itemsBox);

            return {
              ...c,
              characters: c.characters.filter(ch => ch.character.id !== characterId),
              itemsBox: newItemsBox,
            };
          }),
        })),

      setCharacterReserved: (characterId, isInTheReserve) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const target = c.characters.find(ch => ch.character.id === characterId);
            // Entries using the special Reserve-only card can never leave the Reserve.
            if (!target || target.isReserveOnly) return c;

            if (isInTheReserve) {
              const newItemsBox = target.inventory.reduce((box, item) => {
                const existingItem = box.find(i => i.id === item.id);
                return existingItem
                  ? box.map(i =>
                      i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                    )
                  : [...box, item];
              }, c.itemsBox);

              return {
                ...c,
                itemsBox: newItemsBox,
                characters: c.characters.map(ch =>
                  ch.character.id === characterId
                    ? {
                        ...ch,
                        isInTheReserve: true,
                        controlledBy: { ...ch.controlledBy, realName: '' },
                        inventory: [],
                        kerosene: undefined,
                        health: { ...ch.health, isPoisoned: false },
                      }
                    : ch
                ),
              };
            }

            return {
              ...c,
              characters: c.characters.map(ch =>
                ch.character.id === characterId
                  ? {
                      ...ch,
                      isInTheReserve: false,
                      kerosene: c.game === GameVersion.RE1 ? 0 : undefined,
                    }
                  : ch
              ),
            };
          }),
        })),

      updateCharacterPlayerName: (characterId, realName) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch =>
                ch.character.id === characterId
                  ? { ...ch, controlledBy: { ...ch.controlledBy, realName } }
                  : ch
              ),
            };
          }),
        })),

      addItemToCharacter: (characterId, item) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch => {
                if (ch.character.id !== characterId) return ch;
                const existingItem = ch.inventory.find(i => i.id === item.id);
                const newInventory = existingItem
                  ? ch.inventory.map(i =>
                      i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                    )
                  : [...ch.inventory, item];
                return { ...ch, inventory: newInventory };
              }),
            };
          }),
        })),

      removeItemFromCharacter: (characterId, itemId, quantity) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch => {
                if (ch.character.id !== characterId) return ch;
                const newInventory = ch.inventory
                  .map(i => (i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i))
                  .filter(i => i.quantity > 0);
                return { ...ch, inventory: newInventory };
              }),
            };
          }),
        })),

      updateCharacterInventory: (characterId, item) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch => {
                if (ch.character.id !== characterId) return ch;
                const itemExists = ch.inventory.some(i => i.id === item.id);
                const newInventory = itemExists
                  ? ch.inventory.map(i => (i.id === item.id ? item : i))
                  : [...ch.inventory, item];
                return { ...ch, inventory: newInventory };
              }),
            };
          }),
        })),

      resetCharacterInventory: characterId =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            return {
              ...c,
              characters: c.characters.map(ch =>
                ch.character.id === characterId ? { ...ch, inventory: [] } : ch
              ),
            };
          }),
        })),

      addItemToBox: item =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const existingItem = c.itemsBox.find(i => i.id === item.id);
            const newItemsBox = existingItem
              ? c.itemsBox.map(i =>
                  i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
                )
              : [...c.itemsBox, item];
            return { ...c, itemsBox: newItemsBox };
          }),
        })),

      removeFromItemsBox: (itemId, quantity) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const newItemsBox = c.itemsBox
              .map(i => (i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i))
              .filter(i => i.quantity > 0);
            return { ...c, itemsBox: newItemsBox };
          }),
        })),

      updateItemAmmunition: (itemId, ammunition) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const newItemsBox = c.itemsBox.map(i =>
              i.id === itemId ? { ...i, ammunition: Math.max(0, ammunition) } : i
            );
            return { ...c, itemsBox: newItemsBox };
          }),
        })),

      discardCard: (cardType, card) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const currentDiscarded = c.discardedCards[cardType] || [];
            const existingCard = currentDiscarded.find(cd => cd.id === card.id);
            const newDiscarded = existingCard
              ? currentDiscarded.map(cd =>
                  cd.id === card.id ? { ...cd, quantity: cd.quantity + card.quantity } : cd
                )
              : [...currentDiscarded, card];
            return {
              ...c,
              discardedCards: {
                ...c.discardedCards,
                [cardType]: newDiscarded,
              },
            };
          }),
        })),

      addedCard: (cardType, card) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const currentAdded = c.addedCards[cardType] || [];
            const existingCard = currentAdded.find(ac => ac.id === card.id);
            const newAdded = existingCard
              ? currentAdded.map(ac =>
                  ac.id === card.id ? { ...ac, quantity: ac.quantity + card.quantity } : ac
                )
              : [...currentAdded, card];
            return {
              ...c,
              addedCards: {
                ...c.addedCards,
                [cardType]: newAdded,
              },
            };
          }),
        })),

      removeFromAddedCards: (cardType, cardId, quantity) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const currentAdded = c.addedCards[cardType] || [];
            const newAdded = currentAdded
              .map(ac => (ac.id === cardId ? { ...ac, quantity: ac.quantity - quantity } : ac))
              .filter(ac => ac.quantity > 0);
            return {
              ...c,
              addedCards: {
                ...c.addedCards,
                [cardType]: newAdded,
              },
            };
          }),
        })),

      removeFromDiscardedCard: (cardType, cardId, quantity) =>
        set(state => ({
          allCampaigns: state.allCampaigns.map(c => {
            if (c.id !== state.currentCampaignId) return c;
            const currentDiscarded = c.discardedCards[cardType] || [];
            const newDiscarded = currentDiscarded
              .map(cd => (cd.id === cardId ? { ...cd, quantity: cd.quantity - quantity } : cd))
              .filter(cd => cd.quantity > 0);
            return {
              ...c,
              discardedCards: {
                ...c.discardedCards,
                [cardType]: newDiscarded,
              },
            };
          }),
        })),
    }),
    {
      name: 're-campaign-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 4,
      migrate: persistedState => {
        const state = persistedState as Record<string, unknown> | undefined;
        // A foreign or much-older persisted blob may be missing allCampaigns
        // entirely — fall back to an empty campaign list instead of throwing.
        const rawCampaigns = state?.allCampaigns;
        const allCampaigns = Array.isArray(rawCampaigns) ? rawCampaigns : [];

        return {
          ...state,
          allCampaigns: allCampaigns.map((c: Record<string, unknown>) => {
            // v3 already has a unified `characters` list — just backfill the v4 field.
            if (Array.isArray(c?.characters)) {
              return {
                ...c,
                enabledExpansions: c?.enabledExpansions ?? ['Core Box'],
                characters: c.characters.map((ch: Record<string, unknown>) => ({
                  ...ch,
                  isReserveOnly: ch?.isReserveOnly ?? false,
                })),
              };
            }

            const legacyActive = Array.isArray(c?.activeCharacters) ? c.activeCharacters : [];
            // Pre-v2 reserveCharacters were bare CharacterProfile entries;
            // v2 wrapped them as { character, isReservedOnly }.
            const legacyReserve = Array.isArray(c?.reserveCharacters) ? c.reserveCharacters : [];

            const characters = [
              ...legacyActive.map((ac: Record<string, unknown>) => ({
                ...ac,
                isInTheReserve: false,
                isReserveOnly: false,
              })),
              ...legacyReserve.map((rc: unknown) => {
                const character =
                  rc && typeof rc === 'object' && 'character' in rc
                    ? (rc as { character: unknown }).character
                    : rc;
                return {
                  character,
                  controlledBy: {
                    id: `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`,
                    realName: '',
                  },
                  health: { value: 5, isPoisoned: false },
                  inventory: [],
                  kerosene: undefined,
                  isAdvancedVersion: false,
                  isInTheReserve: true,
                  isReserveOnly: false,
                };
              }),
            ];

            return {
              ...c,
              enabledExpansions: c?.enabledExpansions ?? ['Core Box'],
              characters,
              activeCharacters: undefined,
              reserveCharacters: undefined,
            };
          }),
        } as CampaignStore;
      },
    }
  )
);

// Custom helper hook for easy consumption inside components
export const useCurrentCampaign = (): Campaign | null => {
  const allCampaigns = useCampaignStore(state => state.allCampaigns);
  const currentCampaignId = useCampaignStore(state => state.currentCampaignId);
  return allCampaigns.find(c => c.id === currentCampaignId) || null;
};
