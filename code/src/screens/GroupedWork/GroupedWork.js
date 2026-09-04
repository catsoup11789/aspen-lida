import { SearchIcon } from 'lucide-react-native';

import { useRoute } from '@react-navigation/native';
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import React from 'react';

// custom components and helper files
import {loadError} from '../../components/loadError';
import { LoadingSpinner } from '../../components/loadingSpinner';
import { DisplaySystemMessage } from '../../components/Notifications';
import { GroupedWorkContext, SystemMessagesContext } from '../../context/initialContext';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useUserState, useAccounts, useCards, useLocations, useSublocations, useUpdateAccounts, useUpdateCards, useUpdateLocations, useUpdateSublocations, useUpdatePickupLocationPrefs } from '../../hooks/useUserData';
import { startSearch } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { getFirstRecord, getVariations } from '../../util/api/item';
import { getLinkedAccounts, passUserToDiscovery } from '../../util/api/user';
import { formatLinkedAccounts } from '../../util/api/userHelper';
import { getGroupedWork } from '../../util/api/work';
import { decodeHTML } from '../../helpers/helpers';
import { getPickupLocations, getPickupSublocations } from '../../util/api/user';
import { formatPickupLocations } from '../../util/api/userHelper';
import AddToList from '../Search/AddToList';
import Variations from './Variations';

import { logDebugMessage, getErrorMessage } from '../../util/logging.js';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { SafeAreaView } from 'react-native-safe-area-context';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const GroupedWorkScreen = () => {
     const route = useRoute();
     const queryClient = useQueryClient();
     const id = route.params.id;
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const preferredPickupLocationIsValid = userState?.preferredPickupLocationIsValid ?? true;
     const preferredPickupLocationWarning = userState?.preferredPickupLocationWarning ?? '';
     const { data: locations } = useLocations();
     const { data: sublocations } = useSublocations();
     const { data: accounts } = useAccounts();
     const { data: cards } = useCards();
     const updateLocations = useUpdateLocations();
     const updateSublocations = useUpdateSublocations();
     const updateAccounts = useUpdateAccounts();
     const updateCards = useUpdateCards();
     const updatePickupLocationPrefs = useUpdatePickupLocationPrefs();
     const { language, updateGroupedWork, updateFormat } = React.useContext(GroupedWorkContext);
     const library = useLibrary();
     const userLanguage = useActiveLanguage();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { theme, colorMode } = useTheme();

     const { status, data, error, isFetching } = useQuery(['groupedWork', id, userLanguage, library.baseUrl], () => getGroupedWork(route.params.id, userLanguage, library.baseUrl));

     React.useEffect(() => {
          let isSubscribed = true;
          if (!_.isUndefined(data) && !_.isEmpty(data)) {
               const update = async () => {
                    if (isSubscribed) {
                         updateGroupedWork(data);
                         updateFormat(data.format);
                         await getLinkedAccounts(library.baseUrl, language).then(async (data) => {
                              if(data.ok) {
                                   const linkedAccounts = formatLinkedAccounts(user, cards ?? [], library.barcodeStyle, data.data.result.linkedAccounts);
                                   await updateAccounts(linkedAccounts.accounts);
                                   await updateCards(linkedAccounts.cards);
                              } else {
                                   logDebugMessage("Error fetching linked accounts in GroupedWork");
                                   logDebugMessage(data);
                                   getErrorMessage(data.code ?? 0, data.problem);
                              }
                         });
                         await getPickupLocations(library.baseUrl, id).then(async (result) => {
                              logDebugMessage('Updating pickup locations after getPickupLocations call');
                              if(result.ok) {
                                   const pickupLocations = formatPickupLocations(result.data.result);
                                   await updateLocations(pickupLocations.locations);
                                   logDebugMessage("Preferred pickup location is valid? " + pickupLocations.preferredPickupLocationIsValid);
                                   await updatePickupLocationPrefs(pickupLocations.preferredPickupLocationIsValid, pickupLocations.preferredPickupLocationWarning);
                                   logDebugMessage("Error fetching pickup locations in GroupedWork");
                                   logDebugMessage(data);
                                   getErrorMessage(data.code ?? 0, data.problem);
                              }
                         });
                         await getPickupSublocations(library.baseUrl).then(async (result) => {
                              if (sublocations !== result) {
                                   await updateSublocations(result);
                              }
                         });
                    }
               };
               update().catch(console.error);

               return () => (isSubscribed = false);
          }
     }, [data]);

     const showSystemMessage = () => {
          if (_.isArray(systemMessages)) {
              return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} queryClient={queryClient} />;
                    }
                    return null;
               });
          }
          return null;
     };

     return (
          <SafeAreaView style={{ flex: 1 }}>
               {status === 'loading' || isFetching ? (
                    <LoadingSpinner message="Fetching data..." />
               ) : status === 'error' ? (
                    loadError(error, '')
               ) : (
                    <ScrollView>
                         <Box style={{ height: 150, width: '100%', backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.gray200 : theme.tokens.colors.ui.background.dark, zIndex: -1, position: 'absolute', left: 0, top: 0 }} />
                         {_.size(systemMessages) > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
                         <DisplayGroupedWork data={data.results} initialFormat={data.format} updateFormat={data.format} />
                    </ScrollView>
               )}
          </SafeAreaView>
     );
};

const DisplayGroupedWork = (payload) => {
     const groupedWork = payload.data;
     const route = useRoute();
     const id = route.params.id;
     const { format } = React.useContext(GroupedWorkContext);
     const library = useLibrary();
     const language = useActiveLanguage();
     const { colorMode } = useTheme();

     const formats = Object.keys(groupedWork.formats);

     useQueries({
          queries: formats.map((format) => {
               return {
                    queryKey: ['recordId', groupedWork.id, format, language, library.baseUrl],
                    queryFn: () => getFirstRecord(id, format, language, library.baseUrl, groupedWork.formats[format]) };
          }) });

     useQueries({
          queries: formats.map((format) => {
               return {
                    queryKey: ['variation', groupedWork.id, format, language, library.baseUrl],
                    queryFn: () => getVariations(id, format, language, library.baseUrl, groupedWork.formats[format]) };
          }) });

     const key = 'large_' + groupedWork.id;

     return (
          <Box style={{ padding: 20, width: '100%' }}>
               <Center style={{ marginTop: 20, width: '100%' }}>
                    <Image alt={groupedWork.title} source={groupedWork.cover} style={{ width: 180, height: 250, borderRadius: 4 }} placeholder={blurhash} transition={1000} contentFit="cover" />
                    <Title title={groupedWork.title} />
                    <Author author={groupedWork.author} />
               </Center>
               <Language language={groupedWork.language} />
               <Formats formats={groupedWork.formats} />
               <Variations format={format} data={groupedWork} />
               <AddToList itemId={groupedWork.id} btnStyle="lg" />
               <Description description={groupedWork.description} />
               <BibliographicInformationLink groupedWorkId={groupedWork.id} />
          </Box>
     );
};

const Title = ({ title }) => {
     const { textColor } = useTheme();
     if (title) {
          return (
               <>
                    <Text bold style={{ color: textColor, fontSize: 16, lineHeight: 19, paddingTop: 20, textAlign: 'center' }}>
                         {title}
                    </Text>
               </>
          );
     } else {
          return null;
     }
};

const Author = ({ author }) => {
     const library = useLibrary();
     const { theme, colorMode } = useTheme();
     if (author) {
          return (
               <Button size="sm" variant="link" onPress={() => startSearch(author, 'SearchResults', library.baseUrl)}>
                    <ButtonIcon as={SearchIcon} size="xs" style={{ color: colorMode === 'light' ? theme.tokens.colors.ui.textStrong.light : theme.tokens.colors.ui.white.dark, marginRight: 4 }} />
                    <ButtonText style={{ fontWeight: '400', color: colorMode === 'light' ? theme.tokens.colors.ui.textStrong.light : theme.tokens.colors.ui.white.dark }}>
                         {author}
                    </ButtonText>
               </Button>
          );
     }
     return null;
};

const Format = (data) => {
     const format = data.data;
     const key = data.format;
     const isSelected = data.isSelected;
     const updateFormat = data.updateFormat;
     const btnStyle = isSelected === key ? 'solid' : 'outline';
     const { theme, colorMode } = useTheme();

     return (
          <Button size="sm" variant={btnStyle} onPress={() => updateFormat(key)} style={{ backgroundColor: btnStyle === 'outline' ? 'transparent' : theme.tokens.colors.secondary['400'], borderColor: colorMode === 'light' ? theme.tokens.colors.ui.textStrong.light : theme.tokens.colors.ui.white.dark, marginBottom: 4, marginRight: 4 }}>
               <ButtonText style={{ color: btnStyle === 'outline' ? (colorMode === 'light' ? theme.tokens.colors.ui.textStrong.light : theme.tokens.colors.ui.white.dark) : theme.tokens.colors.secondary['400-text'] }}>{format.label}</ButtonText>
          </Button>
     );
};

const Description = ({ description }) => {
     const { theme, textColor } = useTheme();
     if (description) {
          return (
               <Text style={{ marginTop: 20, marginBottom: 20, fontSize: 14, lineHeight: 21, color: textColor }}>
                    {decodeHTML(description)}
               </Text>
          );
     } else {
          return null;
     }
};

const Language = ({ language }) => {
     const user_language = useActiveLanguage();
     const { theme, textColor } = useTheme();
     if (language) {
          return (
               <HStack style={{ marginTop: 12, marginBottom: 4 }}>
                    <Text bold style={{ fontSize: 12, lineHeight: 15, color: textColor }}>
                         {getTermFromDictionary(user_language, 'language')}:
                    </Text>
                    <Text style={{ fontSize: 12, lineHeight: 15, marginLeft: 4, color: textColor }}>
                         {' '}
                         {language}
                    </Text>
               </HStack>
          );
     } else {
          return null;
     }
};

const Formats = ({ formats }) => {
     const language = useActiveLanguage();
     const { format, updateFormat } = React.useContext(GroupedWorkContext);
     const { theme, textColor } = useTheme();
     if (formats) {
          return (
               <>
                    <Text bold style={{ fontSize: 12, lineHeight: 15, marginTop: 12, marginBottom: 4, color: textColor }}>
                         {getTermFromDictionary(language, 'format')}:
                    </Text>
                    <ButtonGroup style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                         {_.compact(_.map(_.keys(formats), function (item, index) {
                              const formatData = formats[item];
                              if (!formatData || !formatData.label || formatData.label.trim() === '' || item.trim() === '') {
                                   return null;
                              }
                              return <Format key={index} format={item} data={formatData} isSelected={format} updateFormat={updateFormat} />;
                         }))}
                    </ButtonGroup>
               </>
          );
     } else {
          return null;
     }
};

const BibliographicInformationLink = ({ groupedWorkId }) => {
     const language = useActiveLanguage();
     const { theme, colorMode } = useTheme();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const library = useLibrary();
     const backgroundColor = colorMode === 'light' ? theme.tokens.colors.ui.gray200 : theme.tokens.colors.ui.background.dark;
     const textColor = colorMode === 'light' ? theme.tokens.colors.ui.textStrong.light : theme.tokens.colors.ui.gray200;

     let showMoreInfoBtn = false;
     if(library?.showMoreInfoBtn) {
          showMoreInfoBtn = library.showMoreInfoBtn;
     }

     if (groupedWorkId && showMoreInfoBtn) {
          return (
          <Button onPress={async () => await passUserToDiscovery(library.baseUrl, 'GroupedWork', user.id, backgroundColor, textColor, groupedWorkId)} style={{ backgroundColor: theme.tokens.colors.secondary['500'] }}>
              <ButtonText style={{ color: theme.tokens.colors.secondary['500-text'] }}>
                    {getTermFromDictionary(language, 'more_information')}
               </ButtonText>
          </Button>
          );
     } else {
          return null;
     }
};
