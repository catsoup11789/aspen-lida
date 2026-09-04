import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import _ from 'lodash';
import React from 'react';

// custom components and helper files
import { loadError } from '../../components/loadError';
import { LoadingSpinner, loadingSpinner } from '../../components/loadingSpinner';
import { DisplaySystemMessage } from '../../components/Notifications';
import { SystemMessagesContext } from '../../context/initialContext';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { fetchSearchResultsForBrowseCategory } from '../../util/api/search';
import { DisplayResult } from './DisplayResult';
import { logDebugMessage, logErrorMessage } from '../../util/logging';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FlatList } from '@/components/ui/flat-list';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const SearchResultsForBrowseCategory = () => {
     const queryClient = useQueryClient();
     const [page, setPage] = React.useState(1);
     const library = useLibrary();
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);

     const category = useRoute().params.id ?? '';
     const [paginationLabel, setPaginationLabel] = React.useState('Page 1 of 1');

     const { status, data, error, isFetching, isPreviousData } = useQuery({
          queryKey: ['searchResultsForBrowseCategory', category, page, 25, library.baseUrl, language],
          queryFn: () => fetchSearchResultsForBrowseCategory(category, page, 25, library.baseUrl, language),
          keepPreviousData: true,
          staleTime: 1000,
          onSuccess: (data) => {
               if (data.totalPages) {
                    let tmp = getTermFromDictionary(language, 'page_of_page');
                    tmp = tmp.replace('%1%', page);
                    tmp = tmp.replace('%2%', data.totalPages);
                    setPaginationLabel(tmp);
               }
          },
          onError: (error) => {
               logDebugMessage("Error searching by browse category");
               logErrorMessage(error);
          }
     });

     const systemMessagesForScreen = [];

     React.useEffect(() => {
          if (_.isArray(systemMessages)) {
               systemMessages.map((obj, index, collection) => {
                    if (obj.showOn === '0') {
                         systemMessagesForScreen.push(obj);
                    }
               });
          }
     }, [systemMessages]);

     const Paging = () => {
          if (data.totalPages > 1) {
               return (
                    <Box style={{ padding: 8, backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.gray100 : theme.tokens.colors.ui.surface.dark, borderTopWidth: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray200 : theme.tokens.colors.ui.gray600, flexWrap: 'nowrap', alignItems: 'center' }}>
                         <ScrollView horizontal>
                              <ButtonGroup>
                                   <Button onPress={() => setPage(page - 1)} isDisabled={page === 1} size="sm" style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'previous')}</ButtonText>
                                   </Button>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        onPress={() => {
                                             if (!isPreviousData && data.hasMore) {
                                                  setPage(page + 1);
                                             }
                                        }}
                                        isDisabled={isPreviousData || !data.hasMore}
                                        size="sm">
                                       <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'next')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ScrollView>
                         <Text style={{ marginTop: 8, fontSize: 10, color: textColor }}>
                              {paginationLabel}
                         </Text>
                    </Box>
               );
          }

          return null;
     };

     const showSystemMessage = () => {
          if (_.isArray(systemMessages)) {
               return systemMessages.map((obj, index, collection) => {
                    if (obj.showOn === '0') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} queryClient={queryClient} />;
                    }
               });
          }
          return null;
     };

     const NoResults = () => {
          return (
               <>
                    {_.size(systemMessagesForScreen) > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
                    <Center style={{ flex: 1 }}>
                        <Heading style={{ paddingTop: 20, color: textColor }}>{getTermFromDictionary(language, 'no_results')}</Heading>
                    </Center>
               </>
          );
     };

     return (
          <SafeAreaView style={{ flex: 1 }}>
               {_.size(systemMessagesForScreen) > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
               {status === 'loading' || isFetching ? (
                    loadingSpinner('Fetching results...')
               ) : status === 'error' ? (
                    loadError('Error', '')
               ) : (
                    <Box style={{ flex: 1 }}>
                         <FlatList data={data.results} ListFooterComponent={Paging} ListEmptyComponent={NoResults} renderItem={({ item }) => <DisplayResult data={item} />} keyExtractor={(item, index) => index.toString()} />
                    </Box>
               )}
          </SafeAreaView>
     );
};
