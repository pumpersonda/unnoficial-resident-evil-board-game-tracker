import { Campaign, GameExpansion, GameVersion, Scenario, ScenarioStatus } from '@/types';
import { ScenarioDefinition, ScenarioNode, SCENARIO_MAP } from './scenarioMap';

export interface ResolvedScenarioNode {
  id: string;
  name: string;
  expansion: GameExpansion;
  lockStatus: string;
  status: ScenarioStatus;
  /** Door number on the tile edge that links this tile to its parent (undefined for door roots' parent, i.e. Main Hall). */
  connector?: number;
  /** True when this node is still Locked but its parent is already Unlocked/Completed. */
  canUnlock: boolean;
  children: ResolvedScenarioNode[];
}

export interface ResolvedDoor {
  root: ResolvedScenarioNode;
  unlockedCount: number;
  totalCount: number;
}

/** Picks which physical tile occupies this map position given the enabled expansions. */
function resolveEffectiveDefinition(
  node: ScenarioNode,
  enabledExpansions: GameExpansion[]
): ScenarioDefinition | undefined {
  if (node.expansion === 'Core Box' || enabledExpansions.includes(node.expansion)) {
    return node;
  }
  return node.alternates?.find(
    alt => alt.expansion === 'Core Box' || enabledExpansions.includes(alt.expansion)
  );
}

function resolveNode(
  node: ScenarioNode,
  enabledExpansions: GameExpansion[],
  scenariosById: Map<string, Scenario>,
  parentStatus: ScenarioStatus
): ResolvedScenarioNode | undefined {
  const effective = resolveEffectiveDefinition(node, enabledExpansions);
  if (!effective) return undefined;

  const status: ScenarioStatus = scenariosById.get(effective.id)?.status ?? 'Locked';

  const children = node.connections
    .map(child => resolveNode(child, enabledExpansions, scenariosById, status))
    .filter((child): child is ResolvedScenarioNode => child !== undefined);

  return {
    id: effective.id,
    name: effective.name,
    expansion: effective.expansion,
    lockStatus: effective.lockStatus,
    status,
    connector: node.connector,
    canUnlock: status === 'Locked' && parentStatus !== 'Locked',
    children,
  };
}

function countTotal(node: ResolvedScenarioNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countTotal(child), 0);
}

function countUnlocked(node: ResolvedScenarioNode): number {
  const self = node.status !== 'Locked' ? 1 : 0;
  return self + node.children.reduce((sum, child) => sum + countUnlocked(child), 0);
}

/**
 * Resolves the static SCENARIO_MAP tree against a campaign's live scenario state,
 * one entry per door off the (hidden) Main Hall root. Main Hall is treated as an
 * implicit always-unlocked parent, so door roots are only gated by their own lockStatus.
 */
export function resolveScenarioTree(campaign: Campaign): ResolvedDoor[] {
  if (campaign.game !== GameVersion.RE1) return [];

  const scenariosById = new Map(campaign.scenarios.map(s => [s.id, s] as const));

  return SCENARIO_MAP.connections
    .map(door => resolveNode(door, campaign.enabledExpansions, scenariosById, 'Completed'))
    .filter((root): root is ResolvedScenarioNode => root !== undefined)
    .map(root => ({
      root,
      unlockedCount: countUnlocked(root),
      totalCount: countTotal(root),
    }));
}
