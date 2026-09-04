import React from "react";
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import {getTermFromDictionary} from '../../../translations/TranslationService';
import { useActiveLanguage } from '../../../hooks/useLanguageData';

// custom components and helper files

const Profile_MainAddress = (props) => {
    const language = useActiveLanguage();
  return (
    <Box style={{ paddingVertical: 20 }}>
      <Text bold>{getTermFromDictionary(language, 'patron_address')}</Text>
      <Text>{props.address}</Text>
      <Text bold style={{ marginTop: 8 }}>
          {getTermFromDictionary(language, 'patron_city')}
      </Text>
      <Text>{props.city}</Text>
      <Text bold style={{ marginTop: 8 }}>
          {getTermFromDictionary(language, 'patron_state')}
      </Text>
      <Text>{props.state}</Text>
      <Text bold style={{ marginTop: 8 }}>
          {getTermFromDictionary(language, 'patron_zip')}
      </Text>
      <Text>{props.zipCode}</Text>
    </Box>
  );
};

export default Profile_MainAddress;
