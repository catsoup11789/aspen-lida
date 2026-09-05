import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList } from 'react-native';
import { ThemedBadge as Badge, ThemedBadgeText as BadgeText } from '@/src/components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { loadError } from '@/src/components/loadError';
import { DisplaySystemMessage } from '@/src/components/Notifications';
import { SystemMessagesContext } from '@/src/context/initialContext';
import { uniquePrimitiveArray } from '@/src/helpers/helpers';
import { getCleanTitle } from '@/src/helpers/item';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { getSavedSearch } from '@/src/util/api/list';
import AddToList from '../../Search/AddToList';
import { logErrorMessage } from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * MySavedSearch component that displays a list of saved search results for a specific saved search ID. It fetches data from the API based on the provided ID and renders a list of results. It also handles system messages and error states.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MySavedSearch = () => {
     const route = useRoute();
     const id = route.params.id;
     const library = useLibrary();
     const language = useActiveLanguage();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { colorMode, uiColors, textColor } = useTheme();
     const [status, setStatus] = React.useState('loading');
     const [data, setData] = React.useState([]);

     React.useEffect(() => {
          let isMounted = true;
          const loadSavedSearch = async () => {
               setStatus('loading');
               try {
                    const response = await getSavedSearch(id, language, library.baseUrl);
                    if (!isMounted) return;
                    setData(Array.isArray(response) ? response : []);
                    setStatus('success');
               } catch (error) {
                    logErrorMessage(error);
                    if (!isMounted) return;
                    setStatus('error');
               }
          };
          loadSavedSearch();
          return () => {
               isMounted = false;
          };
     }, [id, language, library.baseUrl]);

     const showSystemMessage = () => {
          if (Array.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} />;
                    }
               });
          }
          return null;
     };

     const Empty = () => {
          return (
               <>
                    {(systemMessages?.length ?? 0) > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
                    <Center style={{ marginTop: 20, marginBottom: 20 }}>
                        <Text bold size="lg">
                              {getTermFromDictionary(language, 'no_results_found')}
                         </Text>
                    </Center>
               </>
          );
     };

     return (
          <Box style={{ flex: 1 }}>
              {(systemMessages?.length ?? 0) > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
              <Box style={{ flex: 1 }}>{status === 'error' ? loadError('Error', '') : <FlatList data={data} ListEmptyComponent={Empty} renderItem={({ item }) => <SavedSearch data={item} />} keyExtractor={(item, index) => index.toString()} contentContainerStyle={{ paddingBottom: 30 }} />}</Box>
          </Box>
     );
};

/**
 * SavedSearch component that displays an individual saved search item. It shows the item's image, title, author, language, and formats. It also provides a button to add the item to a list and handles navigation to the item's details when pressed.
 * @param data
 * @returns {React.JSX.Element}
 * @constructor
 */
const SavedSearch = (data) => {
     const item = data.data;
     const library = useLibrary();
     const language = useActiveLanguage();
     const { colorMode, uiColors, textColor } = useTheme();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const surfaceMuted = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;
     const subtitleColor = colorMode === 'light' ? uiColors.icon.light : uiColors.iconMuted.dark;

     const imageUrl = library.baseUrl + item.image;

     let formats = [];
     if (item.format) {
          formats = getFormats(item.format);
     }
     let isNew = false;
     if (typeof item.isNew !== 'undefined') {
          isNew = item.isNew;
     }

     const openGroupedWork = () => {
          navigateStack('AccountScreenTab', 'SavedSearchItem', {
               id: item.id,
               title: getCleanTitle(item.title) });
     };

     return (
          <Pressable style={{ borderBottomWidth: 1, borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={() => openGroupedWork()}>
               <HStack space={3}>
                    <VStack style={{ maxWidth: '35%' }}>
                         {isNew ? (
                              <Box style={{ width: '100%', zIndex: 1 }}>
                                   <Badge colorScheme="warning" style={{ marginBottom: -12, marginLeft: -4 }}>
                                        <BadgeText colorScheme="warning" size="xs">
                                             {getTermFromDictionary(language, 'flag_new')}
                                        </BadgeText>
                                   </Badge>
                              </Box>
                         ) : null}
                         <Image
                              alt={item.title}
                             source={imageUrl}
                             style={{
                                  width: 100,
                                  height: 150,
                                  borderRadius: 8 }}
                             placeholder={blurhash}
                             transition={1000}
                             contentFit="cover"
                        />
                         <Badge
                              style={{ marginTop: 4, backgroundColor: surfaceMuted }}
                         >
                              <BadgeText
                                   size="sm"
                                   style={{ color: subtitleColor }}>
                                   {item.language}
                              </BadgeText>
                         </Badge>
                         <AddToList item={item.id} libraryUrl={library.baseUrl} />
                    </VStack>

                    <VStack style={{ width: '65%', marginLeft: 12 }}>
                         <Text
                              bold
                              size="xs"
                             >
                              {item.title}
                         </Text>
                         {item.author ? (
                              <Text size="xs">
                                   {getTermFromDictionary(language, 'by')} {item.author}
                              </Text>
                         ) : null}
                         {item.format ? (
                              <HStack style={{ marginTop: 6, flexWrap: 'wrap' }} space={1}>
                                   {formats.map((format, index) => {
                                        return (
                                             <Badge key={index} colorScheme="info" variant="outline" style={{ marginTop: 4, borderRadius: 8, marginLeft: 8 }}>
                                                  <BadgeText colorScheme="info" size="sm" style={{ textTransform: 'none', color: textColor }}>
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

/**
 * Extracts unique formats from the provided data array. Each item in the data array is expected to be a string that may contain a '#' character. The function splits each item by the '#' character and takes the last part as the format. It then returns an array of unique formats.
 * @param data
 * @returns {*[]}
 */
function getFormats(data) {
     let formats = [];
     data.forEach((item) => {
          let thisFormat = item.split('#');
          thisFormat = thisFormat[thisFormat.length - 1];
          formats.push(thisFormat);
     });
     formats = uniquePrimitiveArray(formats);
     return formats;
}
