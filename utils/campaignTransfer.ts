import { z } from 'zod';
import { getGameCardData, getGameCharacters, getGameScenarios } from '@/data';
import { Campaign, CampaignCharacter, Card, CardType, GameVersion, Item, Scenario } from '@/types';

const INVALID_BACKUP_ERROR = "This doesn't look like a valid campaign backup";

class CampaignImportError extends Error {}

const healthSchema = z.object({
  value: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  isPoisoned: z.boolean(),
});

const playerSchema = z.object({
  id: z.string(),
  realName: z.string(),
});

const itemEntrySchema = z.object({
  id: z.string(),
  quantity: z.number(),
  ammunition: z.number().optional(),
});

const cardEntrySchema = z.object({
  id: z.string(),
  quantity: z.number(),
});

const campaignCharacterEntrySchema = z.object({
  character: z.object({ id: z.string() }),
  controlledBy: playerSchema,
  health: healthSchema,
  inventory: z.array(itemEntrySchema),
  kerosene: z.number().optional(),
  isAdvancedVersion: z.boolean(),
  isInTheReserve: z.boolean(),
  isReserveOnly: z.boolean(),
});

const scenarioEntrySchema = z.object({
  id: z.string(),
  status: z.enum(['Locked', 'Unlocked', 'Completed']),
});

export const campaignImportSchema = z.object({
  name: z.string().min(1),
  game: z.enum(['RE1', 'RE2', 'RE3']),
  difficulty: z.enum(['Easy', 'Normal', 'Hard']),
  dangerLevel: z.number(),
  characters: z.array(campaignCharacterEntrySchema),
  itemsBox: z.array(itemEntrySchema),
  addedCards: z.record(z.string(), z.array(cardEntrySchema)),
  discardedCards: z.record(z.string(), z.array(cardEntrySchema)),
  scenarios: z.array(scenarioEntrySchema),
  enabledExpansions: z.array(
    z.enum(['Core Box', 'Bleak Outpost', 'Into The Darkness', "Director's Cut"])
  ),
});

type ParsedCampaignImport = z.infer<typeof campaignImportSchema>;

function rehydrateItem(
  game: GameVersion,
  entry: { id: string; quantity: number; ammunition?: number }
): Item {
  const canonical = getGameCardData(game, 'Item', entry.id) as Item | undefined;
  if (!canonical) throw new CampaignImportError(INVALID_BACKUP_ERROR);
  return {
    ...canonical,
    quantity: entry.quantity,
    ...(entry.ammunition !== undefined ? { ammunition: entry.ammunition } : {}),
  };
}

function rehydrateCard(
  game: GameVersion,
  cardType: CardType,
  entry: { id: string; quantity: number }
): Card {
  const canonical = getGameCardData(game, cardType, entry.id);
  if (!canonical) throw new CampaignImportError(INVALID_BACKUP_ERROR);
  return { ...canonical, quantity: entry.quantity };
}

function rehydrateCardMap(
  game: GameVersion,
  map: Record<string, { id: string; quantity: number }[]>
): Partial<Record<CardType, Card[]>> {
  const result: Partial<Record<CardType, Card[]>> = {};
  for (const [cardType, entries] of Object.entries(map)) {
    result[cardType as CardType] = entries.map(entry =>
      rehydrateCard(game, cardType as CardType, entry)
    );
  }
  return result;
}

function rehydrateCharacters(
  game: GameVersion,
  entries: ParsedCampaignImport['characters']
): CampaignCharacter[] {
  const canonicalCharacters = getGameCharacters(game);
  return entries.map(entry => {
    const canonical = canonicalCharacters.find(c => c.id === entry.character.id);
    if (!canonical) throw new CampaignImportError(INVALID_BACKUP_ERROR);
    return {
      character: canonical,
      controlledBy: entry.controlledBy,
      health: entry.health,
      inventory: entry.inventory.map(item => rehydrateItem(game, item)),
      kerosene: entry.kerosene,
      isAdvancedVersion: entry.isAdvancedVersion,
      isInTheReserve: entry.isInTheReserve,
      isReserveOnly: entry.isReserveOnly,
    };
  });
}

function rehydrateScenarios(
  game: GameVersion,
  entries: ParsedCampaignImport['scenarios']
): Scenario[] {
  const statusById = new Map(entries.map(s => [s.id, s.status]));
  return getGameScenarios(game).map(definition => ({
    id: definition.id,
    name: definition.name,
    expansion: definition.expansion,
    status: statusById.get(definition.id) ?? (definition.isLocked ? 'Locked' : 'Unlocked'),
  }));
}

export function normalizeImportedCampaign(
  raw: unknown
): Omit<Campaign, 'id' | 'createdAt'> | { error: string } {
  const parsed = campaignImportSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: INVALID_BACKUP_ERROR };
  }

  const data = parsed.data;
  const game = data.game as GameVersion;

  try {
    return {
      name: data.name,
      game,
      difficulty: data.difficulty,
      dangerLevel: data.dangerLevel,
      characters: rehydrateCharacters(game, data.characters),
      itemsBox: data.itemsBox.map(item => rehydrateItem(game, item)),
      addedCards: rehydrateCardMap(game, data.addedCards),
      discardedCards: rehydrateCardMap(game, data.discardedCards),
      scenarios: rehydrateScenarios(game, data.scenarios),
      enabledExpansions: data.enabledExpansions,
    };
  } catch (err) {
    if (err instanceof CampaignImportError) {
      return { error: err.message };
    }
    throw err;
  }
}

export function sanitizeFileName(name: string): string {
  const sanitized = name
    .trim()
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .replace(/\s+/g, '-');
  return sanitized.length > 0 ? sanitized : 'campaign';
}
