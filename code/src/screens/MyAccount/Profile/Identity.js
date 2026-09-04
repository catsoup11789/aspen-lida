import React from "react";
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {getTermFromDictionary} from '../../../translations/TranslationService';
import { useActiveLanguage } from '../../../hooks/useLanguageData';

// custom components and helper files

const Profile_Identity = (props) => {
    const language = useActiveLanguage();
  return (
    <Box style={{ paddingBottom: 20 }}>
      <Text bold>{getTermFromDictionary(language, 'patron_full_name')}</Text>
      <Text>{props.firstName} {props.lastName}</Text>
    </Box>
  );
};

export default Profile_Identity;
