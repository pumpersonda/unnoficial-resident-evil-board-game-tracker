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
import { GameVersion, Item } from '@/types';
import { getGameCards } from '@/data';
import { groupItemsByCategory } from '@/utils/items';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameVersion;
  onAddItem: (item: Item) => void;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, game, onAddItem }) => {
  const [query, setQuery] = useState('');

  const items = useMemo(() => (getGameCards(game).Item ?? []) as Item[], [game]);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter(item => item.name.toLowerCase().includes(normalizedQuery));
  }, [items, normalizedQuery]);

  const groupedItems = useMemo(() => groupItemsByCategory(visibleItems), [visibleItems]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Item to Box"
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
            placeholder="Search items by name..."
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
              {normalizedQuery
                ? `No items match "${query.trim()}".`
                : 'No item data available yet.'}
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
                        onPress={() => onAddItem({ ...item, quantity: 1 })}
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
                        <ItemCategoryBadge category={category} />
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
