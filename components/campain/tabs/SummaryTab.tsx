import React from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Campaign, Card as CardModel, CardType } from '@/types';

interface SummaryTabProps {
  campaign: Campaign;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ campaign }) => {
  const activeCharsCount = campaign.characters.filter(ch => !ch.isInTheReserve).length;
  const itemsInBoxCount = campaign.itemsBox.length;

  const countCards = (cardDict: Partial<Record<CardType, CardModel[]>>) =>
    Object.values(cardDict).reduce((acc, arr) => acc + (arr?.length || 0), 0);

  const totalAddedCards = countCards(campaign.addedCards);
  const totalDiscardedCards = countCards(campaign.discardedCards);

  return (
    <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
      <VStack space="lg" className="pb-8">
        <Text className="text-foreground text-xl font-bold">Campaign Status</Text>

        <HStack space="md">
          <Card className="flex-1 bg-card border border-border p-4 rounded-2xl items-center">
            <Text className="text-3xl text-destructive font-bold mb-1">{activeCharsCount}</Text>
            <Text className="text-muted-foreground text-sm text-center">Active Roster</Text>
          </Card>

          <Card className="flex-1 bg-card border border-border p-4 rounded-2xl items-center">
            <Text className="text-3xl text-foreground font-bold mb-1">{itemsInBoxCount}</Text>
            <Text className="text-muted-foreground text-sm text-center">Items in Box</Text>
          </Card>
        </HStack>

        <HStack space="md">
          <Card className="flex-1 bg-card border border-border p-4 rounded-2xl items-center">
            <Text className="text-3xl text-foreground font-bold mb-1">{totalAddedCards}</Text>
            <Text className="text-muted-foreground text-sm text-center">Added Cards</Text>
          </Card>

          <Card className="flex-1 bg-card border border-border p-4 rounded-2xl items-center">
            <Text className="text-3xl text-muted-foreground font-bold mb-1">
              {totalDiscardedCards}
            </Text>
            <Text className="text-muted-foreground text-sm text-center">Discarded Cards</Text>
          </Card>
        </HStack>
      </VStack>
    </ScrollView>
  );
};
