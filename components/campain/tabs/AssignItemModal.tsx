import React, { useMemo, useState } from 'react';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { ItemCategoryBadge } from '@/components/shared/ItemCategoryBadge';
import { ItemIcon } from '@/components/shared/ItemIcon';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Search, X } from 'lucide-react-native';
import { Campaign } from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { groupItemsByCategory } from '@/utils/items';

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

  const groupedItems = useMemo(() => groupItemsByCategory(visibleItems), [visibleItems]);

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
          <VStack space="lg">
            {groupedItems.map(([category, group]) => (
              <VStack key={category} space="sm">
                <Text className="text-foreground text-lg font-bold">Category {category}</Text>
                <VStack className="bg-background border border-border rounded-xl overflow-hidden">
                  {group.map((item, index) => {
                    const isLast = index === group.length - 1;

                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleAssign(item.id)}
                        className={`flex-row items-center justify-between gap-3 px-3 py-3 active:bg-muted/40 ${
                          isLast ? '' : 'border-b border-b-border'
                        }`}
                      >
                        <HStack className="items-center gap-3 flex-1">
                          <ItemIcon item={item} />
                          <HStack className="items-center gap-2 flex-1">
                            <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
                              {item.name}
                            </Text>
                            {item.specialId !== undefined && (
                              <Text className="text-muted-foreground text-xs">
                                #{item.specialId}
                              </Text>
                            )}
                          </HStack>
                        </HStack>
                        <HStack className="items-center gap-2">
                          <Text className="text-muted-foreground text-xs">x{item.quantity}</Text>
                          <ItemCategoryBadge category={category} />
                        </HStack>
                      </Pressable>
                    );
                  })}
                </VStack>
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
