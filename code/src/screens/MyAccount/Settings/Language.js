import React from 'react';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
// custom components and helper files
import { getLanguageDisplayName, getTranslatedTermsForUserPreferredLanguage, LanguageSwitcher, translationsLibrary } from '../../../translations/TranslationService';
import {
     useActiveLanguage,
     useAvailableLanguages,
} from '../../../hooks/useLanguageData';

export const Settings_LanguageScreen = () => {
     return (
          <Box style={{ padding: 20 }}>
               <HStack justifyContent="space-between" alignItems="center">
                    <Text bold>Language</Text>
                    <LanguageSwitcher />
               </HStack>
          </Box>
     );
};
