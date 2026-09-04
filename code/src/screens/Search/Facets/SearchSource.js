import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView } from 'react-native';

import { SearchContext } from '../../../context/initialContext';
import { getSearchIndexes } from '../../../util/api/search';
import { SearchGlobal } from '../../../util/globals';
import {logDebugMessage} from "../../../util/logging";
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// custom components and helper files

export const SearchSourceScreen = () => {
     const navigation = useNavigation();
     const library = useLibrary();
     const language = useActiveLanguage();
     const { currentSource, sources, updateCurrentSource, updateIndexes, updateCurrentIndex } = React.useContext(SearchContext);
     const { textColor, theme } = useTheme();
     logDebugMessage('currentSource: ' + currentSource);

     const search = async () => {
          // Dismiss modal so existing SearchResults screen refreshes with updated context/global state.
          navigation.getParent()?.goBack();
     };

     const updateSource = async (source) => {
          SearchGlobal.sortMethod = 'relevance';
          SearchGlobal.appliedFilters = [];
          SearchGlobal.sortList = [];
          SearchGlobal.availableFacets = [];
          SearchGlobal.defaultFacets = [];
          SearchGlobal.pendingFilters = [];
          SearchGlobal.appendedParams = '';
          updateCurrentSource(source);
          if (source === 'events') {
               updateCurrentIndex('EventsKeyword');
          } else {
               updateCurrentIndex('Keyword');
          }
          await search();
          await getSearchIndexes(library.baseUrl, language, source).then((indexes) => {
               updateIndexes(indexes);
          });
     };

     return (
          <VStack style={{ paddingTop: 20, flex: 1 }}>
               <ScrollView>
                    <Box style={{ paddingHorizontal: 20 }}>
                         {_.map(sources, function (source, index, array) {
                              if (index === 'events' || index === 'local') {
                                   return (
                                       <Pressable key={index} style={{ padding: 2, paddingVertical: 8 }} onPress={() => updateSource(index)}>
                                             {currentSource === index ? (
                                                 <HStack space="sm" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                                      <Icon as={MaterialIcons} name="radio-button-checked" size="lg" style={{ color: theme.tokens.colors.primary['600'] }} />
                                                      <Text style={{ color: textColor, marginLeft: 8 }}>
                                                            {source.name}
                                                       </Text>
                                                  </HStack>
                                             ) : (
                                                 <HStack space="sm" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                                      <Icon as={MaterialIcons} name="radio-button-unchecked" size="lg" style={{ color: theme.tokens.colors.primary['200'] }} />
                                                      <Text style={{ color: textColor, marginLeft: 8 }}>
                                                            {source.name}
                                                       </Text>
                                                  </HStack>
                                             )}
                                        </Pressable>
                                   );
                              }
                         })}
                    </Box>
               </ScrollView>
          </VStack>
     );
};
