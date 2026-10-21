import { ItemCategory } from '@/types';

export const ITEM_CATEGORY_ORDER: ItemCategory[] = ['S', 'A', 'B', 'C'];

export const ITEM_CATEGORY_BADGE_CLASSES: Record<ItemCategory, string> = {
  S: 'text-muted-foreground border-muted-foreground',
  A: 'text-blue-500 border-blue-500',
  B: 'text-destructive border-destructive',
  C: 'text-success border-success',
};
