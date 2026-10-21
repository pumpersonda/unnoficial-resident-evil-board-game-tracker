import React, { useMemo } from 'react';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ChevronRight } from 'lucide-react-native';
import { Card as CardModel, CardType, GameVersion } from '@/types';
import { getGameCards } from '@/data';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';

interface SelectCardCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameVersion;
  mode: 'added' | 'discarded';
  onSelectCategory: (cardType: CardType) => void;
}

export const SelectCardCategoryModal: React.FC<SelectCardCategoryModalProps> = ({
  isOpen,
  onClose,
  game,
  mode,
  onSelectCategory,
}) => {
  const resolvedTheme = useResolvedTheme();

  const categories = useMemo(
    () =>
      (Object.entries(getGameCards(game)) as [CardType, CardModel[]][])
        .filter(([cardType, cards]) => cardType !== 'Item' && cards.length > 0)
        .map(([cardType]) => cardType),
    [game]
  );

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'added' ? 'Add a Card' : 'Discard a Card'}
    >
      <VStack className="bg-background border border-border rounded-xl overflow-hidden">
        {categories.map((cardType, index) => (
          <Pressable
            key={cardType}
            onPress={() => onSelectCategory(cardType)}
            className={`flex-row items-center justify-between px-3 py-3 active:bg-muted/40 ${
              index === categories.length - 1 ? '' : 'border-b border-border'
            }`}
          >
            <Text className="text-foreground font-medium">{cardType}</Text>
            <ChevronRight color={THEME_COLORS[resolvedTheme].mutedForeground} size={18} />
          </Pressable>
        ))}
      </VStack>
    </FullScreenModal>
  );
};
