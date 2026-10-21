import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { useCampaignStore } from '@/store/campaignStore';
import {
  Campaign,
  CampaignCharacter,
  getHealthColor,
  HEALTH_LABELS,
  KEROSENE_COLOR,
} from '@/types';
import { Check, Droplet, Pencil, Plus, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { CharacterDetailsModal } from './CharacterDetailsModal';
import { EditCharacterModal } from './EditCharacterModal';
import { SelectCharacterModal } from './SelectCharacterModal';

interface CharactersTabProps {
  campaign: Campaign;
}

export const CharactersTab: React.FC<CharactersTabProps> = ({ campaign }) => {
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [editingCharacterId, setEditingCharacterId] = useState<string | null>(null);
  const [viewingCharacterId, setViewingCharacterId] = useState<string | null>(null);
  const [characterPendingRemoval, setCharacterPendingRemoval] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const removeCharacter = useCampaignStore(state => state.removeCharacter);
  const setCharacterReserved = useCampaignStore(state => state.setCharacterReserved);
  const toast = useToast();

  const editingCharacter: CampaignCharacter | null =
    campaign.characters.find(ch => ch.character.id === editingCharacterId) ?? null;
  const viewingCharacter: CampaignCharacter | null =
    campaign.characters.find(ch => ch.character.id === viewingCharacterId) ?? null;

  const handleRequestRemoveCharacter = (id: string, name: string) => {
    setCharacterPendingRemoval({ id, name });
  };

  const handleConfirmRemoveCharacter = () => {
    if (!characterPendingRemoval) return;
    const { id, name } = characterPendingRemoval;
    removeCharacter(id);
    setCharacterPendingRemoval(null);
    toast.show({
      placement: 'top',
      render: ({ id: toastId }) => (
        <Toast nativeID={`toast-${toastId}`} action="muted" variant="solid">
          <ToastTitle className="font-semibold text-success">Character removed</ToastTitle>
          <ToastDescription size="sm">{`"${name}" has been removed from the campaign.`}</ToastDescription>
        </Toast>
      ),
    });
  };

  const activeRoster = campaign.characters.filter(ch => !ch.isInTheReserve);
  const reserveRoster = campaign.characters.filter(ch => ch.isInTheReserve);

  const renderCharacterCard = (campaignCharacter: CampaignCharacter) => {
    const { character, isInTheReserve } = campaignCharacter;
    const itemCount = campaignCharacter.inventory.reduce((total, item) => total + item.quantity, 0);

    return (
      <Pressable
        key={character.id}
        onPress={() => setViewingCharacterId(character.id)}
        accessibilityLabel={`View ${character.name} details`}
      >
        <Card className="bg-card border border-border p-4 rounded-2xl">
          <HStack space="md" className="items-center">
            <Image source={character.avatar} className="w-12 h-12 rounded-full bg-muted" />
            <VStack className="flex-1">
              <HStack space="sm" className="items-center">
                <Text className="text-foreground font-semibold">{character.name}</Text>
                {campaignCharacter.isAdvancedVersion && (
                  <Text className="text-destructive text-xs font-semibold px-2 py-0.5 border border-destructive rounded-full">
                    Advanced
                  </Text>
                )}
              </HStack>
              {!isInTheReserve && (
                <Text className="text-muted-foreground text-sm">
                  {campaignCharacter.controlledBy.realName || character.name}
                </Text>
              )}
              <HStack space="xs" className="items-center">
                <View
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: getHealthColor(campaignCharacter.health) }}
                />
                <Text className="text-muted-foreground text-xs">
                  {HEALTH_LABELS[campaignCharacter.health.value]}
                </Text>
                {campaignCharacter.kerosene !== undefined && (
                  <HStack space="xs" className="items-center ml-2">
                    <Droplet color={KEROSENE_COLOR} size={12} />
                    <Text className="text-muted-foreground text-xs">
                      {campaignCharacter.kerosene}
                    </Text>
                  </HStack>
                )}
              </HStack>
              {!isInTheReserve && (
                <Text className="text-muted-foreground text-xs">
                  {itemCount === 0 ? 'No items' : `${itemCount} items carried`}
                </Text>
              )}
            </VStack>
            <Pressable
              onPress={() => setEditingCharacterId(character.id)}
              className="px-3 mt-12 rounded-full active:bg-muted"
              accessibilityLabel="Edit character"
            >
              <Pencil color="gray" size={20} />
            </Pressable>
            <Pressable
              onPress={() => handleRequestRemoveCharacter(character.id, character.name)}
              className="px-3 mt-12 rounded-full active:bg-destructive/10"
              accessibilityLabel="Remove character"
            >
              <Trash2 color="gray" size={20} />
            </Pressable>
          </HStack>

          <HStack className="items-center justify-end pt-3 mt-3 border-t border-border">
            <Checkbox
              value="in-the-reserve"
              isChecked={isInTheReserve}
              isDisabled={campaignCharacter.isReserveOnly}
              onChange={checked => setCharacterReserved(character.id, checked)}
            >
              <CheckboxIndicator>
                <CheckboxIcon as={Check} />
              </CheckboxIndicator>
              <CheckboxLabel>In Reserve</CheckboxLabel>
            </Checkbox>
          </HStack>
        </Card>
      </Pressable>
    );
  };

  return (
    <VStack className="flex-1">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {campaign.characters.length === 0 ? (
          <VStack className="flex-1 items-center justify-center py-12">
            <Text className="text-muted-foreground">No characters selected yet.</Text>
          </VStack>
        ) : (
          <VStack space="lg" className="pb-24">
            {activeRoster.length > 0 && (
              <VStack space="sm">
                <Text className="text-foreground text-xl font-bold">Active Roster</Text>
                {activeRoster.map(renderCharacterCard)}
              </VStack>
            )}

            {reserveRoster.length > 0 && (
              <VStack space="sm">
                <Text className="text-foreground text-xl font-bold">Reserve</Text>
                {reserveRoster.map(renderCharacterCard)}
              </VStack>
            )}
          </VStack>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setIsSelectModalOpen(true)}
        className="absolute bottom-safe-or-8 right-6 bg-destructive w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-90"
      >
        <Plus color="white" size={26} />
      </Pressable>

      <SelectCharacterModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        campaign={campaign}
      />

      <EditCharacterModal
        isOpen={editingCharacter !== null}
        onClose={() => setEditingCharacterId(null)}
        campaign={campaign}
        campaignCharacter={editingCharacter}
      />

      <CharacterDetailsModal
        isOpen={viewingCharacter !== null}
        onClose={() => setViewingCharacterId(null)}
        campaign={campaign}
        campaignCharacter={viewingCharacter}
      />

      <AlertDialog
        isOpen={characterPendingRemoval !== null}
        onClose={() => setCharacterPendingRemoval(null)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <Text className="text-foreground text-xl font-semibold">Remove character</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-muted-foreground">
              {`Remove "${characterPendingRemoval?.name}" from the campaign? This cannot be undone.`}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onPress={() => setCharacterPendingRemoval(null)}
            >
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1 bg-destructive active:opacity-90"
              onPress={handleConfirmRemoveCharacter}
            >
              <ButtonText>Remove</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};
