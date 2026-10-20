import { useCampaignStore } from '@/store/campaignStore';
import { getGameScenarios } from '@/data';
import { GameVersion } from '@/types';

const getCurrentCampaign = () => {
  const { allCampaigns, currentCampaignId } = useCampaignStore.getState();
  return allCampaigns.find(c => c.id === currentCampaignId) ?? null;
};

const resetStore = () => {
  useCampaignStore.setState({ allCampaigns: [], currentCampaignId: null });
};

describe('campaignStore - createCampaign', () => {
  beforeEach(() => {
    resetStore();
  });

  it('appends the new campaign and sets it as the current campaign', () => {
    useCampaignStore.getState().createCampaign({
      name: 'Mansion Incident',
      gameVersion: 'RE1',
      difficulty: 'Normal',
    });

    const { allCampaigns, currentCampaignId } = useCampaignStore.getState();

    expect(allCampaigns).toHaveLength(1);
    expect(currentCampaignId).toBe(allCampaigns[0].id);
  });

  it('carries over name, game and difficulty from the form', () => {
    useCampaignStore.getState().createCampaign({
      name: 'Mansion Incident',
      gameVersion: 'RE1',
      difficulty: 'Hard',
    });

    const campaign = getCurrentCampaign();

    expect(campaign?.name).toBe('Mansion Incident');
    expect(campaign?.game).toBe('RE1');
    expect(campaign?.difficulty).toBe('Hard');
  });

  it('initializes gameplay defaults for a fresh campaign', () => {
    useCampaignStore.getState().createCampaign({
      name: 'Mansion Incident',
      gameVersion: 'RE1',
      difficulty: 'Easy',
    });

    const campaign = getCurrentCampaign();

    expect(campaign?.id).toEqual(expect.any(String));
    expect(campaign?.id.length).toBeGreaterThan(0);
    expect(campaign?.dangerLevel).toBe(0);
    expect(campaign?.characters).toEqual([]);
    expect(campaign?.itemsBox).toEqual([]);
    expect(campaign?.enabledExpansions).toEqual(['Core Box']);
    expect(campaign?.discardedCards).toEqual({});
    expect(campaign?.addedCards).toEqual({});
    expect(campaign?.createdAt).toEqual(expect.any(String));
    expect(new Date(campaign!.createdAt).toString()).not.toBe('Invalid Date');
  });

  it('maps scenario lock status from the game definitions', () => {
    useCampaignStore.getState().createCampaign({
      name: 'Mansion Incident',
      gameVersion: 'RE1',
      difficulty: 'Normal',
    });

    const campaign = getCurrentCampaign();
    const definitions = getGameScenarios(GameVersion.RE1);

    expect(campaign?.scenarios).toHaveLength(definitions.length);

    definitions.forEach(definition => {
      const scenario = campaign?.scenarios.find(s => s.id === definition.id);
      expect(scenario?.status).toBe(definition.isLocked ? 'Locked' : 'Unlocked');
    });

    const unlockedScenario = campaign?.scenarios.find(s => s.id === 'core-1st-floor-east-a');
    const lockedScenario = campaign?.scenarios.find(s => s.id === 'core-1st-floor-east-b');

    expect(unlockedScenario?.status).toBe('Unlocked');
    expect(lockedScenario?.status).toBe('Locked');
  });

  it('keeps prior campaigns intact and generates distinct ids when creating another one', () => {
    const { createCampaign } = useCampaignStore.getState();

    createCampaign({ name: 'First Campaign', gameVersion: 'RE1', difficulty: 'Normal' });
    const firstId = useCampaignStore.getState().currentCampaignId;

    createCampaign({ name: 'Second Campaign', gameVersion: 'RE1', difficulty: 'Hard' });
    const { allCampaigns, currentCampaignId } = useCampaignStore.getState();

    expect(allCampaigns).toHaveLength(2);
    expect(allCampaigns.map(c => c.name)).toEqual(['First Campaign', 'Second Campaign']);
    expect(currentCampaignId).not.toBe(firstId);
  });

  it('switches currentCampaignId to the newly created campaign', () => {
    const { createCampaign, setCurrentCampaignId } = useCampaignStore.getState();

    createCampaign({ name: 'First Campaign', gameVersion: 'RE1', difficulty: 'Normal' });
    const firstId = useCampaignStore.getState().currentCampaignId!;
    setCurrentCampaignId(firstId);

    createCampaign({ name: 'Second Campaign', gameVersion: 'RE1', difficulty: 'Normal' });
    const { allCampaigns, currentCampaignId } = useCampaignStore.getState();
    const secondCampaign = allCampaigns.find(c => c.name === 'Second Campaign');

    expect(currentCampaignId).toBe(secondCampaign?.id);
    expect(currentCampaignId).not.toBe(firstId);
  });
});
