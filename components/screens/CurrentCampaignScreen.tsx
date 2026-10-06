import React, { useCallback, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, useWindowDimensions, View } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { useCurrentCampaign } from '@/store/campaignStore';
import { CampaignTabBar, TabOption } from '@/components/campain/CampaignTabBar';
import { SummaryTab } from '@/components/campain/tabs/SummaryTab';
import { CardsTab } from '@/components/campain/tabs/CardsTab';
import { ItemBoxTab } from '@/components/campain/tabs/ItemBoxTab';
import { CharactersTab } from '@/components/campain/tabs/CharactersTab';
import { ScenariosTab } from '@/components/campain/tabs/ScenariosTab';
import { CampaignHeader } from '@/components/campain/CampaignHeader';
import { Campaign } from '@/types';

const TAB_ORDER: TabOption[] = ['Summary', 'Characters', 'ItemBox', 'Cards', 'Scenarios'];

const TAB_CONTENT: Record<TabOption, React.FC<{ campaign: Campaign }>> = {
  Summary: SummaryTab,
  Characters: CharactersTab,
  ItemBox: ItemBoxTab,
  Cards: CardsTab,
  Scenarios: ScenariosTab,
};

export default function CurrentCampaignScreen() {
  const campaign = useCurrentCampaign();
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<TabOption>('Summary');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabOption>>(() => new Set(['Summary']));
  const scrollRef = useRef<ScrollView>(null);
  const isProgrammaticScroll = useRef(false);

  const goToTab = useCallback(
    (tab: TabOption) => {
      setVisitedTabs(prev => (prev.has(tab) ? prev : new Set(prev).add(tab)));
      setActiveTab(tab);
      isProgrammaticScroll.current = true;
      scrollRef.current?.scrollTo({ x: TAB_ORDER.indexOf(tab) * width, animated: true });
    },
    [width]
  );

  const handleScrollSettled = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isProgrammaticScroll.current) {
        isProgrammaticScroll.current = false;
        return;
      }
      const index = Math.round(event.nativeEvent.contentOffset.x / width);
      const tab = TAB_ORDER[index];
      if (!tab) return;
      setVisitedTabs(prev => (prev.has(tab) ? prev : new Set(prev).add(tab)));
      setActiveTab(tab);
    },
    [width]
  );

  const pages = useMemo(
    () =>
      TAB_ORDER.map(tab => {
        const TabContent = TAB_CONTENT[tab];
        return (
          <View key={tab} style={{ width }}>
            {visitedTabs.has(tab) && campaign ? <TabContent campaign={campaign} /> : null}
          </View>
        );
      }),
    [width, visitedTabs, campaign]
  );

  if (!campaign) {
    return (
      <VStack className="flex-1 bg-background items-center justify-center p-4 pt-safe">
        <Text className="text-muted-foreground">No active campaign selected.</Text>
      </VStack>
    );
  }

  return (
    <VStack className="flex-1 bg-background pt-safe">
      <CampaignHeader campaign={campaign} />
      <CampaignTabBar activeTab={activeTab} onTabChange={goToTab} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollSettled}
        onScrollEndDrag={handleScrollSettled}
        className="flex-1"
      >
        {pages}
      </ScrollView>
    </VStack>
  );
}
