import React from 'react';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { decodeHTML, stripHTML } from '../../helpers/helpers';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';

/**
 * AdditionalInformation component that displays additional information about a location if available.
 * @param data
 * @returns {React.JSX.Element|null}
 * @constructor
 */
const AdditionalInformation = (data) => {
     const location = data.data;
     const language = useActiveLanguage();
     const { textColor } = useTheme();

     if (location.description) {
          return (
               <Box>
                    <Divider style={{ marginBottom: 8 }} />
                    <Heading style={{ color: textColor, marginBottom: 8 }}>{getTermFromDictionary(language, 'additional_information')}</Heading>
                    <Text style={{ color: textColor }}>{stripHTML(decodeHTML(location.description))}</Text>
               </Box>
          );
     }

     return null;
};

export default AdditionalInformation;
