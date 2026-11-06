import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Campaign } from '@/types';
import { sanitizeFileName } from '@/utils/campaignTransfer';

export async function exportCampaignToFile(campaign: Campaign): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  const file = new File(Paths.cache, `${sanitizeFileName(campaign.name)}.json`);
  file.write(JSON.stringify(campaign, null, 2));

  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/json',
    dialogTitle: 'Save campaign backup',
  });
}

export async function pickCampaignJson(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const file = new File(result.assets[0].uri);
  return file.text();
}
