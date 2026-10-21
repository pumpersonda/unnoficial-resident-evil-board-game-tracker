import { Item, ItemCategory } from '@/types';
import { ITEM_CATEGORY_ORDER } from '@/constants/itemCategory';

export function groupItemsByCategory<T extends Item>(items: T[]): [ItemCategory, T[]][] {
  return ITEM_CATEGORY_ORDER
    .map(category => {
      const group = items
        .filter(item => item.category === category)
        .sort((a, b) => a.name.localeCompare(b.name));
      return [category, group] as [ItemCategory, T[]];
    })
    .filter(([, group]) => group.length > 0);
}
