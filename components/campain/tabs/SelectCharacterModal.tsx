import React, { useMemo, useState } from 'react';
import { Image } from 'react-native';
import { FullScreenModal } from '@/components/shared/FullScreenModal';
import { Button, ButtonText } from '@/components/ui/button';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Input, InputField } from '@/components/ui/input';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { Check } from 'lucide-react-native';
import { Campaign, GameVersion } from '@/types';
import { CharacterProfile } from '@/data/RE1/characters';
import { getGameCharacters } from '@/data';
import { useCampaignStore } from '@/store/campaignStore';

interface SelectCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
}

export const SelectCharacterModal: React.FC<SelectCharacterModalProps> = ({
  isOpen,
  onClose,
  campaign,
}) => {
  const addCharacter = useCampaignStore(state => state.addCharacter);

  const [expandedCharacterId, setExpandedCharacterId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [isAdvancedChecked, setIsAdvancedChecked] = useState(false);
  const [isReserveOnlyChecked, setIsReserveOnlyChecked] = useState(false);
  const [isAddToReserveChecked, setIsAddToReserveChecked] = useState(false);
  const placingInReserve = isReserveOnlyChecked || isAddToReserveChecked;

  const allCharacters = useMemo(() => getGameCharacters(campaign.game), [campaign.game]);
  const takenIds = useMemo(
    () => new Set(campaign.characters.map(ch => ch.character.id)),
    [campaign.characters]
  );
  const availableCharacters = allCharacters.filter(c => !takenIds.has(c.id));

  const resetRowState = () => {
    setExpandedCharacterId(null);
    setPlayerName('');
    setIsAdvancedChecked(false);
    setIsReserveOnlyChecked(false);
    setIsAddToReserveChecked(false);
  };

  const handleClose = () => {
    resetRowState();
    onClose();
  };

  const toggleRow = (character: CharacterProfile) => {
    if (expandedCharacterId === character.id) {
      resetRowState();
    } else {
      setExpandedCharacterId(character.id);
      setPlayerName('');
      setIsAdvancedChecked(false);
      setIsReserveOnlyChecked(false);
      setIsAddToReserveChecked(false);
    }
  };

  const handleConfirm = (character: CharacterProfile) => {
    addCharacter({
      character,
      controlledBy: {
        id: Math.random().toString(36).substring(2, 9),
        realName: placingInReserve ? '' : playerName.trim(),
      },
      health: { value: 5, isPoisoned: false },
      inventory: [],
      kerosene: !placingInReserve && campaign.game === GameVersion.RE1 ? 0 : undefined,
      isAdvancedVersion: isAdvancedChecked,
      isInTheReserve: placingInReserve,
      isReserveOnly: isReserveOnlyChecked,
    });
    resetRowState();
  };

  return (
    <FullScreenModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Select Character"
      footer={
        <Button className="flex-1 bg-secondary active:opacity-90" onPress={handleClose}>
          <ButtonText className="text-secondary-foreground">Done</ButtonText>
        </Button>
      }
    >
      <VStack space="lg" className="pb-4">
        {availableCharacters.length === 0 ? (
          <VStack className="items-center justify-center py-16">
            <Text className="text-muted-foreground text-center">
              All characters have already been added.
            </Text>
          </VStack>
        ) : (
          <VStack className="bg-background border border-border rounded-xl overflow-hidden">
            {availableCharacters.map((character, index) => {
              const isLast = index === availableCharacters.length - 1;
              const isExpanded = expandedCharacterId === character.id;

              return (
                <VStack key={character.id} className={isLast ? '' : 'border-b border-b-border'}>
                  <Pressable
                    onPress={() => toggleRow(character)}
                    className="flex-row items-center gap-3 px-3 py-3 active:bg-muted/40"
                  >
                    <Image source={character.avatar} className="w-10 h-10 rounded-full bg-muted" />
                    <Text className="text-foreground font-medium flex-1" numberOfLines={1}>
                      {character.name}
                    </Text>
                  </Pressable>

                  {isExpanded && (
                    <VStack space="md" className="px-3 pb-4">
                      {!placingInReserve && (
                        <Input className="bg-background">
                          <InputField
                            placeholder="Player name (optional)"
                            value={playerName}
                            onChangeText={setPlayerName}
                            autoCorrect={false}
                            returnKeyType="done"
                          />
                        </Input>
                      )}

                      {character.isAdvanced && (
                        <Checkbox
                          value="advanced"
                          isChecked={isAdvancedChecked}
                          onChange={setIsAdvancedChecked}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={Check} />
                          </CheckboxIndicator>
                          <CheckboxLabel>Advanced Version</CheckboxLabel>
                        </Checkbox>
                      )}

                      {character.hasReserveOnly && (
                        <Checkbox
                          value="reserve-only"
                          isChecked={isReserveOnlyChecked}
                          onChange={setIsReserveOnlyChecked}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={Check} />
                          </CheckboxIndicator>
                          <CheckboxLabel>Reserve Only</CheckboxLabel>
                        </Checkbox>
                      )}

                      {!isReserveOnlyChecked && (
                        <Checkbox
                          value="add-to-reserve"
                          isChecked={isAddToReserveChecked}
                          onChange={setIsAddToReserveChecked}
                        >
                          <CheckboxIndicator>
                            <CheckboxIcon as={Check} />
                          </CheckboxIndicator>
                          <CheckboxLabel>Add to Reserve</CheckboxLabel>
                        </Checkbox>
                      )}

                      <Button
                        className="bg-destructive active:opacity-90"
                        onPress={() => handleConfirm(character)}
                      >
                        <ButtonText>{placingInReserve ? 'Add to Reserve' : 'Add to Roster'}</ButtonText>
                      </Button>
                    </VStack>
                  )}
                </VStack>
              );
            })}
          </VStack>
        )}
      </VStack>
    </FullScreenModal>
  );
};
