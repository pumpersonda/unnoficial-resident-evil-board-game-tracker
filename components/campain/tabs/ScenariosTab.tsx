import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Pressable } from '@/components/ui/pressable';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox';
import { Button, ButtonText } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Campaign, GameExpansion } from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { resolveScenarioTree, ResolvedScenarioNode } from '@/data/RE1/scenarioTree';
import { Check, Info } from 'lucide-react-native';
import { THEME_COLORS } from '@/constants/theme';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import NavigationInfoModal from '@/components/campain/NavigationInfoModal';
import { DoorBranch } from '@/components/campain/tabs/DoorBranch';

interface ScenariosTabProps {
  campaign: Campaign;
}

const TOGGLEABLE_EXPANSIONS: Exclude<GameExpansion, 'Core Box'>[] = [
  'Bleak Outpost',
  'Into The Darkness',
];

export const ScenariosTab: React.FC<ScenariosTabProps> = ({ campaign }) => {
  const updateScenarioStatus = useCampaignStore(state => state.updateScenarioStatus);
  const unlockScenario = useCampaignStore(state => state.unlockScenario);
  const toggleExpansion = useCampaignStore(state => state.toggleExpansion);
  const resolvedTheme = useResolvedTheme();
  const [scenarioPendingUnlock, setScenarioPendingUnlock] = useState<ResolvedScenarioNode | null>(
    null
  );
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const availableExpansions = TOGGLEABLE_EXPANSIONS.filter(expansion =>
    campaign.scenarios.some(s => s.expansion === expansion)
  );

  const doors = useMemo(() => resolveScenarioTree(campaign), [campaign]);

  const onToggleComplete = (nodeId: string, isCompleted: boolean) => {
    updateScenarioStatus(nodeId, isCompleted ? 'Unlocked' : 'Completed');
  };

  const onConfirmUnlock = () => {
    if (!scenarioPendingUnlock) return;
    unlockScenario(scenarioPendingUnlock.id);
    setScenarioPendingUnlock(null);
  };

  return (
    <VStack className="flex-1">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <HStack space="sm" className="mb-2 justify-between">
          <Text className="text-muted-foreground text-sm font-semibold">Info</Text>
          <Pressable
            onPress={() => setIsInfoOpen(true)}
            className="p-2 rounded-full bg-secondary active:opacity-80"
            accessibilityLabel="Navigation information"
          >
            <Info color={THEME_COLORS[resolvedTheme].foreground} size={20} />
          </Pressable>
        </HStack>
        {availableExpansions.length > 0 && (
          <VStack space="sm" className="pb-4 mb-2 border-b border-border">
            {availableExpansions.map(expansion => (
              <HStack key={expansion} space="sm" className="items-center justify-between">
                <Text className="text-foreground font-semibold">{expansion}</Text>
                <Checkbox
                  value={expansion}
                  isChecked={campaign.enabledExpansions.includes(expansion)}
                  onChange={() => toggleExpansion(expansion)}
                  accessibilityLabel={`Enable ${expansion}`}
                >
                  <CheckboxIndicator size="lg">
                    <CheckboxIcon as={Check} />
                  </CheckboxIndicator>
                </Checkbox>
              </HStack>
            ))}
          </VStack>
        )}

        {doors.length === 0 ? (
          <VStack className="flex-1 items-center justify-center py-12">
            <Text className="text-muted-foreground">No scenarios available for this game yet.</Text>
          </VStack>
        ) : (
          <VStack space="sm" className="pb-24">
            {doors.map(door => (
              <DoorBranch
                key={door.root.id}
                door={door}
                onToggleComplete={onToggleComplete}
                onRequestUnlock={setScenarioPendingUnlock}
              />
            ))}
          </VStack>
        )}
      </ScrollView>
      <NavigationInfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      <AlertDialog
        isOpen={scenarioPendingUnlock !== null}
        onClose={() => setScenarioPendingUnlock(null)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <Text className="text-foreground text-xl font-semibold">Unlock scenario</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-muted-foreground">
              {`Unlock "${scenarioPendingUnlock?.name}"?`}
            </Text>
            {scenarioPendingUnlock?.lockStatus && (
              <Text className="text-muted-foreground text-sm mt-2 italic">
                {scenarioPendingUnlock.lockStatus}
              </Text>
            )}
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onPress={() => setScenarioPendingUnlock(null)}
            >
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button className="flex-1 bg-destructive active:opacity-90" onPress={onConfirmUnlock}>
              <ButtonText>Unlock</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};
