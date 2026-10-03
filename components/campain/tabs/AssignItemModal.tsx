import React, { useMemo, useState } from 'react';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Search, X } from 'lucide-react-native';
import { Campaign } from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';

interface AssignItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  characterId: string;
}

export const AssignItemModal: React.FC<AssignItemModalProps> = ({
  isOpen,
  onClose,
  campaign,
  characterId,
}) => {
  const [query, setQuery] = useState('');
  const removeFromItemsBox = useCampaignStore(state => state.removeFromItemsBox);
  const addItemToActiveCharacter = useCampaignStore(state => state.addItemToActiveCharacter);
  const toast = useToast();

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return campaign.itemsBox;
    return campaign.itemsBox.filter(item => item.name.toLowerCase().includes(normalizedQuery));
  }, [campaign.itemsBox, normalizedQuery]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleAssign = (itemId: string) => {
    const item = campaign.itemsBox.find(i => i.id === itemId);
    if (!item) return;
    removeFromItemsBox(item.id, 1);
    addItemToActiveCharacter(characterId, { ...item, quantity: 1 });

    const characterName = campaign.activeCharacters.find(ac => ac.character.id === characterId)
      ?.character.name;

    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle className="font-semibold text-success">Item assigned</ToastTitle>
          <ToastDescription size="sm">
            {characterName
              ? `"${item.name}" was assigned to ${characterName}.`
              : `"${item.name}" was assigned.`}
          </ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign Item"
      footer={
        <Button className="flex-1 bg-secondary active:opacity-90" onPress={handleClose}>
          <ButtonText className="text-secondary-foreground">Done</ButtonText>
        </Button>
      }
      stickyTop={
        <Input className="bg-background">
          <InputSlot className="pl-3">
            <InputIcon as={Search} />
          </InputSlot>
          <InputField
            placeholder="Search item box by name..."
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <InputSlot className="pr-3" onPress={() => setQuery('')}>
              <InputIcon as={X} />
            </InputSlot>
          )}
        </Input>
      }
    >
      <VStack space="lg" className="pb-4">
        {visibleItems.length === 0 ? (
          <VStack className="items-center justify-center py-16">
            <Text className="text-muted-foreground text-center">
              {normalizedQuery ? `No items match "${query.trim()}".` : 'The item box is empty.'}
            </Text>
          </VStack>
        ) : (
          <VStack className="bg-background border border-border rounded-xl overflow-hidden">
            {visibleItems.map((item, index) => {
              const isLast = index === visibleItems.length - 1;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => handleAssign(item.id)}
                  className={`flex-row items-center justify-between gap-3 px-3 py-3 active:bg-muted/40 ${
                    isLast ? '' : 'border-b border-b-border'
                  }`}
                >
                  <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs">x{item.quantity}</Text>
                </Pressable>
              );
            })}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
