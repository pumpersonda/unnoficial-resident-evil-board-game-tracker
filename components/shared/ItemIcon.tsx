import React from 'react';
import { Image, View } from 'react-native';
import { Package } from 'lucide-react-native';
import { Item } from '@/types';

interface ItemIconProps {
  item: Item;
  size?: number;
}

export const ItemIcon: React.FC<ItemIconProps> = ({ item, size = 40 }) => (
  <View
    style={{ width: size, height: size }}
    className="rounded-lg bg-muted border border-border items-center justify-center overflow-hidden"
  >
    {item.image ? (
      <Image source={item.image} style={{ width: size, height: size }} resizeMode="cover" />
    ) : (
      <Package color="gray" size={size * 0.5} />
    )}
  </View>
);
