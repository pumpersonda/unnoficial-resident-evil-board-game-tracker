import React, { useEffect } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { FullScreenModal } from '@/components/shared/FullScreenModal';

import { Button, ButtonText } from '@/components/ui/button';

import { Input, InputField } from '@/components/ui/input';

import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from '@/components/ui/select';

import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

import { Campaign, GameVersion } from '@/types';
import { ENABLED_GAMES, GAME_LABELS, isGameEnabled } from '@/constants/gameVersions';

// Zod Schema
const createCampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'The name should have at least 3 characters'),
  gameVersion: z.enum(['RE1', 'RE2', 'RE3']).refine(value => isGameEnabled(value as GameVersion), {
    message: 'This game is not available yet',
  }),
  difficulty: z.enum(['Easy', 'Normal', 'Hard']),
});

export type CreateCampaignForm = z.infer<typeof createCampaignSchema>;

const DEFAULT_VALUES: CreateCampaignForm = {
  id: undefined,
  name: '',
  gameVersion: 'RE1',
  difficulty: 'Normal',
};

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateCampaignForm) => void;
  editingCampaign?: Campaign | null;
}

export default function CreateCampaignModal({
  isOpen,
  onClose,
  onCreate,
  editingCampaign,
}: CreateCampaignModalProps) {
  const isEditing = !!editingCampaign;
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateCampaignForm>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  useEffect(() => {
    if (!isOpen) return;

    if (editingCampaign) {
      reset({
        id: editingCampaign.id,
        name: editingCampaign.name,
        gameVersion: editingCampaign.game,
        difficulty: editingCampaign.difficulty,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [isOpen, editingCampaign, reset]);

  const onSubmit = (data: CreateCampaignForm) => {
    onCreate(data);
    onClose();
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Campaign' : 'Create New Campaign'}
      footer={
        <HStack space="md" className="w-full">
          <Button variant="outline" className="flex-1 border-border" onPress={onClose}>
            <ButtonText className="text-muted-foreground">Cancel</ButtonText>
          </Button>
          <Button
            className="flex-1 bg-destructive active:opacity-90"
            onPress={handleSubmit(onSubmit)}
            isDisabled={!isValid}
          >
            <ButtonText>{isEditing ? 'Save Changes' : 'Create Campaign'}</ButtonText>
          </Button>
        </HStack>
      }
    >
      <VStack space="lg">
        {/* Name */}
        <VStack space="xs">
          <Text className="text-muted-foreground text-sm">Campaign Name</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <Input className="bg-background border-border border">
                <InputField
                  placeholder="Enter campaign name"
                  value={value}
                  onChangeText={onChange}
                  className="text-foreground"
                />
              </Input>
            )}
          />
          {errors.name && <Text className="text-destructive text-sm">{errors.name.message}</Text>}
        </VStack>

        {/* Game Version */}
        <VStack space="xs">
          <Text className="text-muted-foreground text-sm">Game Version</Text>
          <Controller
            control={control}
            name="gameVersion"
            render={({ field: { onChange, value } }) => (
              <Select selectedValue={value} onValueChange={onChange} isDisabled={isEditing}>
                <SelectTrigger
                  className={`bg-background border-border${isEditing ? ' opacity-50' : ''}`}
                >
                  <SelectInput placeholder="Select version" className="text-foreground" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent className="bg-card">
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {ENABLED_GAMES.map(game => (
                      <SelectItem key={game} label={GAME_LABELS[game]} value={game} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}
          />
        </VStack>

        {/* Difficulty */}
        <VStack space="xs">
          <Text className="text-muted-foreground text-sm">Difficulty</Text>
          <Controller
            control={control}
            name="difficulty"
            render={({ field: { onChange, value } }) => (
              <Select selectedValue={value} onValueChange={onChange}>
                <SelectTrigger className="bg-background border-border">
                  <SelectInput placeholder="Select difficulty" className="text-foreground" />
                  <SelectIcon />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent className="bg-card">
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <SelectItem label="Easy" value="Easy" />
                    <SelectItem label="Normal" value="Normal" />
                    <SelectItem label="Hard" value="Hard" />
                  </SelectContent>
                </SelectPortal>
              </Select>
            )}
          />
        </VStack>
      </VStack>
    </FullScreenModal>
  );
}
