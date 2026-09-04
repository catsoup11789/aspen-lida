import React from "react";
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {getTermFromDictionary} from '../../../translations/TranslationService';
import { useActiveLanguage } from '../../../hooks/useLanguageData';

// custom components and helper files

const Profile_ContactInformation = (props) => {
    const language = useActiveLanguage();
  return (
    <Box style={{ paddingVertical: 20 }}>
      <Text bold>{getTermFromDictionary(language, 'patron_primary_phone')}</Text>
      <Text>{props.phone}</Text>
      <Text bold style={{ marginTop: 8 }}>
          {getTermFromDictionary(language, 'patron_email')}
      </Text>
      <Text>{props.email}</Text>
    </Box>
  );
};

export default Profile_ContactInformation;
