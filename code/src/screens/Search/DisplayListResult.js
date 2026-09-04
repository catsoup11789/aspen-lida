import React from 'react';

import { useUserState } from '../../hooks/useUserData';
import { TrashIcon } from 'lucide-react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { getCleanTitle } from '../../helpers/item';
import { navigateStack } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { removeTitlesFromList } from '../../util/api/list';
import AddToList from './AddToList';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const DisplayListResult = (props) => {
     const item = props.data;
     const isUserList = props.isUserList;
     const listId = props.listId;
     const language = useActiveLanguage();
     const library = useLibrary();
     const queryClient = useQueryClient();

     const { theme, textColor, colorMode } = useTheme();

     let recordType = 'grouped_work';
     if (item.recordtype) {
          recordType = item.recordtype;
     }
     const imageUrl = library.baseUrl + '/bookcover.php?id=' + item.id + '&size=medium&type=' + recordType;
     const key = 'medium_' + item.id;
     const handlePressItem = () => {
          if (item) {
               if (recordType === 'list') {
                    navigateStack('BrowseTab', 'ListResults', {
                         id: item.id,
                         title: item.title_display,
                         url: library.baseUrl,
                         prevRoute: 'SearchByList' });
               } else {
                    navigateStack('BrowseTab', 'ListResultItem', {
                         id: item.id,
                         title: getCleanTitle(item.title_display),
                         url: library.baseUrl,
                         libraryContext: library,
                         prevRoute: 'SearchByList' });
               }
          }
     };

     return (
          <Pressable style={{ borderBottomWidth: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray400 : theme.tokens.colors.ui.gray600, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={handlePressItem}>
               <HStack space="md">
                    <VStack style={{ width: 100 }}>
                         <Box style={{ height: 150 }}>
                              <Image
                                   alt={item.title_display}
                                   source={imageUrl}
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
                              <Center>
                                   <Badge
                                        size="sm"
                                        style={{ backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.gray200 : theme.tokens.colors.ui.background.dark }}>
                                        <BadgeText textTransform="none" style={{ color: colorMode === 'light' ? theme.tokens.colors.ui.textMuted.light : theme.tokens.colors.ui.gray400, fontSize: 10, textAlign: 'center' }}>
                                            {item.language}
                                       </BadgeText>
                                   </Badge>
                              </Center>
                         ) : null}
                         {isUserList ? (
                              <Button
                                   onPress={() => {
                                        removeTitlesFromList(listId, item.id, library.baseUrl).then(async () => {
                                             queryClient.invalidateQueries({ queryKey: ['list', listId] });
                                             queryClient.invalidateQueries({ queryKey: ['searchResultsForList', library.baseUrl, 1, listId, language] });
                                        });
                                   }}
                                   colorScheme="danger"
                                   size="sm"
                                   variant="ghost">
                                   <ButtonIcon as={TrashIcon} />
                                   <ButtonText>{getTermFromDictionary(language, 'delete')}</ButtonText>
                              </Button>
                         ) : (
                              <AddToList itemId={item.id} btnStyle="sm" />
                         )}
                    </VStack>
                    <VStack style={{ width: '65%', paddingTop: 4 }}>
                         <Text bold style={{ color: textColor, fontSize: 14, lineHeight: 17, paddingBottom: 4 }}>
                              {item.title_display}
                         </Text>
                         {item.author_display ? (
                              <Text style={{ color: textColor, fontSize: 12, lineHeight: 15 }}>
                                   {getTermFromDictionary(language, 'by')} {item.author_display}
                              </Text>
                         ) : null}
                         {item.format ? (
                              <HStack space="xs" style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
                                   {item.format.map((format, i) => {
                                        return (
                                             <Badge key={i} variant="outline" style={{ borderRadius: 8, borderColor: theme.tokens.colors.secondary['400'], backgroundColor: 'transparent' }}>
                                                  <BadgeText textTransform="none" style={{ color: theme.tokens.colors.secondary['400'], fontSize: 10, lineHeight: 14 }}>
                                                       {format}
                                                  </BadgeText>
                                             </Badge>
                                        );
                                   })}
                              </HStack>
                         ) : null}
                    </VStack>
               </HStack>
          </Pressable>
     );
};
