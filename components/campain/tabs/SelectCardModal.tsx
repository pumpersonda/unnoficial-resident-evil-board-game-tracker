import React, { useMemo, useState } from 'react';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Search, X } from 'lucide-react-native';
import { Card as CardModel, CardType, GameVersion } from '@/types';
import { TensionCard } from '@/data/RE1/tension';
import { getGameCards } from '@/data';
import {
  groupByTensionColor,
  isTensionCard,
  TENSION_ACCENT_CLASSES,
  TENSION_TEXT_CLASSES,
} from './tensionCardDisplay';
import { sortBySpecialId } from '@/utils/cards';

interface SelectCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameVersion;
  cardType: CardType;
  mode: 'added' | 'discarded';
  onSelect: (cardType: CardType, card: CardModel) => void;
}

export const SelectCardModal: React.FC<SelectCardModalProps> = ({
  isOpen,
  onClose,
  game,
  cardType,
  mode,
  onSelect,
}) => {
  const [query, setQuery] = useState('');

  const cards = useMemo(() => getGameCards(game)[cardType] ?? [], [game, cardType]);
  const normalizedQuery = query.trim().toLowerCase();

  const visibleCards = useMemo(() => {
    if (!normalizedQuery) return cards;
    return cards.filter(card => card.name.toLowerCase().includes(normalizedQuery));
  }, [cards, normalizedQuery]);

  const groupedTensionCards = useMemo(() => {
    if (cardType !== 'Tension') return null;
    return groupByTensionColor(visibleCards, card => (card as TensionCard).color).map(
      ([color, group]) => [color, sortBySpecialId(group, card => card.specialId)] as const
    );
  }, [cardType, visibleCards]);

  const sortedVisibleCards = useMemo(
    () => sortBySpecialId(visibleCards, card => card.specialId),
    [visibleCards]
  );

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const actionLabel = mode === 'added' ? 'Add' : 'Discard';

  const renderCardRow = (card: CardModel, isLast: boolean) => {
    const accentClass = isTensionCard(card)
      ? TENSION_ACCENT_CLASSES[card.color]
      : 'border-l-border';

    return (
      <Pressable
        key={card.id}
        onPress={() => onSelect(cardType, { ...card, quantity: 1 })}
        className={`flex-row items-center justify-between gap-3 border-l-4 ${accentClass} px-3 py-3 active:bg-muted/40 ${
          isLast ? '' : 'border-b border-b-border'
        }`}
      >
        <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
          {card.name}
        </Text>
        {card.specialId !== undefined && (
          <Text className="text-muted-foreground text-xs">#{card.specialId}</Text>
        )}
      </Pressable>
    );
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`${actionLabel} a ${cardType} Card`}
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
            placeholder="Search cards by name..."
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
        {visibleCards.length === 0 ? (
          <VStack className="items-center justify-center py-16">
            <Text className="text-muted-foreground text-center">
              {normalizedQuery
                ? `No cards match "${query.trim()}".`
                : 'No card data available for this category yet.'}
            </Text>
          </VStack>
        ) : groupedTensionCards ? (
          <VStack space="lg">
            {groupedTensionCards.map(([color, group]) => (
              <VStack key={color} space="sm">
                <Text className={`text-base font-bold ${TENSION_TEXT_CLASSES[color]}`}>
                  {color}
                </Text>
                <VStack className="bg-background border border-border rounded-xl overflow-hidden">
                  {group.map((card, index) => renderCardRow(card, index === group.length - 1))}
                </VStack>
              </VStack>
            ))}
          </VStack>
        ) : (
          <VStack className="bg-background border border-border rounded-xl overflow-hidden">
            {sortedVisibleCards.map((card, index) =>
              renderCardRow(card, index === sortedVisibleCards.length - 1)
            )}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
