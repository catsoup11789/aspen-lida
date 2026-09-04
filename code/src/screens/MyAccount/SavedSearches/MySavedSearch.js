import { useRoute } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList } from 'react-native';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { loadError } from '../../../components/loadError';

// custom components and helper files
import { DisplaySystemMessage } from '../../../components/Notifications';
import { SystemMessagesContext } from '../../../context/initialContext';
import { uniquePrimitiveArray } from '../../../helpers/helpers';
import { getCleanTitle } from '../../../helpers/item';
import { navigateStack } from '../../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { getSavedSearch } from '../../../util/api/list';
import AddToList from '../../Search/AddToList';
import { logErrorMessage } from '../../../util/logging';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const MySavedSearch = () => {
     const route = useRoute();
     const id = route.params.id;
     const library = useLibrary();
     const language = useActiveLanguage();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { colorMode, theme, textColor } = useTheme();
     const [status, setStatus] = React.useState('loading');
     const [data, setData] = React.useState([]);
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const surfaceMuted = colorMode === 'light' ? theme.tokens.colors.ui.surfaceMuted.light : theme.tokens.colors.ui.surfaceMuted.dark;
     const subtitleColor = colorMode === 'light' ? theme.tokens.colors.ui.icon.light : theme.tokens.colors.ui.iconMuted.dark;

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
                        <Text bold size="lg" style={{ color: textColor }}>
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

const SavedSearch = (data) => {
     const item = data.data;
     const library = useLibrary();
     const language = useActiveLanguage();
     const { colorMode, theme, textColor } = useTheme();
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const surfaceMuted = colorMode === 'light' ? theme.tokens.colors.ui.surfaceMuted.light : theme.tokens.colors.ui.surfaceMuted.dark;
     const subtitleColor = colorMode === 'light' ? theme.tokens.colors.ui.icon.light : theme.tokens.colors.ui.iconMuted.dark;

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
                                   <Badge action="warning" style={{ marginBottom: -12, marginLeft: -4 }}>
                                        <BadgeText size="xs">
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
                              style={{ color: textColor }}>
                              {item.title}
                         </Text>
                         {item.author ? (
                              <Text size="xs" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'by')} {item.author}
                              </Text>
                         ) : null}
                         {item.format ? (
                              <HStack style={{ marginTop: 6, flexWrap: 'wrap' }} space={1}>
                                   {formats.map((format, index) => {
                                        return (
                                             <Badge key={index} action="info" variant="outline" style={{ marginTop: 4, borderRadius: 8, marginLeft: 8 }}>
                                                  <BadgeText size="sm" style={{ textTransform: 'none', color: textColor }}>
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
