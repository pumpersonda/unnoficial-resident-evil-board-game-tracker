import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { Campaign, Card as CardModel, CardType } from '@/types';
import { TensionCard } from '@/data/RE1/tension';
import { getGameCardData } from '@/data';
import { useCampaignStore } from '@/store/campaignStore';
import { Info, Plus, Trash2 } from 'lucide-react-native';
import {
  groupByTensionColor,
  isTensionCard,
  TENSION_ACCENT_CLASSES,
  TENSION_TEXT_CLASSES,
} from './tensionCardDisplay';
import { sortBySpecialId } from '@/utils/cards';
import { SelectCardModal } from './SelectCardModal';
import { SelectCardCategoryModal } from './SelectCardCategoryModal';
import { CardsInfoModal } from './CardsInfoModal';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';

interface CardsTabProps {
  campaign: Campaign;
}

type CardsMode = 'added' | 'discarded';

export const CardsTab: React.FC<CardsTabProps> = ({ campaign }) => {
  const resolvedTheme = useResolvedTheme();
  const [mode, setMode] = useState<CardsMode>('added');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CardType | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [cardPendingRemoval, setCardPendingRemoval] = useState<{
    cardType: CardType;
    id: string;
    name: string;
  } | null>(null);

  const addedCard = useCampaignStore(state => state.addedCard);
  const removeFromAddedCards = useCampaignStore(state => state.removeFromAddedCards);
  const discardCard = useCampaignStore(state => state.discardCard);
  const removeFromDiscardedCard = useCampaignStore(state => state.removeFromDiscardedCard);
  const toast = useToast();

  const cardsByCategory = mode === 'added' ? campaign.addedCards : campaign.discardedCards;
  const onRemove = mode === 'added' ? removeFromAddedCards : removeFromDiscardedCard;
  const emptyMessage = mode === 'added' ? 'No cards added yet.' : 'No cards discarded yet.';

  const categories = Object.entries(cardsByCategory) as [CardType, CardModel[]][];
  const nonEmptyCategories = categories.filter(
    ([cardType, cards]) => cardType !== 'Item' && cards.length > 0
  );

  const handleSelectCard = (cardType: CardType, card: CardModel) => {
    if (mode === 'added') {
      addedCard(cardType, card);
    } else {
      discardCard(cardType, card);
    }
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle className="font-semibold text-success">
            {mode === 'added' ? 'Card added' : 'Card discarded'}
          </ToastTitle>
          <ToastDescription size="sm">
            {mode === 'added' ? `"${card.name}" was added.` : `"${card.name}" was discarded.`}
          </ToastDescription>
        </Toast>
      ),
    });
  };

  const resolveCard = (cardType: CardType, card: CardModel) =>
    getGameCardData(campaign.game, cardType, card.id) ?? card;

  const renderCardEntry = (cardType: CardType, card: CardModel) => {
    const resolved = resolveCard(cardType, card);
    const accentClass = isTensionCard(resolved)
      ? TENSION_ACCENT_CLASSES[resolved.color]
      : 'border-l-border';

    return (
      <Card
        key={card.id}
        className={`bg-card border border-border border-l-4 ${accentClass} p-4 rounded-2xl text-center`}
      >
        <HStack className="justify-between items-start">
          <HStack className="items-center gap-2 flex-1">
            <Text className="text-foreground font-semibold flex-1">{resolved.name}</Text>
            {resolved.specialId !== undefined && (
              <Text className="text-muted-foreground text-xs">#{resolved.specialId}</Text>
            )}
          </HStack>
          <Text className="text-muted-foreground font-semibold ml-2">x{card.quantity}</Text>
          <Pressable
            onPress={() => handleRequestDeleteCard(cardType, card.id, resolved.name)}
            className="px-3 rounded-full active:bg-destructive/10"
            accessibilityLabel="Eliminar carta"
          >
            <Trash2 color="gray" size={20} />
          </Pressable>
        </HStack>

        {isTensionCard(resolved) && (
          <Text className="text-muted-foreground text-sm mt-1 italic">{resolved.quote}</Text>
        )}
      </Card>
    );
  };

  const handleRequestDeleteCard = (cardType: CardType, cardId: string, cardName: string) => {
    setCardPendingRemoval({ cardType, id: cardId, name: cardName });
  };

  const handleConfirmDeleteCard = () => {
    if (!cardPendingRemoval) return;
    const { cardType, id, name } = cardPendingRemoval;
    onRemove(cardType, id, 1);
    setCardPendingRemoval(null);
    toast.show({
      placement: 'top',
      render: ({ id: toastId }) => (
        <Toast nativeID={`toast-${toastId}`} action="muted" variant="solid">
          <ToastTitle className="font-semibold text-success">Card removed</ToastTitle>
          <ToastDescription size="sm">
            {mode === 'added'
              ? `"${name}" has been removed from added cards.`
              : `"${name}" has been removed from discarded cards.`}
          </ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <VStack className="flex-1">
      <HStack className="items-center justify-between px-4 pt-4">
        <HStack className="flex-1 bg-secondary rounded-full p-1">
          {(['added', 'discarded'] as CardsMode[]).map(option => {
            const isActive = mode === option;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                className={`flex-1 items-center py-2 rounded-full ${isActive ? 'bg-destructive' : ''}`}
              >
                <Text
                  className={`font-semibold capitalize ${isActive ? 'text-white' : 'text-muted-foreground'}`}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </HStack>

        <Pressable
          onPress={() => setIsInfoModalOpen(true)}
          className="p-2 ml-2 rounded-full bg-secondary active:opacity-80"
          accessibilityLabel="Explain Added vs. Discarded cards"
        >
          <Info color={THEME_COLORS[resolvedTheme].foreground} size={20} />
        </Pressable>
      </HStack>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {nonEmptyCategories.length === 0 ? (
          <VStack className="flex-1 items-center justify-center py-12">
            <Text className="text-muted-foreground">{emptyMessage}</Text>
          </VStack>
        ) : (
          <VStack space="lg" className="pb-24">
            {nonEmptyCategories.map(([cardType, cards]) => {
              if (cardType === 'Tension') {
                const colorGroups = groupByTensionColor(
                  cards,
                  card => (resolveCard(cardType, card) as TensionCard).color
                );

                return (
                  <VStack key={cardType} space="md">
                    <Text className="text-foreground text-xl font-bold">{cardType}</Text>

                    {colorGroups.map(([color, groupCards]) => (
                      <VStack key={color} space="sm">
                        <Text className={`text-base font-bold ${TENSION_TEXT_CLASSES[color]}`}>
                          {color}
                        </Text>
                        {sortBySpecialId(groupCards, card => resolveCard(cardType, card).specialId).map(
                          card => renderCardEntry(cardType, card)
                        )}
                      </VStack>
                    ))}
                  </VStack>
                );
              }

              return (
                <VStack key={cardType} space="sm">
                  <Text className="text-foreground text-xl font-bold">{cardType}</Text>
                  {sortBySpecialId(cards, card => resolveCard(cardType, card).specialId).map(
                    card => renderCardEntry(cardType, card)
                  )}
                </VStack>
              );
            })}
          </VStack>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setIsCategoryModalOpen(true)}
        className="absolute bottom-safe-or-8 right-6 bg-destructive w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-90"
      >
        <Plus color="white" size={26} />
      </Pressable>

      <SelectCardCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        game={campaign.game}
        mode={mode}
        onSelectCategory={cardType => {
          setIsCategoryModalOpen(false);
          setSelectedCategory(cardType);
        }}
      />

      {selectedCategory && (
        <SelectCardModal
          isOpen={selectedCategory !== null}
          onClose={() => setSelectedCategory(null)}
          game={campaign.game}
          cardType={selectedCategory}
          mode={mode}
          onSelect={handleSelectCard}
        />
      )}

      <CardsInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      <AlertDialog isOpen={cardPendingRemoval !== null} onClose={() => setCardPendingRemoval(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <Text className="text-foreground text-xl font-semibold">Remove card</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-muted-foreground">
              {`Remove "${cardPendingRemoval?.name}" from ${
                mode === 'added' ? 'added' : 'discarded'
              } cards? This cannot be undone.`}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onPress={() => setCardPendingRemoval(null)}
            >
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1 bg-destructive active:opacity-90"
              onPress={handleConfirmDeleteCard}
            >
              <ButtonText>Remove</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};
