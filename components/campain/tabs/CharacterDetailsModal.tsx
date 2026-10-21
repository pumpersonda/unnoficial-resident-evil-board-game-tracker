import React from 'react';
import { Image, View } from 'react-native';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Droplet } from 'lucide-react-native';
import {
  CampaignCharacter,
  Campaign,
  GameVersion,
  getHealthColor,
  HEALTH_LABELS,
  KEROSENE_COLOR,
  KEROSENE_MAX,
} from '@/types';

interface CharacterDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  campaignCharacter: CampaignCharacter | null;
}

export const CharacterDetailsModal: React.FC<CharacterDetailsModalProps> = ({
  isOpen,
  onClose,
  campaign,
  campaignCharacter,
}) => {
  if (!campaignCharacter) return null;

  const isInTheReserve = campaignCharacter.isInTheReserve;
  const showKerosene =
    !isInTheReserve &&
    campaign.game === GameVersion.RE1 &&
    campaignCharacter.kerosene !== undefined;

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title={campaignCharacter.character.name}>
      <VStack space="lg" className="pb-4">
        <HStack space="md" className="items-center">
          <Image
            source={campaignCharacter.character.avatar}
            className="w-16 h-16 rounded-full bg-muted"
          />
          <VStack className="flex-1">
            <HStack space="sm" className="items-center">
              <Text className="text-foreground font-semibold text-lg">
                {campaignCharacter.character.name}
              </Text>
              {campaignCharacter.isAdvancedVersion && (
                <Text className="text-destructive text-xs font-semibold px-2 py-0.5 border border-destructive rounded-full">
                  Advanced
                </Text>
              )}
            </HStack>
            <HStack space="xs" className="items-center">
              <View
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: getHealthColor(campaignCharacter.health) }}
              />
              <Text className="text-muted-foreground text-sm">
                {HEALTH_LABELS[campaignCharacter.health.value]}
                {campaignCharacter.health.isPoisoned ? ' · Poisoned' : ''}
              </Text>
            </HStack>
          </VStack>
        </HStack>

        {!isInTheReserve && (
          <VStack space="sm">
            <Text className="text-foreground font-semibold">Player Name</Text>
            <Text className="text-muted-foreground">
              {campaignCharacter.controlledBy.realName || '—'}
            </Text>
          </VStack>
        )}

        {showKerosene && (
          <VStack space="sm">
            <Text className="text-foreground font-semibold">Kerosene</Text>
            <HStack space="xs" className="items-center">
              <Droplet color={KEROSENE_COLOR} size={16} />
              <Text className="text-muted-foreground">
                {campaignCharacter.kerosene}/{KEROSENE_MAX}
              </Text>
            </HStack>
          </VStack>
        )}

        {!isInTheReserve && (
          <VStack space="sm">
            <Text className="text-foreground font-semibold">Inventory</Text>

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
                    </HStack>
                  );
                })}
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
