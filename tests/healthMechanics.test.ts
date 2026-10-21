import { useCampaignStore } from '@/store/campaignStore';
import { CharacterProfile } from '@/data/RE1/characters';
import { CampaignCharacter, CharacterHealth, GameVersion, Player } from '@/types';

const getCurrentCampaign = () => {
  const { allCampaigns, currentCampaignId } = useCampaignStore.getState();
  return allCampaigns.find(c => c.id === currentCampaignId) ?? null;
};

const makeCharacter = (id: string, name: string): CharacterProfile => ({
  id,
  name,
  type: 'CharacterProfile',
  game: GameVersion.RE1,
  quantity: 1,
  isAdvanced: false,
  hasReserveOnly: false,
  expansion: 'Core Box',
  avatar: { uri: `avatar-${id}` },
});

const makePlayer = (id: string, realName: string): Player => ({
  id,
  realName,
});

const makeCampaignCharacter = (
  characterId: string,
  name: string,
  health: CharacterHealth = { value: 5, isPoisoned: false }
): CampaignCharacter => ({
  character: makeCharacter(characterId, name),
  controlledBy: makePlayer(`player-${characterId}`, `Player ${name}`),
  health,
  inventory: [],
  isAdvancedVersion: false,
  isInTheReserve: false,
  isReserveOnly: false,
});

const resetStore = () => {
  useCampaignStore.setState({ allCampaigns: [], currentCampaignId: null });
};

describe('campaignStore - health mechanics', () => {
  beforeEach(() => {
    resetStore();
    useCampaignStore.getState().createCampaign({
      name: 'Test Campaign',
      gameVersion: 'RE1',
      difficulty: 'Normal',
    });
  });

  it('updates the health of the targeted active character', () => {
    const { addCharacter, updateCharacterHealth } = useCampaignStore.getState();

    addCharacter(makeCampaignCharacter('chris', 'Chris'));
    updateCharacterHealth('chris', { value: 3, isPoisoned: false });

    const campaign = getCurrentCampaign();
    const chris = campaign?.characters.find(ch => ch.character.id === 'chris');

    expect(chris?.health).toEqual({ value: 3, isPoisoned: false });
  });

  it('sets the isPoisoned flag independently from the health value', () => {
    const { addCharacter, updateCharacterHealth } = useCampaignStore.getState();

    addCharacter(makeCampaignCharacter('jill', 'Jill'));
    updateCharacterHealth('jill', { value: 4, isPoisoned: true });

    const campaign = getCurrentCampaign();
    const jill = campaign?.characters.find(ch => ch.character.id === 'jill');

    expect(jill?.health.isPoisoned).toBe(true);
    expect(jill?.health.value).toBe(4);
  });

  it('allows health to reach 0 (dead)', () => {
    const { addCharacter, updateCharacterHealth } = useCampaignStore.getState();

    addCharacter(makeCampaignCharacter('barry', 'Barry'));
    updateCharacterHealth('barry', { value: 0, isPoisoned: false });

    const campaign = getCurrentCampaign();
    const barry = campaign?.characters.find(ch => ch.character.id === 'barry');

    expect(barry?.health.value).toBe(0);
  });

  it('only updates the targeted character, leaving other active characters untouched', () => {
    const { addCharacter, updateCharacterHealth } = useCampaignStore.getState();

    addCharacter(makeCampaignCharacter('chris', 'Chris'));
    addCharacter(makeCampaignCharacter('jill', 'Jill', { value: 5, isPoisoned: false }));

    updateCharacterHealth('chris', { value: 1, isPoisoned: true });

    const campaign = getCurrentCampaign();
    const chris = campaign?.characters.find(ch => ch.character.id === 'chris');
    const jill = campaign?.characters.find(ch => ch.character.id === 'jill');

    expect(chris?.health).toEqual({ value: 1, isPoisoned: true });
    expect(jill?.health).toEqual({ value: 5, isPoisoned: false });
  });

  it('does not affect campaigns other than the current one', () => {
    const { createCampaign, setCurrentCampaignId, addCharacter, updateCharacterHealth } =
      useCampaignStore.getState();

    const firstCampaignId = useCampaignStore.getState().currentCampaignId!;
    addCharacter(makeCampaignCharacter('chris', 'Chris'));

    createCampaign({ name: 'Second Campaign', gameVersion: 'RE2', difficulty: 'Hard' });
    addCharacter(makeCampaignCharacter('chris', 'Chris'));

    updateCharacterHealth('chris', { value: 0, isPoisoned: true });

    const allCampaigns = useCampaignStore.getState().allCampaigns;
    const firstCampaign = allCampaigns.find(c => c.id === firstCampaignId);
    const secondCampaign = allCampaigns.find(c => c.id !== firstCampaignId);

    expect(firstCampaign?.characters[0].health).toEqual({ value: 5, isPoisoned: false });
    expect(secondCampaign?.characters[0].health).toEqual({ value: 0, isPoisoned: true });

    setCurrentCampaignId(firstCampaignId);
  });

  it('leaves state unchanged when the characterId does not match any active character', () => {
    const { addCharacter, updateCharacterHealth } = useCampaignStore.getState();

    addCharacter(makeCampaignCharacter('chris', 'Chris'));
    updateCharacterHealth('unknown-id', { value: 0, isPoisoned: true });

    const campaign = getCurrentCampaign();
    const chris = campaign?.characters.find(ch => ch.character.id === 'chris');

    expect(chris?.health).toEqual({ value: 5, isPoisoned: false });
  });
});
