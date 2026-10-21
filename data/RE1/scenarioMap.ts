import { GameExpansion, GameVersion } from '@/types';

export interface ScenarioDefinition {
  id: string;
  game: GameVersion;
  expansion: GameExpansion;
  type: 'Scenario';
  name: string;
  quantity: number;
  lockStatus: string;
  isLocked: boolean;
}

export interface ScenarioNode extends ScenarioDefinition {
  /** Door number on the tile edge that links this tile to its parent (undefined for the root). */
  connector?: number;
  /** Tiles reachable from this one (children in the map tree). */
  connections: ScenarioNode[];
  /** Other physical versions of this same map position (e.g. Core Box copy replaced by an expansion). */
  alternates?: ScenarioDefinition[];
}

export const SCENARIO_MAP: ScenarioNode = {
  id: 'core-main-hall',
  game: GameVersion.RE1,
  expansion: 'Core Box',
  type: 'Scenario',
  name: 'Main Hall',
  quantity: 1,
  lockStatus: 'Starting tile',
  isLocked: false,
  connections: [
    // ── Door 1: Crypts A ─────────────────────────────────────────────
    {
      id: 'darkness-crypts-a',
      game: GameVersion.RE1,
      expansion: 'Into The Darkness',
      type: 'Scenario',
      name: 'Crypts A',
      quantity: 1,
      lockStatus: 'One side locked, 4 Death Masks',
      isLocked: true,
      connector: 1,
      alternates: [
        {
          id: 'core-crypts-a',
          game: GameVersion.RE1,
          expansion: 'Core Box',
          type: 'Scenario',
          name: 'Crypts A',
          quantity: 1,
          lockStatus: 'One side locked, 3 Death Masks',
          isLocked: true,
        },
      ],
      connections: [],
    },

    // ── Door 2: 2nd Floor East ───────────────────────────────────────
    {
      id: 'core-2nd-floor-east-a',
      game: GameVersion.RE1,
      expansion: 'Core Box',
      type: 'Scenario',
      name: '2nd Floor East A',
      quantity: 1,
      lockStatus: 'Both sides unlocked',
      isLocked: false,
      connector: 2,
      connections: [
        {
          id: 'darkness-2nd-floor-east-b',
          game: GameVersion.RE1,
          expansion: 'Into The Darkness',
          type: 'Scenario',
          name: '2nd Floor East B',
          quantity: 1,
          lockStatus: 'One side locked',
          isLocked: true,
          connector: 7,
          alternates: [
            {
              id: 'core-2nd-floor-east-b',
              game: GameVersion.RE1,
              expansion: 'Core Box',
              type: 'Scenario',
              name: '2nd Floor East B',
              quantity: 1,
              lockStatus: 'One side locked',
              isLocked: true,
            },
          ],
          connections: [
            {
              id: 'darkness-2nd-floor-east-c',
              game: GameVersion.RE1,
              expansion: 'Into The Darkness',
              type: 'Scenario',
              name: '2nd Floor East C',
              quantity: 1,
              lockStatus: 'Both sides unlocked',
              isLocked: true,
              connector: 27,
              connections: [],
            },
          ],
        },
      ],
    },

    // ── Door 3: 1st Floor East → Gardens, Caves, Guard House, Aqua Ring ─
    {
      id: 'core-1st-floor-east-a',
      game: GameVersion.RE1,
      expansion: 'Core Box',
      type: 'Scenario',
      name: '1st Floor East A',
      quantity: 1,
      lockStatus: 'Both sides unlocked',
      isLocked: false,
      connector: 3,
      connections: [
        {
          id: 'core-1st-floor-east-b',
          game: GameVersion.RE1,
          expansion: 'Core Box',
          type: 'Scenario',
          name: '1st Floor East B',
          quantity: 1,
          lockStatus: 'One side locked',
          isLocked: true,
          connector: 8,
          connections: [
            // 1st Floor East C → Garden C → Caves
            {
              id: 'darkness-1st-floor-east-c',
              game: GameVersion.RE1,
              expansion: 'Into The Darkness',
              type: 'Scenario',
              name: '1st Floor East C',
              quantity: 1,
              lockStatus: 'One side locked',
              isLocked: true,
              connector: 12,
              alternates: [
                {
                  id: 'core-1st-floor-east-c',
                  game: GameVersion.RE1,
                  expansion: 'Core Box',
                  type: 'Scenario',
                  name: '1st Floor East C',
                  quantity: 1,
                  lockStatus: 'One side locked',
                  isLocked: true,
                },
              ],
              connections: [
                {
                  id: 'darkness-garden-c',
                  game: GameVersion.RE1,
                  expansion: 'Into The Darkness',
                  type: 'Scenario',
                  name: 'Garden C',
                  quantity: 1,
                  lockStatus: 'One side locked',
                  isLocked: true,
                  connector: 29,
                  connections: [
                    {
                      id: 'darkness-caves-a',
                      game: GameVersion.RE1,
                      expansion: 'Into The Darkness',
                      type: 'Scenario',
                      name: 'Caves A',
                      quantity: 1,
                      lockStatus: 'Both sides unlocked',
                      isLocked: true,
                      connector: 30,
                      connections: [
                        {
                          id: 'darkness-caves-b',
                          game: GameVersion.RE1,
                          expansion: 'Into The Darkness',
                          type: 'Scenario',
                          name: 'Caves B',
                          quantity: 1,
                          lockStatus: 'Both sides unlocked',
                          isLocked: true,
                          connector: 31,
                          connections: [
                            {
                              id: 'darkness-caves-c',
                              game: GameVersion.RE1,
                              expansion: 'Into The Darkness',
                              type: 'Scenario',
                              name: 'Caves C',
                              quantity: 1,
                              lockStatus: 'Both sides unlocked',
                              isLocked: true,
                              connector: 32,
                              connections: [],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },

            // Garden A → Garden B → Guard House → Aqua Ring
            {
              id: 'bleak-garden-a',
              game: GameVersion.RE1,
              expansion: 'Bleak Outpost',
              type: 'Scenario',
              name: 'Garden A',
              quantity: 1,
              lockStatus: 'Both sides unlocked',
              isLocked: true,
              connector: 13,
              alternates: [
                {
                  id: 'core-garden-a',
                  game: GameVersion.RE1,
                  expansion: 'Core Box',
                  type: 'Scenario',
                  name: 'Garden A',
                  quantity: 1,
                  lockStatus: 'Both sides unlocked',
                  isLocked: true,
                },
              ],
              connections: [
                {
                  id: 'bleak-garden-b',
                  game: GameVersion.RE1,
                  expansion: 'Bleak Outpost',
                  type: 'Scenario',
                  name: 'Garden B',
                  quantity: 1,
                  lockStatus: 'One side locked',
                  isLocked: true,
                  connector: 20,
                  connections: [
                    {
                      id: 'bleak-guard-house-a',
                      game: GameVersion.RE1,
                      expansion: 'Bleak Outpost',
                      type: 'Scenario',
                      name: 'Guard House A',
                      quantity: 1,
                      lockStatus: 'Both sides unlocked',
                      isLocked: true,
                      connector: 21,
                      connections: [
                        {
                          id: 'bleak-aqua-ring-a',
                          game: GameVersion.RE1,
                          expansion: 'Bleak Outpost',
                          type: 'Scenario',
                          name: 'Aqua Ring A',
                          quantity: 1,
                          lockStatus: 'Both sides unlocked',
                          isLocked: true,
                          connector: 22,
                          connections: [
                            {
                              id: 'bleak-aqua-ring-b',
                              game: GameVersion.RE1,
                              expansion: 'Bleak Outpost',
                              type: 'Scenario',
                              name: 'Aqua Ring B',
                              quantity: 1,
                              lockStatus: 'Both sides unlocked',
                              isLocked: true,
                              connector: 23,
                              connections: [
                                {
                                  id: 'bleak-guard-house-b',
                                  game: GameVersion.RE1,
                                  expansion: 'Bleak Outpost',
                                  type: 'Scenario',
                                  name: 'Guard House B',
                                  quantity: 1,
                                  lockStatus: 'Both sides unlocked',
                                  isLocked: true,
                                  connector: 24,
                                  connections: [
                                    {
                                      id: 'bleak-guard-house-c',
                                      game: GameVersion.RE1,
                                      expansion: 'Bleak Outpost',
                                      type: 'Scenario',
                                      name: 'Guard House C',
                                      quantity: 1,
                                      lockStatus: 'Both sides unlocked',
                                      isLocked: true,
                                      connector: 25,
                                      connections: [],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Door 4: Crypts B → Labs & Helipad ────────────────────────────
    {
      id: 'core-crypts-b',
      game: GameVersion.RE1,
      expansion: 'Core Box',
      type: 'Scenario',
      name: 'Crypts B',
      quantity: 1,
      lockStatus: 'One side locked',
      isLocked: true,
      connector: 4,
      connections: [
        {
          id: 'core-lab-a',
          game: GameVersion.RE1,
          expansion: 'Core Box',
          type: 'Scenario',
          name: 'Lab A',
          quantity: 1,
          lockStatus: 'One side locked',
          isLocked: true,
          connector: 9,
          connections: [
            {
              id: 'core-helipad',
              game: GameVersion.RE1,
              expansion: 'Core Box',
              type: 'Scenario',
              name: 'Helipad',
              quantity: 1,
              lockStatus: 'Both sides unlocked',
              isLocked: true,
              connector: 18,
              connections: [],
            },
            {
              id: 'core-lab-b',
              game: GameVersion.RE1,
              expansion: 'Core Box',
              type: 'Scenario',
              name: 'Lab B',
              quantity: 1,
              lockStatus: 'Both sides unlocked',
              isLocked: true,
              connector: 17,
              connections: [
                {
                  id: 'core-lab-c',
                  game: GameVersion.RE1,
                  expansion: 'Core Box',
                  type: 'Scenario',
                  name: 'Lab C',
                  quantity: 1,
                  lockStatus: 'Both sides unlocked',
                  isLocked: true,
                  connector: 19,
                  connections: [],
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Door 5: 1st Floor West → Basement ────────────────────────────
    {
      id: 'core-1st-floor-west-a',
      game: GameVersion.RE1,
      expansion: 'Core Box',
      type: 'Scenario',
      name: '1st Floor West A',
      quantity: 1,
      lockStatus: 'Both sides unlocked',
      isLocked: false,
      connector: 5,
      connections: [
        {
          id: 'core-1st-floor-west-b',
          game: GameVersion.RE1,
          expansion: 'Core Box',
          type: 'Scenario',
          name: '1st Floor West B',
          quantity: 1,
          lockStatus: 'One side locked',
          isLocked: true,
          connector: 10,
          connections: [
            {
              id: 'core-1st-floor-west-c',
              game: GameVersion.RE1,
              expansion: 'Core Box',
              type: 'Scenario',
              name: '1st Floor West C',
              quantity: 1,
              lockStatus: 'One side locked',
              isLocked: true,
              connector: 16,
              connections: [],
            },
            {
              id: 'core-basement',
              game: GameVersion.RE1,
              expansion: 'Core Box',
              type: 'Scenario',
              name: 'Basement',
              quantity: 1,
              lockStatus: 'One side locked',
              isLocked: true,
              connector: 15,
              connections: [],
            },
          ],
        },
      ],
    },

    // ── Door 6: 2nd Floor West → 3rd Floor ───────────────────────────
    {
      id: 'core-2nd-floor-west-a',
      game: GameVersion.RE1,
      expansion: 'Core Box',
      type: 'Scenario',
      name: '2nd Floor West A',
      quantity: 1,
      lockStatus: 'Both sides unlocked',
      isLocked: false,
      connector: 6,
      connections: [
        {
          id: 'core-2nd-floor-west-b',
          game: GameVersion.RE1,
          expansion: 'Core Box',
          type: 'Scenario',
          name: '2nd Floor West B',
          quantity: 1,
          lockStatus: 'One side locked',
          isLocked: true,
          connector: 11,
          connections: [
            {
              id: 'darkness-3rd-floor-a',
              game: GameVersion.RE1,
              expansion: 'Into The Darkness',
              type: 'Scenario',
              name: '3rd Floor A',
              quantity: 1,
              lockStatus: 'One side locked',
              isLocked: true,
              connector: 14,
              alternates: [
                {
                  id: 'core-3rd-floor-a',
                  game: GameVersion.RE1,
                  expansion: 'Core Box',
                  type: 'Scenario',
                  name: '3rd Floor A',
                  quantity: 1,
                  lockStatus: 'One side locked',
                  isLocked: true,
                },
              ],
              connections: [
                {
                  id: 'darkness-3rd-floor-b',
                  game: GameVersion.RE1,
                  expansion: 'Into The Darkness',
                  type: 'Scenario',
                  name: '3rd Floor B',
                  quantity: 1,
                  lockStatus: 'Both sides unlocked',
                  isLocked: true,
                  connector: 28,
                  connections: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────

/** Flattens the tree back into a plain list (includes alternates). Handy for inventory views. */
export function flattenScenarioMap(
  node: ScenarioNode = SCENARIO_MAP,
  includeAlternates = true,
): ScenarioDefinition[] {
  const { connections, alternates, connector, ...self } = node;
  return [
    self,
    ...(includeAlternates ? alternates ?? [] : []),
    ...connections.flatMap((child) => flattenScenarioMap(child, includeAlternates)),
  ];
}

/** Finds a tile by id, searching main nodes and their alternates. */
export function findScenarioNode(
  id: string,
  node: ScenarioNode = SCENARIO_MAP,
): ScenarioNode | undefined {
  if (node.id === id || node.alternates?.some((a) => a.id === id)) return node;
  for (const child of node.connections) {
    const found = findScenarioNode(id, child);
    if (found) return found;
  }
  return undefined;
}

/** Returns the path of tiles from Main Hall to the given tile id. */
export function getPathTo(
  id: string,
  node: ScenarioNode = SCENARIO_MAP,
  path: ScenarioNode[] = [],
): ScenarioNode[] | undefined {
  const next = [...path, node];
  if (node.id === id || node.alternates?.some((a) => a.id === id)) return next;
  for (const child of node.connections) {
    const found = getPathTo(id, child, next);
    if (found) return found;
  }
  return undefined;
}
