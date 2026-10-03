import React, { useMemo, useState } from 'react';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Search, X } from 'lucide-react-native';
import { GameVersion, Item } from '@/types';
import { getGameCards } from '@/data';

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
          <VStack className="bg-background border border-border rounded-xl overflow-hidden">
            {visibleItems.map((item, index) => {
              const isLast = index === visibleItems.length - 1;

              return (
                <Pressable
                  key={item.id}
                  onPress={() => onAddItem({ ...item, quantity: 1 })}
                  className={`flex-row items-center justify-between gap-3 px-3 py-3 active:bg-muted/40 ${
                    isLast ? '' : 'border-b border-b-border'
                  }`}
                >
                  <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-muted-foreground text-xs">{item.category}</Text>
                </Pressable>
              );
            })}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
