import React from 'react';
import { Text } from '@/components/ui/text';
import { ItemCategory } from '@/types';
import { ITEM_CATEGORY_BADGE_CLASSES } from '@/constants/itemCategory';

interface ItemCategoryBadgeProps {
  category: ItemCategory;
}

export const ItemCategoryBadge: React.FC<ItemCategoryBadgeProps> = ({ category }) => (
  <Text
    className={`text-xs font-bold px-2 py-0.5 border rounded-full ${ITEM_CATEGORY_BADGE_CLASSES[category]}`}
  >
    {category}
  </Text>
);
