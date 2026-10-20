import React, { useState } from 'react';
import { View } from 'react-native';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Button, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Check, Droplet, Plus } from 'lucide-react-native';
import {
  CampaignCharacter,
  Campaign,
  getHealthColor,
  HealthValue,
  HEALTH_LABELS,
  KEROSENE_COLOR,
  KEROSENE_MAX,
} from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';
import { AssignItemModal } from './AssignItemModal';
import { PipTrack } from './PipTrack';

interface EditCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  campaignCharacter: CampaignCharacter | null;
}

export const EditCharacterModal: React.FC<EditCharacterModalProps> = ({
  isOpen,
  onClose,
  campaign,
  campaignCharacter,
}) => {
  const resolvedTheme = useResolvedTheme();
  const updateCharacterPlayerName = useCampaignStore(state => state.updateCharacterPlayerName);
  const updateCharacterHealth = useCampaignStore(state => state.updateCharacterHealth);
  const updateCharacterKerosene = useCampaignStore(state => state.updateCharacterKerosene);
  const removeItemFromCharacter = useCampaignStore(state => state.removeItemFromCharacter);
  const setCharacterReserved = useCampaignStore(state => state.setCharacterReserved);
  const addItemToBox = useCampaignStore(state => state.addItemToBox);

  const [playerName, setPlayerName] = useState('');
  const [isAssignItemModalOpen, setIsAssignItemModalOpen] = useState(false);
  const [lastCharacterId, setLastCharacterId] = useState(campaignCharacter?.character.id);

  if (campaignCharacter?.character.id !== lastCharacterId) {
    setLastCharacterId(campaignCharacter?.character.id);
    setPlayerName(campaignCharacter?.controlledBy.realName ?? '');
  }

  if (!campaignCharacter) return null;

  const characterId = campaignCharacter.character.id;
  const isInTheReserve = campaignCharacter.isInTheReserve;

  const handleSavePlayerName = () => {
    const trimmed = playerName.trim();
    if (trimmed !== campaignCharacter.controlledBy.realName) {
      updateCharacterPlayerName(characterId, trimmed);
    }
  };

  const handleReturnToBox = (itemId: string) => {
    const item = campaignCharacter.inventory.find(i => i.id === itemId);
    if (!item) return;
    removeItemFromCharacter(characterId, itemId, 1);
    addItemToBox({ ...item, quantity: 1 });
  };

  const handleHealthChange = (value: number) => {
    updateCharacterHealth(characterId, {
      ...campaignCharacter.health,
      value: value as HealthValue,
    });
  };

  const handleTogglePoisoned = (isPoisoned: boolean) => {
    updateCharacterHealth(characterId, { ...campaignCharacter.health, isPoisoned });
  };

  const healthColor = getHealthColor(campaignCharacter.health);
  const mutedIconColor = THEME_COLORS[resolvedTheme].mutedForeground;

  return (
    <>
      <FullScreenModal
        isOpen={isOpen && !isAssignItemModalOpen}
        onClose={onClose}
        title={`Edit ${campaignCharacter.character.name}`}
        footer={
          <Button className="flex-1 bg-secondary active:opacity-90" onPress={onClose}>
            <ButtonText className="text-secondary-foreground">Done</ButtonText>
          </Button>
        }
      >
        <VStack space="lg" className="pb-4">
          <Checkbox
            value="in-the-reserve"
            isChecked={isInTheReserve}
            isDisabled={campaignCharacter.isReserveOnly}
            onChange={checked => setCharacterReserved(characterId, checked)}
          >
            <CheckboxIndicator>
              <CheckboxIcon as={Check} />
            </CheckboxIndicator>
            <CheckboxLabel>In Reserve</CheckboxLabel>
          </Checkbox>

          {!isInTheReserve && (
            <VStack space="sm">
              <Text className="text-foreground font-semibold">Player Name</Text>
              <Input className="bg-background">
                <InputField
                  placeholder="Player name (optional)"
                  value={playerName}
                  onChangeText={setPlayerName}
                  onEndEditing={handleSavePlayerName}
                  autoCorrect={false}
                  returnKeyType="done"
                />
              </Input>
            </VStack>
          )}

          <VStack space="sm">
            <HStack className="items-center justify-between">
              <Text className="text-foreground font-semibold">Health</Text>
              <Text className="text-sm font-medium" style={{ color: healthColor }}>
                {HEALTH_LABELS[campaignCharacter.health.value]}
              </Text>
            </HStack>
            <PipTrack
              length={5}
              value={campaignCharacter.health.value}
              onChange={handleHealthChange}
              accessibilityLabel="Health"
              renderPip={filled => (
                <View
                  className="w-7 h-7 rounded-full border border-border"
                  style={
                    filled ? { backgroundColor: healthColor, borderColor: healthColor } : undefined
                  }
                />
              )}
            />
            {!isInTheReserve && (
              <Checkbox
                value="poisoned"
                isChecked={campaignCharacter.health.isPoisoned}
                onChange={handleTogglePoisoned}
              >
                <CheckboxIndicator>
                  <CheckboxIcon as={Check} />
                </CheckboxIndicator>
                <CheckboxLabel>Poisoned</CheckboxLabel>
              </Checkbox>
            )}
          </VStack>

          {!isInTheReserve && campaignCharacter.kerosene !== undefined && (
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <HStack space="xs" className="items-center">
                  <Droplet color={KEROSENE_COLOR} size={18} />
                  <Text className="text-foreground font-semibold">Kerosene</Text>
                </HStack>
                <Text className="text-muted-foreground text-sm">
                  {campaignCharacter.kerosene}/{KEROSENE_MAX}
                </Text>
              </HStack>
              <PipTrack
                length={KEROSENE_MAX}
                value={campaignCharacter.kerosene}
                onChange={value => updateCharacterKerosene(characterId, value)}
                accessibilityLabel="Kerosene"
                renderPip={filled => (
                  <Droplet
                    color={filled ? KEROSENE_COLOR : mutedIconColor}
                    fill={filled ? KEROSENE_COLOR : 'none'}
                    size={20}
                  />
                )}
              />
            </VStack>
          )}

          {!isInTheReserve && (
            <VStack space="sm">
              <HStack className="items-center justify-between">
                <Text className="text-foreground font-semibold">Inventory</Text>
                <Pressable
                  onPress={() => setIsAssignItemModalOpen(true)}
                  className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-destructive active:opacity-90"
                >
                  <Plus color="white" size={16} />
                  <Text className="text-white text-sm font-medium">Add Item</Text>
                </Pressable>
              </HStack>

              {campaignCharacter.inventory.length === 0 ? (
                <Text className="text-muted-foreground text-sm">No items assigned yet.</Text>
              ) : (
                <VStack className="bg-background border border-border rounded-xl overflow-hidden">
                  {campaignCharacter.inventory.map((item, index) => {
                    const isLast = index === campaignCharacter.inventory.length - 1;

                    return (
                      <HStack
                        key={item.id}
                        className={`items-center justify-between gap-3 px-3 py-3 ${
                          isLast ? '' : 'border-b border-b-border'
                        }`}
                      >
                        <VStack className="flex-1">
                          <Text className="text-foreground font-medium" numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text className="text-muted-foreground text-xs capitalize">
                            {item.itemType}
                          </Text>
                        </VStack>
                        <Text className="text-muted-foreground text-xs">x{item.quantity}</Text>
                        <Pressable
                          onPress={() => handleReturnToBox(item.id)}
                          className="px-3 py-1 rounded-full active:bg-destructive/10"
                          accessibilityLabel="Return item to box"
                        >
                          <Text className="text-destructive text-xs font-medium">Return</Text>
                        </Pressable>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </VStack>
          )}
        </VStack>
      </FullScreenModal>

      <AssignItemModal
        isOpen={isAssignItemModalOpen}
        onClose={() => setIsAssignItemModalOpen(false)}
        campaign={campaign}
        characterId={characterId}
      />
    </>
  );
};
