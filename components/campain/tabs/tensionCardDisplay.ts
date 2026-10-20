import { Card as CardModel } from '@/types';
import { TensionCard, TensionColor } from '@/data/RE1/tension';

export const TENSION_COLOR_ORDER: TensionColor[] = ['Green', 'Amber', 'Red'];

export const TENSION_ACCENT_CLASSES: Record<TensionColor, string> = {
  Green: 'border-l-success',
  Amber: 'border-l-warning',
  Red: 'border-l-destructive',
};

export const TENSION_TEXT_CLASSES: Record<TensionColor, string> = {
  Green: 'text-success',
  Amber: 'text-warning',
  Red: 'text-destructive',
};

export const isTensionCard = (card: CardModel): card is TensionCard => card.type === 'Tension';

export function groupByTensionColor<T>(
  items: T[],
  getColor: (item: T) => TensionColor
): [TensionColor, T[]][] {
  return TENSION_COLOR_ORDER.map(
    color => [color, items.filter(item => getColor(item) === color)] as [TensionColor, T[]]
  ).filter(([, group]) => group.length > 0);
}
