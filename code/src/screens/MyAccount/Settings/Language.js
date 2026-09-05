import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { LanguageSwitcher } from '@/src/translations/TranslationService';

/**
 * Settings_LanguageScreen component that renders the language settings screen, allowing users to switch between different languages using the LanguageSwitcher component.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Settings_LanguageScreen = () => {
     return (
          <Box className="p-5">
               <HStack justifyContent="space-between" alignItems="center">
                    <Text bold>Language</Text>
                    <LanguageSwitcher />
               </HStack>
          </Box>
     );
};
