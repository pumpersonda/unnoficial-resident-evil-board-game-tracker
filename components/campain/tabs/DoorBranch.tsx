import React, { useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { THEME_COLORS } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { ResolvedDoor, ResolvedScenarioNode } from '@/data/RE1/scenarioTree';
import { ScenarioTreeNode } from '@/components/campain/tabs/ScenarioTreeNode';

interface DoorBranchProps {
  door: ResolvedDoor;
  onToggleComplete: (nodeId: string, isCompleted: boolean) => void;
  onRequestUnlock: (node: ResolvedScenarioNode) => void;
}

export const DoorBranch: React.FC<DoorBranchProps> = ({
  door,
  onToggleComplete,
  onRequestUnlock,
}) => {
  const resolvedTheme = useResolvedTheme();
  const colors = THEME_COLORS[resolvedTheme];
  // Branches with progress beyond their own root open by default; untouched ones stay tidy.
  const [isExpanded, setIsExpanded] = useState(door.unlockedCount > 1);

  const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;

  return (
    <Card className="bg-card border border-border rounded-2xl overflow-hidden p-0 gap-0">
      <Pressable
        onPress={() => setIsExpanded(prev => !prev)}
        className="p-4 active:opacity-80"
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${door.root.name} path`}
      >
        <HStack space="sm" className="items-center justify-between">
          <HStack space="sm" className="items-center flex-1">
            <ChevronIcon color={colors.mutedForeground} size={18} />
            <Text className="text-foreground font-bold flex-1">
              {door.root.connector !== undefined ? `Door ${door.root.connector} · ` : ''}
              {door.root.name}
            </Text>
          </HStack>
          <Text className="text-muted-foreground text-xs font-semibold">
            {door.unlockedCount}/{door.totalCount} unlocked
          </Text>
        </HStack>
      </Pressable>

      {isExpanded && (
        <ScrollView horizontal showsHorizontalScrollIndicator className="px-4 pb-4">
          <ScenarioTreeNode
            node={door.root}
            onToggleComplete={onToggleComplete}
            onRequestUnlock={onRequestUnlock}
          />
        </ScrollView>
      )}
    </Card>
  );
};
