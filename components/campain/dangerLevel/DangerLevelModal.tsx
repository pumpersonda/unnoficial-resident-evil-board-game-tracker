import React, { useState } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Campaign } from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';
import {
  DANGER_LEVEL_CONFIG,
  getDangerLevelColor,
  getDangerRingColor,
} from '@/constants/dangerLevel';
import { DangerRing } from './DangerRing';
import { angleFromPoint, angleToValue, valueToThumbOffset } from '@/utils/dangerLevelGeometry';

interface DangerLevelModalProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
}

const RING_SIZE = 260;
const RING_STROKE = 22;
const THUMB_SIZE = 28;

export const DangerLevelModal: React.FC<DangerLevelModalProps> = ({
  campaign,
  isOpen,
  onClose,
}) => {
  const setDangerLevel = useCampaignStore(state => state.setDangerLevel);
  const resolvedTheme = useResolvedTheme();
  const config = DANGER_LEVEL_CONFIG[campaign.game];

  const [liveValue, setLiveValue] = useState(campaign.dangerLevel);
  const [isDragging, setIsDragging] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setLiveValue(campaign.dangerLevel);
  }

  if (!config) return null;

  const center = RING_SIZE / 2;
  const thumbRadius = (RING_SIZE - RING_STROKE) / 2;

  const commit = (next: number) => setDangerLevel(next);

  const valueFromTouch = (x: number, y: number) => {
    const angle = angleFromPoint(x, y, center, center);
    return angleToValue(angle, config.maxLevel, 1);
  };

  const handleDragUpdate = (x: number, y: number) => {
    setLiveValue(valueFromTouch(x, y));
  };

  const handleDragEnd = (x: number, y: number) => {
    setIsDragging(false);
    const next = valueFromTouch(x, y);
    setLiveValue(next);
    commit(next);
  };

  const panGesture = Gesture.Pan()
    .onStart(event => {
      runOnJS(setIsDragging)(true);
      runOnJS(handleDragUpdate)(event.x, event.y);
    })
    .onUpdate(event => {
      runOnJS(handleDragUpdate)(event.x, event.y);
    })
    .onEnd(event => {
      runOnJS(handleDragEnd)(event.x, event.y);
    });

  const step = (delta: number) => {
    const next = Math.max(0, Math.min(liveValue + delta, config.maxLevel));
    setLiveValue(next);
    commit(next);
  };

  const currentColor = getDangerLevelColor(campaign.game, liveValue) ?? 'Green';
  const ringColor = getDangerRingColor(currentColor, resolvedTheme);
  const trackColor = THEME_COLORS[resolvedTheme].track;

  const thumbOffset = valueToThumbOffset(liveValue, config.maxLevel, thumbRadius);

  return (
    <FullScreenModal isOpen={isOpen} onClose={onClose} title="Danger Level" scrollEnabled={false}>
      <VStack space="2xl" className="flex-1 items-center justify-center">
        <GestureDetector gesture={panGesture}>
          <View style={{ width: RING_SIZE, height: RING_SIZE }}>
            <DangerRing
              value={liveValue}
              max={config.maxLevel}
              size={RING_SIZE}
              strokeWidth={RING_STROKE}
              color={ringColor}
              trackColor={trackColor}
              animate={!isDragging}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: THEME_COLORS[resolvedTheme].background,
                borderWidth: 3,
                borderColor: ringColor,
                left: center + thumbOffset.dx - THUMB_SIZE / 2,
                top: center + thumbOffset.dy - THUMB_SIZE / 2,
              }}
            />
          </View>
        </GestureDetector>

        <HStack space="lg" className="items-center">
          {config.bands.map((band, index) => {
            const min = index === 0 ? 0 : config.bands[index - 1].max + 1;
            return (
              <HStack key={band.color} space="xs" className="items-center">
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getDangerRingColor(band.color, resolvedTheme),
                  }}
                />
                <Text className="text-muted-foreground text-xs">
                  {min}–{band.max}
                </Text>
              </HStack>
            );
          })}
        </HStack>

        <HStack space="3xl" className="items-center">
          <Pressable
            onPress={() => step(-1)}
            disabled={liveValue <= 0}
            accessibilityLabel="Decrease danger level"
            className="w-14 h-14 rounded-full border border-border items-center justify-center active:opacity-70"
          >
            <Minus color={THEME_COLORS[resolvedTheme].foreground} size={24} />
          </Pressable>
          <Pressable
            onPress={() => step(1)}
            disabled={liveValue >= config.maxLevel}
            accessibilityLabel="Increase danger level"
            className="w-14 h-14 rounded-full border border-border items-center justify-center active:opacity-70"
          >
            <Plus color={THEME_COLORS[resolvedTheme].foreground} size={24} />
          </Pressable>
        </HStack>
      </VStack>
    </FullScreenModal>
  );
};
