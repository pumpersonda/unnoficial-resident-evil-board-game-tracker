import React, { useMemo, useState } from 'react';
import { ScrollView } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Pressable } from '@/components/ui/pressable';
import { ItemCategoryBadge } from '@/components/shared/ItemCategoryBadge';
import { ItemIcon } from '@/components/shared/ItemIcon';
import { Campaign, Item, ItemCategory, ItemType } from '@/types';
import { useCampaignStore } from '@/store/campaignStore';
import { Minus, Plus, Trash2 } from 'lucide-react-native';
import { AddItemModal } from './AddItemModal';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Button, ButtonText } from '@/components/ui/button';

interface ItemBoxTabProps {
  campaign: Campaign;
}

interface ItemHolder {
  characterName: string;
  quantity: number;
}

interface ItemBoxEntry {
  item: Item;
  boxQuantity: number;
  holders: ItemHolder[];
}

const CATEGORY_ORDER: ItemCategory[] = ['S', 'A', 'B', 'C'];

function buildItemBoxEntries(campaign: Campaign): ItemBoxEntry[] {
  const entries = new Map<string, ItemBoxEntry>();

  for (const item of campaign.itemsBox) {
    entries.set(item.id, { item, boxQuantity: item.quantity, holders: [] });
  }

  for (const campaignCharacter of campaign.characters) {
    for (const item of campaignCharacter.inventory) {
      const existing = entries.get(item.id);
      const holder: ItemHolder = {
        characterName: campaignCharacter.character.name,
        quantity: item.quantity,
      };
      if (existing) {
        existing.holders.push(holder);
      } else {
        entries.set(item.id, { item, boxQuantity: 0, holders: [holder] });
      }
    }
  }

  return Array.from(entries.values());
}

export const ItemBoxTab: React.FC<ItemBoxTabProps> = ({ campaign }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemPendingRemoval, setItemPendingRemoval] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const addItemToBox = useCampaignStore(state => state.addItemToBox);
  const removeFromItemsBox = useCampaignStore(state => state.removeFromItemsBox);
  const updateItemAmmunition = useCampaignStore(state => state.updateItemAmmunition);
  const toast = useToast();

  const handleAddItem = (item: Item) => {
    addItemToBox(item);
    toast.show({
      placement: 'top',
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="success" variant="solid">
          <ToastTitle className="font-semibold text-success">Item added</ToastTitle>
          <ToastDescription size="sm">{`"${item.name}" was added to the item box.`}</ToastDescription>
        </Toast>
      ),
    });
  };

  const itemBoxEntries = useMemo(() => buildItemBoxEntries(campaign), [campaign]);

  const categories = CATEGORY_ORDER.map(
    category =>
      [category, itemBoxEntries.filter(entry => entry.item.category === category)] as [
        ItemCategory,
        ItemBoxEntry[],
      ]
  );
  const nonEmptyCategories = categories.filter(([, entries]) => entries.length > 0);

  const handleRequestDelete = (itemId: string, itemName: string) => {
    setItemPendingRemoval({ id: itemId, name: itemName });
  };

  const handleConfirmDelete = () => {
    if (!itemPendingRemoval) return;
    const { id, name } = itemPendingRemoval;
    removeFromItemsBox(id, 1);
    setItemPendingRemoval(null);
    toast.show({
      placement: 'top',
      render: ({ id: toastId }) => (
        <Toast nativeID={`toast-${toastId}`} action="muted" variant="solid">
          <ToastTitle className="font-semibold text-success">Item removed</ToastTitle>
          <ToastDescription size="sm">{`"${name}" has been removed from the item box.`}</ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <VStack className="flex-1">
      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {nonEmptyCategories.length === 0 ? (
          <VStack className="flex-1 items-center justify-center py-12">
            <Text className="text-muted-foreground">The item box is empty.</Text>
          </VStack>
        ) : (
          <VStack space="lg" className="pb-24">
            {nonEmptyCategories.map(([category, entries]) => (
              <VStack key={category} space="sm">
                <Text className="text-foreground text-xl font-bold">Category {category}</Text>

                {entries.map(({ item, boxQuantity, holders }) => {
                  const isWeaponWithAmmo =
                    boxQuantity > 0 &&
                    item.itemType === ItemType.Weapon &&
                    item.ammunition !== undefined;

                  return (
                    <Card
                      key={item.id}
                      className="bg-card border border-border p-4 rounded-2xl text-center"
                    >
                      <HStack className="justify-between items-start">
                        <HStack className="flex-1 gap-3">
                          <ItemIcon item={item} />
                          <VStack className="flex-1">
                            <HStack className="items-center gap-2">
                              <Text className="text-foreground font-semibold flex-1" numberOfLines={1}>
                                {item.name}
                              </Text>
                              {item.specialId !== undefined && (
                                <Text className="text-muted-foreground text-xs">
                                  #{item.specialId}
                                </Text>
                              )}
                              <ItemCategoryBadge category={category} />
                            </HStack>
                            <Text className="text-muted-foreground text-sm capitalize">
                              {item.itemType}
                            </Text>
                            {holders.length > 0 && (
                              <HStack className="flex-wrap gap-1 mt-2">
                                {holders.map((holder, index) => (
                                  <Text
                                    key={`${holder.characterName}-${index}`}
                                    className="text-muted-foreground text-xs font-semibold px-2 py-0.5 border border-border rounded-full"
                                  >
                                    {holder.characterName} x{holder.quantity}
                                  </Text>
                                ))}
                              </HStack>
                            )}
                          </VStack>
                        </HStack>
                        <Text className="text-muted-foreground font-semibold ml-2">
                          x{boxQuantity}
                        </Text>
                        <Pressable
                          onPress={() => handleRequestDelete(item.id, item.name)}
                          disabled={boxQuantity === 0}
                          className={`px-3 rounded-full active:bg-destructive/10 ${
                            boxQuantity === 0 ? 'opacity-30' : ''
                          }`}
                          accessibilityLabel="Remove item"
                        >
                          <Trash2 color="gray" size={20} />
                        </Pressable>
                      </HStack>

                      {isWeaponWithAmmo && (
                        <HStack className="items-center justify-center mt-3 gap-4">
                          <Pressable
                            onPress={() =>
                              updateItemAmmunition(item.id, (item.ammunition ?? 0) - 1)
                            }
                            disabled={item.ammunition === 0}
                            className={`w-8 h-8 rounded-full items-center justify-center bg-muted ${
                              item.ammunition === 0 ? 'opacity-40' : 'active:opacity-70'
                            }`}
                            accessibilityLabel="Decrease ammunition"
                          >
                            <Minus color="gray" size={16} />
                          </Pressable>
                          <Text className="text-foreground font-semibold min-w-[80px] text-center">
                            {item.ammunition} rounds
                          </Text>
                          <Pressable
                            onPress={() =>
                              updateItemAmmunition(item.id, (item.ammunition ?? 0) + 1)
                            }
                            className="w-8 h-8 rounded-full items-center justify-center bg-muted active:opacity-70"
                            accessibilityLabel="Increase ammunition"
                          >
                            <Plus color="gray" size={16} />
                          </Pressable>
                        </HStack>
                      )}
                    </Card>
                  );
                })}
              </VStack>
            ))}
          </VStack>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setIsAddModalOpen(true)}
        className="absolute bottom-safe-or-8 right-6 bg-destructive w-14 h-14 rounded-full items-center justify-center shadow-lg active:opacity-90"
      >
        <Plus color="white" size={26} />
      </Pressable>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        game={campaign.game}
        onAddItem={handleAddItem}
      />

      <AlertDialog isOpen={itemPendingRemoval !== null} onClose={() => setItemPendingRemoval(null)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="bg-card">
          <AlertDialogHeader>
            <Text className="text-foreground text-xl font-semibold">Remove item</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-muted-foreground">
              {`Remove "${itemPendingRemoval?.name}" from the item box? This cannot be undone.`}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              className="flex-1 border-border"
              onPress={() => setItemPendingRemoval(null)}
            >
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button
              className="flex-1 bg-destructive active:opacity-90"
              onPress={handleConfirmDelete}
            >
              <ButtonText>Remove</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </VStack>
  );
};
