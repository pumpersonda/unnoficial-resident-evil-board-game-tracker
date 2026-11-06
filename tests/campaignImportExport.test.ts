import { useCampaignStore } from '@/store/campaignStore';
import { normalizeImportedCampaign } from '@/utils/campaignTransfer';
import { getGameCharacters, getGameScenarios } from '@/data';
import { GameVersion } from '@/types';

const resetStore = () => {
  useCampaignStore.setState({ allCampaigns: [], currentCampaignId: null });
};

const createCampaign = (name: string) =>
  useCampaignStore.getState().createCampaign({ name, gameVersion: 'RE1', difficulty: 'Normal' });

describe('campaignTransfer - normalizeImportedCampaign', () => {
  beforeEach(() => {
    resetStore();
  });

  it('round-trips an exported campaign back into a valid campaign shape', () => {
    createCampaign('Mansion Incident');
    const exported = useCampaignStore.getState().allCampaigns[0];
    const roundTripped = JSON.parse(JSON.stringify(exported));

    const result = normalizeImportedCampaign(roundTripped);

    expect('error' in result).toBe(false);
    if ('error' in result) return;

    expect(result.name).toBe('Mansion Incident');
    expect(result.game).toBe(GameVersion.RE1);
    expect(result.scenarios).toHaveLength(getGameScenarios(GameVersion.RE1).length);
  });

  it('rehydrates a character by canonical id instead of trusting embedded static fields', () => {
    const canonical = getGameCharacters(GameVersion.RE1)[0];
    const raw = {
      name: 'Mansion Incident',
      game: 'RE1',
      difficulty: 'Normal',
      dangerLevel: 2,
      characters: [
        {
          character: { id: canonical.id, name: 'Tampered Name', avatar: 999999 },
          controlledBy: { id: 'p1', realName: 'Player One' },
          health: { value: 5, isPoisoned: false },
          inventory: [],
          isAdvancedVersion: false,
          isInTheReserve: false,
          isReserveOnly: false,
        },
      ],
      itemsBox: [],
      addedCards: {},
      discardedCards: {},
      scenarios: [],
      enabledExpansions: ['Core Box'],
    };

    const result = normalizeImportedCampaign(raw);

    expect('error' in result).toBe(false);
    if ('error' in result) return;

    expect(result.characters[0].character).toEqual(canonical);
  });

  it('rejects a file referencing an unknown character id', () => {
    const raw = {
      name: 'Foreign Campaign',
      game: 'RE1',
      difficulty: 'Normal',
      dangerLevel: 0,
      characters: [
        {
          character: { id: 'not-a-real-character' },
          controlledBy: { id: 'p1', realName: 'Player One' },
          health: { value: 5, isPoisoned: false },
          inventory: [],
          isAdvancedVersion: false,
          isInTheReserve: false,
          isReserveOnly: false,
        },
      ],
      itemsBox: [],
      addedCards: {},
      discardedCards: {},
      scenarios: [],
      enabledExpansions: ['Core Box'],
    };

    const result = normalizeImportedCampaign(raw);

    expect('error' in result).toBe(true);
  });

  it('rejects a value that does not match the expected top-level shape', () => {
    const result = normalizeImportedCampaign({ hello: 'world' });

    expect('error' in result).toBe(true);
  });

  it('rejects malformed JSON text before it ever reaches normalization', () => {
    expect(() => JSON.parse('{ not valid json')).toThrow();
  });
});

describe('campaignStore - importCampaign', () => {
  beforeEach(() => {
    resetStore();
  });

  it('appends the imported campaign without changing currentCampaignId', () => {
    createCampaign('Existing Campaign');
    const existingId = useCampaignStore.getState().currentCampaignId;

    const exported = useCampaignStore.getState().allCampaigns[0];
    const roundTripped = JSON.parse(JSON.stringify(exported));
    const normalized = normalizeImportedCampaign(roundTripped);
    if ('error' in normalized) throw new Error('expected a valid normalized campaign');

    useCampaignStore.getState().importCampaign(normalized);
    const { allCampaigns, currentCampaignId } = useCampaignStore.getState();

    expect(allCampaigns).toHaveLength(2);
    expect(currentCampaignId).toBe(existingId);
  });

  it('assigns a fresh id distinct from the originally exported campaign', () => {
    createCampaign('Existing Campaign');
    const exported = useCampaignStore.getState().allCampaigns[0];
    const roundTripped = JSON.parse(JSON.stringify(exported));
    const normalized = normalizeImportedCampaign(roundTripped);
    if ('error' in normalized) throw new Error('expected a valid normalized campaign');

    useCampaignStore.getState().importCampaign(normalized);
    const { allCampaigns } = useCampaignStore.getState();
    const imported = allCampaigns[1];

    expect(imported.id).not.toBe(exported.id);
    expect(imported.createdAt).toEqual(expect.any(String));
  });
});
