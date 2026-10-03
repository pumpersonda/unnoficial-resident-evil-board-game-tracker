import React from 'react';
import { View } from 'react-native';
import { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@/components/ui/modal';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useResolvedTheme } from '@/hooks/useResolvedTheme';
import { THEME_COLORS } from '@/constants/theme';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  stickyTop?: React.ReactNode;
  scrollEnabled?: boolean;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  stickyTop,
  scrollEnabled = true,
}) => {
  const resolvedTheme = useResolvedTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalBackdrop />
      <ModalContent
        className="bg-background h-full w-full rounded-none border-0 p-0"
        entering={SlideInDown.duration(250)}
        exiting={SlideOutDown.duration(200)}
      >
        <ModalHeader className="flex-row items-center px-4 pt-safe pb-3 border-b border-border">
          <View className="w-10" />
          <Text
            className="flex-1 text-center text-foreground text-xl font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>
          <ModalCloseButton className="w-10 items-end">
            <X color={THEME_COLORS[resolvedTheme].mutedForeground} size={20} />
          </ModalCloseButton>
        </ModalHeader>

        {stickyTop && <View className="px-4 pt-3">{stickyTop}</View>}

        <ModalBody
          className="flex-1 px-4"
          scrollEnabled={scrollEnabled}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ModalBody>

        <ModalFooter className="px-4 pt-3 pb-safe border-t border-border">
          {footer ?? (
            <Button className="flex-1 bg-secondary active:opacity-90" onPress={onClose}>
              <ButtonText className="text-secondary-foreground">Close</ButtonText>
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
