import React from 'react';
import { Download, Pen, Trash2 } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';
import { GameVersion } from '@/types';
import { DANGER_LEVEL_BADGE_CLASSES, getDangerLevelColor } from '@/constants/dangerLevel';

export interface CampaignCardProps {
  id: string;
  name: string;
  game: GameVersion;
  difficulty: string;
  dangerLevel: number;
  onPress: (id: string) => void;
  onEdit: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CampaignCard({
  id,
  name,
  game,
  difficulty,
  dangerLevel,
  onPress,
  onEdit,
  onDownload,
  onDelete,
}: CampaignCardProps) {
  const resolvedTheme = useResolvedTheme();
  const dangerColor = getDangerLevelColor(game, dangerLevel);

  return (
    <Pressable key={id} onPress={() => onPress(id)}>
      <Card className="p-4 bg-card border border-border rounded-2xl">
        <VStack className="gap-2">
          <HStack className="justify-between items-center">
            <Text className="text-foreground text-xl font-semibold text-ellipsis">{name}</Text>
            <HStack space="sm" className="items-center">
              <Text className="text-muted-foreground">{game}</Text>
              <Pressable onPress={() => onEdit(id)} className="p-1 active:opacity-70">
                <Pen color={THEME_COLORS[resolvedTheme].mutedForeground} size={18} />
              </Pressable>
              <Pressable onPress={() => onDownload(id)} className="p-1 active:opacity-70">
                <Download color={THEME_COLORS[resolvedTheme].mutedForeground} size={18} />
              </Pressable>
              <Pressable onPress={() => onDelete(id)} className="p-1 active:opacity-70">
                <Trash2 color={THEME_COLORS[resolvedTheme].mutedForeground} size={18} />
              </Pressable>
            </HStack>
          </HStack>

          <HStack className="justify-between items-center">
            <Text className="text-muted-foreground">{difficulty}</Text>
            {dangerColor && (
              <Text
                className={`text-xs font-semibold px-2 py-0.5 border rounded-full ${DANGER_LEVEL_BADGE_CLASSES[dangerColor]}`}
              >
                {dangerLevel}
              </Text>
            )}
          </HStack>
        </VStack>
      </Card>
    </Pressable>
  );
}
