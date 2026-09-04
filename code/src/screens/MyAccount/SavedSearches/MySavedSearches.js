import React from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// custom components and helper files
import { loadingSpinner } from '../../../components/loadingSpinner';
import { SystemMessagesContext } from '../../../context/initialContext';
import { useSavedSearches, useUpdateSavedSearches } from '../../../hooks/useUserData';
import { fetchSavedSearches } from '../../../util/api/list';
import { loadError } from '../../../components/loadError';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { navigateStack } from '../../../helpers/RootNavigator';
import { DisplaySystemMessage } from '../../../components/Notifications';
import { logDebugMessage, logErrorMessage, getErrorMessage } from '../../../util/logging';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';

export const MySavedSearches = () => {
     const navigation = useNavigation();
     const [isFetching, setIsFetching] = React.useState(false);
     const [fetchError, setFetchError] = React.useState(null);
     const { data: savedSearches } = useSavedSearches();
     const updateSavedSearches = useUpdateSavedSearches();
     const library = useLibrary();
     const language = useActiveLanguage();
     const { textColor, theme, colorMode } = useTheme();
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;

     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);

     React.useLayoutEffect(() => {
          navigation.setOptions({
               headerLeft: () => <Box /> });
     }, [navigation]);

     useFocusEffect(
          React.useCallback(() => {
               const loadSavedSearchesIfNeeded = async () => {
                    if (Array.isArray(savedSearches) && savedSearches.length > 0) {
                         return;
                    }
                    setIsFetching(true);
                    setFetchError(null);
                    try {
                         const data = await fetchSavedSearches(library.baseUrl);
                         if (data.ok) {
                              await updateSavedSearches(data.data.result?.searches ?? []);
                         } else {
                              logDebugMessage('Error fetching saved searches for user');
                              logDebugMessage(data);
                              getErrorMessage(data.code, data.problem);
                         }
                    } catch (error) {
                         logDebugMessage('Error fetching saved searches for user');
                         logErrorMessage(error);
                         setFetchError(error);
                    } finally {
                         setIsFetching(false);
                    }
               };

               loadSavedSearchesIfNeeded();
          }, [savedSearches, library.baseUrl, updateSavedSearches])
     );

     const Empty = () => {
          return (
               <Center style={{ marginTop: 20, marginBottom: 20 }}>
                   <Text bold size="lg" style={{ color: textColor }}>
                         {getTermFromDictionary(language, 'saved_searches_empty')}
                    </Text>
               </Center>
          );
     };

     const showSystemMessage = () => {
          if (Array.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0' || obj.showOn === '1') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} />;
                    }
               });
          }
          return null;
     };

     return (
          <Box style={{ flex: 1 }}>
               <Box>
                    {showSystemMessage()}
                    {isFetching && (!savedSearches || savedSearches.length === 0) ? (
                         loadingSpinner()
                    ) : fetchError ? (
                         loadError('Error', '')
                    ) : (
                         <>
                              <FlatList data={savedSearches} ListEmptyComponent={Empty} renderItem={({ item }) => <Item data={item} />} keyExtractor={(item, index) => index.toString()} contentContainerStyle={{ paddingBottom: 30 }} />
                         </>
                    )}
               </Box>
          </Box>
     );
};

const Item = (data) => {
     const language = useActiveLanguage();
     const item = data.data;
     const { textColor, colorMode } = useTheme();
     const { theme } = useTheme();
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;

     let hasNewResults = 0;
     if (item?.hasNewResults !== undefined) {
          hasNewResults = item.hasNewResults;
     }

     const openSavedSearch = () => {
          navigateStack('AccountScreenTab', 'MySavedSearch', {
               id: item.id,
               details: item,
               title: item.title });
     };

     return (
          <Pressable
               onPress={() => {
                    openSavedSearch();
               }}
               style={{ borderBottomWidth: 1, borderColor, paddingHorizontal: 4, paddingVertical: 8 }}>
               <HStack space="md" style={{ justifyContent: 'flex-start' }}>
                    <VStack space="sm">{/*<Image source={{uri: item.cover}} alt={item.title} size="lg" resizeMode="contain" />*/}</VStack>
                    <VStack space="sm" style={{ justifyContent: 'space-between', maxWidth: '80%' }}>
                         <Box>
                              <Text bold size="md" style={{ color: textColor }}>
                                   {item.title}{' '}
                                   {hasNewResults === 1 ? (
                                        <Badge action="warning" style={{ marginBottom: -2 }}>
                                             <BadgeText>{getTermFromDictionary(language, 'flag_updated')}</BadgeText>
                                        </Badge>
                                   ) : null}
                              </Text>
                              <Text size="xs" italic style={{ color: textColor }}>
                                   Created on {item.created}
                              </Text>
                         </Box>
                    </VStack>
               </HStack>
          </Pressable>
     );
};
