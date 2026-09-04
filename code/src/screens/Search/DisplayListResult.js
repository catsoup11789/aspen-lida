import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
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
import { ThemedBadge, ThemedBadgeText, buildBrandOutlineBadgeStyle, buildBrandOutlineBadgeTextStyle } from '../../components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../components/themed/ThemedButton';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * DisplayListResult component that displays an individual list result with its image, title, author, formats, and language. It handles user interaction to navigate to the list result details or remove the item from the user's list.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const DisplayListResult = (props) => {
     const item = props.data;
     const isUserList = props.isUserList;
     const listId = props.listId;
     const language = useActiveLanguage();
     const library = useLibrary();
     const queryClient = useQueryClient();

     const { runtimeColors, textColor, colorMode, uiColors } = useTheme();

     let recordType = 'grouped_work';
     if (item.recordtype) {
          recordType = item.recordtype;
     }
     const imageUrl = library.baseUrl + '/bookcover.php?id=' + item.id + '&size=medium&type=' + recordType;
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
          <Pressable style={{ borderBottomWidth: 1, borderColor: colorMode === 'light' ? uiColors.border.light : uiColors.border.dark, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={handlePressItem}>
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
                                   <ThemedBadge
                                        size="sm"
                                        style={{ backgroundColor: colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark }}>
                                        <ThemedBadgeText textTransform="none" style={{ color: colorMode === 'light' ? uiColors.iconMuted.light : uiColors.iconMuted.dark, fontSize: 10, textAlign: 'center' }}>
                                            {item.language}
                                       </ThemedBadgeText>
                                   </ThemedBadge>
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
                                   <MaterialIcons name="delete" size={18} color={uiColors.danger} style={{ marginRight: 4 }} />
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
                                             <ThemedBadge key={i} variant="outline" style={buildBrandOutlineBadgeStyle(runtimeColors.secondary[400])}>
                                                  <ThemedBadgeText textTransform="none" style={buildBrandOutlineBadgeTextStyle(runtimeColors.secondary[400], { fontSize: 10, lineHeight: 14 })}>
                                                       {format}
                                                  </ThemedBadgeText>
                                             </ThemedBadge>
                                        );
                                   })}
                              </HStack>
                         ) : null}
                    </VStack>
               </HStack>
          </Pressable>
     );
};
