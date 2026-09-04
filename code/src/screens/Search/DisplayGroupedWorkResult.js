import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import _ from 'lodash';
import React from 'react';

// custom components and helper files

import { getCleanTitle } from '../../helpers/item';
import { navigate } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { getFormats } from '../../util/api/searchHelper';
import AddToList from './AddToList';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const DisplayGroupedWorkResult = (props) => {
     const item = props.data;
     let params = useRoute();
     const library = useLibrary();
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();

     let formats = item?.itemList ?? [];
     const id = item.key ?? item.id;

     let title;
     if (item.title) {
          title = item.title;
     } else if (item.title_display) {
          title = item.title_display;
     }

     let author;
     if (item.author) {
          author = item.author;
     } else if (item.author_display) {
          author = item.author_display;
     }

     if (_.isEmpty(formats)) {
          if (item.format) {
               formats = item.format;
          }
     }

     if (params.name === 'SearchBySavedSearch') {
          formats = getFormats(formats);
     }

     const handlePressItem = () => {
          navigate('GroupedWorkScreen', {
               id: id,
               title: getCleanTitle(title),
               url: library.baseUrl });
     };

     function getFormat(n) {
          if (_.isArray(n) || _.isObject(n)) {
               return (
                    <Badge key={n.key} variant="outline" style={{ borderRadius: 8, borderColor: theme.tokens.colors.secondary['400'], backgroundColor: 'transparent' }}>
                         <BadgeText textTransform="none" style={{ color: theme.tokens.colors.secondary['400'], fontSize: 12 }}>
                              {n.name}
                         </BadgeText>
                    </Badge>
               );
          }

          return (
               <Badge key={n} variant="outline" style={{ borderRadius: 8, borderColor: theme.tokens.colors.secondary['400'], backgroundColor: 'transparent' }}>
                    <BadgeText textTransform="none" style={{ color: theme.tokens.colors.secondary['400'], fontSize: 12 }}>
                         {n}
                    </BadgeText>
               </Badge>
          );
     }

     const key = 'medium_' + id;

     let url = library.baseUrl + '/bookcover.php?id=' + id + '&size=medium';

     return (
          <Pressable style={{ borderBottomWidth: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray400 : theme.tokens.colors.ui.gray600, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={handlePressItem}>
               <HStack space="md">
                    <VStack style={{ width: 100 }}>
                         <Box style={{ height: 150 }}>
                              <Image
                                   alt={item.title}
                                   source={url}
                                   style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: 8 }}
                                   placeholder={blurhash}
                                   transition={1000}
                                   contentFit="cover"
                              />
                         </Box>
                         {item.language ? (
                              <Center style={{ marginTop: 4 }}>
                                   <Badge
                                        size="sm"
                                        style={{ backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.gray200 : theme.tokens.colors.ui.background.dark }}>
                                        <BadgeText textTransform="none" style={{ color: colorMode === 'light' ? theme.tokens.colors.ui.textMuted.light : theme.tokens.colors.ui.gray400, fontSize: 12, textAlign: 'center' }}>
                                            {item.language}
                                       </BadgeText>
                                   </Badge>
                              </Center>
                         ) : null}
                         <AddToList itemId={id} btnStyle="sm" />
                    </VStack>
                    <VStack style={{ width: '65%', paddingTop: 4 }}>
                         {title ? (
                              <Text bold style={{ color: textColor, fontSize: 14, paddingBottom: 4 }}>
                                   {title}
                              </Text>
                         ) : null}
                         {author ? (
                              <Text style={{ color: textColor, fontSize: 12 }}>
                                   {getTermFromDictionary(language, 'by')} {author}
                              </Text>
                         ) : null}
                         <HStack space="xs" style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
                              {_.map(formats, getFormat)}
                         </HStack>
                    </VStack>
               </HStack>
          </Pressable>
     );
};
