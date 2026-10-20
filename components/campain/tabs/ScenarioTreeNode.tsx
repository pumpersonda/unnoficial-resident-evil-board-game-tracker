import React from 'react';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox';
import { Check, Lock, Unlock } from 'lucide-react-native';
import { THEME_COLORS } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { ResolvedScenarioNode } from '@/data/RE1/scenarioTree';

interface ScenarioTreeNodeProps {
  node: ResolvedScenarioNode;
  onToggleComplete: (nodeId: string, isCompleted: boolean) => void;
  onRequestUnlock: (node: ResolvedScenarioNode) => void;
}

export const ScenarioTreeNode: React.FC<ScenarioTreeNodeProps> = ({
  node,
  onToggleComplete,
  onRequestUnlock,
}) => {
  const resolvedTheme = useResolvedTheme();
  const colors = THEME_COLORS[resolvedTheme];
  const isLocked = node.status === 'Locked';
  const isCompleted = node.status === 'Completed';

  const statusColor = isCompleted ? colors.success : isLocked ? colors.mutedForeground : colors.warning;
  const StatusIcon = isCompleted ? Check : isLocked ? Lock : Unlock;

  return (
    <VStack space="sm" className="items-start">
      <HStack space="sm" className="items-center">
        <StatusIcon color={statusColor} size={16} />
        <Text
          numberOfLines={1}
          className={`font-semibold ${isLocked ? 'text-muted-foreground' : 'text-foreground'}`}
        >
          {node.name}
        </Text>

        {isLocked ? (
          <Pressable
            disabled={!node.canUnlock}
            onPress={() => onRequestUnlock(node)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-muted active:opacity-70"
            accessibilityLabel={`Unlock ${node.name}`}
            accessibilityState={{ disabled: !node.canUnlock }}
          >
            <Lock color={colors.mutedForeground} size={12} />
            <Text className="text-muted-foreground text-xs font-semibold">Unlock</Text>
          </Pressable>
        ) : (
          <Checkbox
            value={node.id}
            isChecked={isCompleted}
            onChange={() => onToggleComplete(node.id, isCompleted)}
            accessibilityLabel={`Mark ${node.name} as completed`}
          >
            <CheckboxIndicator size="lg">
              <CheckboxIcon as={Check} />
            </CheckboxIndicator>
          </Checkbox>
        )}
      </HStack>

      {node.children.length > 0 && (
        <VStack
          space="sm"
          className={`items-start ml-2 pl-3 border-l-2 ${isLocked ? 'border-border' : 'border-primary/40'}`}
        >
          {node.children.map(child => (
            <ScenarioTreeNode
              key={child.id}
              node={child}
              onToggleComplete={onToggleComplete}
              onRequestUnlock={onRequestUnlock}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
};
