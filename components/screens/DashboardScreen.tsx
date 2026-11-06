import React, { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Biohazard, Info, MonitorSmartphone, Moon, Plus, Sun, Upload } from 'lucide-react-native';
import CampaignCard from '@/components/campain/CampaignCard';
import CreateCampaignModal, { CreateCampaignForm } from '@/components/screens/CreateCampaignModal';
import DisclaimerModal from '@/components/screens/DisclaimerModal';
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
import { useCampaignStore } from '@/store/campaignStore';
import { useThemeStore } from '@/store/themeStore';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';
import { Campaign, ThemeMode } from '@/types';
import { exportCampaignToFile, pickCampaignJson } from '@/utils/campaignFile';
import { normalizeImportedCampaign } from '@/utils/campaignTransfer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/components/navigation/types';

const NEXT_THEME_MODE: Record<ThemeMode, ThemeMode> = {
  light: 'dark',
  dark: 'red',
  red: 'system',
  system: 'light',
};

const THEME_MODE_ICON = {
  light: Sun,
  dark: Moon,
  red: Biohazard,
  system: MonitorSmartphone,
} as const;

export default function DashboardScreen() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [campaignBeingEdited, setCampaignBeingEdited] = useState<Campaign | null>(null);
  const [campaignPendingDeletion, setCampaignPendingDeletion] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const campaigns = useCampaignStore(state => state.allCampaigns);
  const createCampaign = useCampaignStore(state => state.createCampaign);
  const importCampaign = useCampaignStore(state => state.importCampaign);
  const updateCampaign = useCampaignStore(state => state.updateCampaign);
  const deleteCampaign = useCampaignStore(state => state.deleteCampaign);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setCurrentCampaignId = useCampaignStore(state => state.setCurrentCampaignId);
  const themeMode = useThemeStore(state => state.mode);
  const setThemeMode = useThemeStore(state => state.setMode);
  const resolvedTheme = useResolvedTheme();
  const toast = useToast();

  const handleCreateCampaign = () => {
    setCampaignBeingEdited(null);
    setIsCreateModalOpen(true);
  };

  const handleEditCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setCampaignBeingEdited(campaign);
      setIsCreateModalOpen(true);
    }
  };

  const handleCloseCampaignModal = () => {
    setIsCreateModalOpen(false);
    setCampaignBeingEdited(null);
  };

  const handleCampaignCreated = (data: CreateCampaignForm) => {
    const isEditing = !!data.id;

    if (isEditing) {
      updateCampaign(data.id!, {
        name: data.name,
        difficulty: data.difficulty,
      });
    } else {
      createCampaign(data);
    }

    setCampaignBeingEdited(null);

    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle className="font-semibold text-success">
            {isEditing ? 'Campaign updated' : 'Campaign created'}
          </ToastTitle>
          <ToastDescription size="sm">
            {isEditing ? `"${data.name}" has been updated.` : `"${data.name}" is ready to play.`}
          </ToastDescription>
        </Toast>
      ),
    });
  };

  const handleRequestDeleteCampaign = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) setCampaignPendingDeletion({ id: campaign.id, name: campaign.name });
  };

  const handleConfirmDeleteCampaign = () => {
    if (!campaignPendingDeletion) return;
    const { id, name } = campaignPendingDeletion;
    deleteCampaign(id);
    setCampaignPendingDeletion(null);
    toast.show({
      placement: 'top',
      render: ({ id: toastId }) => (
        <Toast nativeID={`toast-${toastId}`} action="muted" variant="solid">
          <ToastTitle className="font-semibold text-success">Campaign deleted</ToastTitle>
          <ToastDescription size="sm">{`"${name}" has been removed.`}</ToastDescription>
        </Toast>
      ),
    });
  };

  const showErrorToast = (title: string, description?: string) => {
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="error" variant="solid">
          <ToastTitle className="font-semibold">{title}</ToastTitle>
          {description && <ToastDescription size="sm">{description}</ToastDescription>}
        </Toast>
      ),
    });
  };

  const handleExportCampaign = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    try {
      await exportCampaignToFile(campaign);
    } catch {
      showErrorToast("Couldn't export campaign", 'Please try again.');
    }
  };

  const handleImportCampaign = async () => {
    let fileContent: string | null;
    try {
      fileContent = await pickCampaignJson();
    } catch {
      showErrorToast("Couldn't read file");
      return;
    }

    if (fileContent === null) return;

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(fileContent);
    } catch {
      showErrorToast("This file isn't valid JSON");
      return;
    }

    const normalized = normalizeImportedCampaign(parsedJson);
    if ('error' in normalized) {
      showErrorToast(normalized.error);
      return;
    }

    importCampaign(normalized);

    toast.show({
      placement: 'top',
      render: ({ id: toastId }) => (
        <Toast nativeID={`toast-${toastId}`} action="success" variant="solid">
          <ToastTitle className="font-semibold text-success">Campaign imported</ToastTitle>
          <ToastDescription size="sm">{`"${normalized.name}" is ready to play.`}</ToastDescription>
        </Toast>
      ),
    });
  };

  const handleCycleTheme = () => {
    setThemeMode(NEXT_THEME_MODE[themeMode]);
  };

  const ThemeModeIcon = THEME_MODE_ICON[themeMode];

  const handleOpenCampaign = (campaignId: string) => {
    setCurrentCampaignId(campaignId);
    navigation.navigate('CurrentCampaign');
  };

  return (
    <VStack className="flex-1 bg-background pt-safe">
      {/* Header - Title + theme toggle */}
      <HStack className="px-4 pt-4 pb-2 justify-between items-center">
        <Text className="text-foreground text-3xl font-bold">Campaigns</Text>
        <HStack space="sm">
          <Pressable
            onPress={() => setIsDisclaimerOpen(true)}
            className="p-2 rounded-full bg-secondary active:opacity-80"
            accessibilityLabel="Legal disclaimer"
          >
            <Info color={THEME_COLORS[resolvedTheme].foreground} size={20} />
          </Pressable>
          <Pressable
            onPress={handleCycleTheme}
            className="p-2 rounded-full bg-secondary active:opacity-80"
          >
            <ThemeModeIcon color={THEME_COLORS[resolvedTheme].foreground} size={20} />
          </Pressable>
        </HStack>
      </HStack>

      {/* Content */}
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {campaigns.length > 0 ? (
          <VStack space="md" className="py-2">
            {campaigns.map(campaign => (
              <CampaignCard
                key={campaign.id}
                id={campaign.id}
                name={campaign.name}
                game={campaign.game}
                difficulty={campaign.difficulty}
                dangerLevel={campaign.dangerLevel}
                onPress={handleOpenCampaign}
                onEdit={handleEditCampaign}
                onDownload={handleExportCampaign}
                onDelete={handleRequestDeleteCampaign}
              />
            ))}
          </VStack>
        ) : (
          // Improved Empty State
          <VStack className="flex-1 items-center justify-center py-20" space="lg">
            <VStack className="items-center" space="md">
              <Plus size={56} color={THEME_COLORS[resolvedTheme].mutedForeground} />
              <Text className="text-foreground text-xl font-semibold">No campaigns yet</Text>
              <Text className="text-muted-foreground text-center px-6">
                Create your first campaign to start tracking your{'\n'}
                Resident Evil board game progress.
              </Text>
            </VStack>
          </VStack>
        )}
      </ScrollView>

      {/* Secondary action - Import a previously exported campaign backup */}
      <Pressable
        onPress={handleImportCampaign}
        className="absolute bottom-safe-or-10 right-24 bg-secondary w-11 h-11 rounded-full items-center justify-center shadow-lg active:opacity-80"
        accessibilityLabel="Import campaign from file"
      >
        <Upload color={THEME_COLORS[resolvedTheme].foreground} size={20} />
      </Pressable>

      {/* Floating Action Button - Only way to create a campaign */}
      <Pressable
        onPress={handleCreateCampaign}
        className="absolute bottom-safe-or-8 right-6 bg-destructive w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-90"
      >
        {/* White reads well on both the light and dark destructive-red shades */}
        <Plus color="white" size={26} />
      </Pressable>
      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCampaignModal}
        onCreate={handleCampaignCreated}
        editingCampaign={campaignBeingEdited}
      />
      <DisclaimerModal isOpen={isDisclaimerOpen} onClose={() => setIsDisclaimerOpen(false)} />

      <AlertDialog
        isOpen={campaignPendingDeletion !== null}
        onClose={() => setCampaignPendingDeletion(null)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <Text className="text-foreground text-xl font-semibold">Delete campaign</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-muted-foreground">
              {`Delete "${campaignPendingDeletion?.name}"? This cannot be undone.`}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onPress={() => setCampaignPendingDeletion(null)}
            >
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1 bg-destructive active:opacity-90"
              onPress={handleConfirmDeleteCampaign}
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
}
