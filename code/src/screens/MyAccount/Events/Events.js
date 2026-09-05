import { ThemedMaterialIcons as MaterialIcons } from '@/src/components/themed/ThemedMaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { FlatList } from 'react-native';
import { ThemedBadge as Badge, ThemedBadgeText as BadgeText } from '@/src/components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ThemedButtonGroup as ButtonGroup } from '@/src/components/themed/ThemedButton';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ThemedScrollView as ScrollView } from '@/src/components/themed/ThemedScrollView';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { useTheme } from '@/src/themes/theme';
import { loadError } from '@/src/components/loadError';
import { popAlert, popToast } from '@/src/components/feedback';
import { loadingSpinner } from '@/src/components/loadingSpinner';
import { DisplaySystemMessage } from '@/src/components/Notifications';
import { SystemMessagesContext } from '@/src/context/initialContext';
import { useUserState, useSavedEvents, useUpdateSavedEvents, useUpdateUserProfile } from '@/src/hooks/useUserData';
import { getCleanTitle } from '@/src/helpers/item';
import { navigate } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { fetchSavedEvents, removeSavedEvent } from '@/src/util/api/event';
import { refreshProfile } from '@/src/util/api/user';
import {logDebugMessage, logErrorMessage, getErrorMessage, logWarnMessage} from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * MyEvents component that displays a list of saved events for the user. It allows users to filter events by upcoming, past, or all events, and provides pagination for navigating through the list. The component handles API calls to fetch saved events and remove events from the user's saved list. It also displays system messages and handles loading and error states.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MyEvents = () => {
     const navigation = useNavigation();
     const queryClient = useQueryClient();
     const [isLoading, setLoading] = React.useState(false);
     const [page, setPage] = React.useState(1);
     const library = useLibrary();
     const language = useActiveLanguage();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const { data: savedEvents } = useSavedEvents();
     const updateSavedEvents = useUpdateSavedEvents();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { textColor, resolvedUiColors } = useTheme();
     const pageSize = 25;
     const systemMessagesForScreen = [];
     const panelBg = resolvedUiColors.surface;
     const surfaceBg = resolvedUiColors.surface;
     const borderColor = resolvedUiColors.border;

     const [filterBy, setFilterBy] = React.useState('upcoming');
     const [paginationLabel, setPaginationLabel] = React.useState('Page 1 of 1');
     const [events, updateEvents] = React.useState([]);

     React.useLayoutEffect(() => {
          navigation.setOptions({
               headerLeft: () => <Box /> });
     }, [navigation]);

     React.useEffect(() => {
          if (_.isArray(systemMessages)) {
               systemMessages.map((obj) => {
                    if (obj.showOn === '0' || obj.showOn === '1') {
                         systemMessagesForScreen.push(obj);
                    }
               });
          }
     }, [systemMessages]);

     const { status, data, error, isFetching, isPreviousData } = useQuery(['saved_events', user.id, library.baseUrl, page, filterBy], () => fetchSavedEvents(page, pageSize, filterBy, library.baseUrl, user.language), {
          //initialData: savedEvents,
          keepPreviousData: true,
          staleTime: 1000,
          onSuccess: (data) => {
               if(data.ok) {
                    let morePages = false;

                    if (data.data.result.page_current !== data.data.result.page_total) {
                         morePages = true;
                    }

                    const events = {
                         events: data.data.result.events ?? [],
                         totalResults: data.data.result.totalResults ?? 0,
                         curPage: data.data.result.page_current ?? 0,
                         totalPages: data.data.result.page_total ?? 0,
                         hasMore: morePages,
                         filter: data.data.result.filter ?? filterBy,
                         message: data.data?.result?.message ?? null }

                    updateSavedEvents(events.events);
                    updateEvents(data.data.result ?? []);

                    if (data.data.totalPages) {
                         let tmp = getTermFromDictionary(language, 'page_of_page');
                         tmp = tmp.replace('%1%', page);
                         tmp = tmp.replace('%2%', data.data.totalPages);
                         setPaginationLabel(tmp);
                    }
               } else {
                    logDebugMessage("Error fetching saved events for user");
                    logDebugMessage(data);
                    getErrorMessage(data.code, data.problem)
               }
          },
          onSettle: () => setLoading(false),
          onError: (error) => {
               logDebugMessage("Error fetching saved events");
               logErrorMessage(error);
          }
     });

     const getActionButtons = () => {
          return (
               <Box
                   style={{ alignItems: 'center', padding: 8, borderBottomWidth: 1, backgroundColor: panelBg, borderColor }}
               >
                   <ButtonGroup alignItems="center" space="md" isAttached size="sm" style={{ paddingBottom: 4 }}>
                        <Button
                             variant={filterBy === 'all' ? 'solid' : 'outline'}
                             colorScheme="primary"
                             onPress={() => setFilterBy('all')}
                             style={{ backgroundColor: filterBy === 'all' ? undefined : surfaceBg }}>
                             <ButtonText>{getTermFromDictionary(language, 'all_events')}</ButtonText>
                        </Button>
                        <Button
                             variant={filterBy === 'upcoming' ? 'solid' : 'outline'}
                             colorScheme="primary"
                             onPress={() => setFilterBy('upcoming')}
                             style={{ backgroundColor: filterBy === 'upcoming' ? undefined : surfaceBg }}>
                             <ButtonText>{getTermFromDictionary(language, 'upcoming_events')}</ButtonText>
                        </Button>
                        <Button
                             variant={filterBy === 'past' ? 'solid' : 'outline'}
                             colorScheme="primary"
                             onPress={() => setFilterBy('past')}
                             style={{ backgroundColor: filterBy === 'past' ? undefined : surfaceBg }}>
                             <ButtonText>{getTermFromDictionary(language, 'past_events')}</ButtonText>
                        </Button>
                   </ButtonGroup>
               </Box>
          );
     };

     const Empty = () => {
          return (
               <Center style={{ marginTop: 20, marginBottom: 20 }}>
                   <Text bold size="lg">
                         {filterBy === 'upcoming' ? getTermFromDictionary(language, 'no_events_upcoming') : filterBy === 'past' ? getTermFromDictionary(language, 'no_events_past') : getTermFromDictionary(language, 'no_events_all')}
                    </Text>
               </Center>
          );
     };

     const Paging = () => {
          if (savedEvents?.totalResults > 0) {
               return (
                    <Box
                         style={{ padding: 8, backgroundColor: panelBg, borderTopWidth: 1, borderColor, flexWrap: 'nowrap', alignItems: 'center' }}>
                         <ScrollView horizontal>
                              <ButtonGroup size="sm" space="md">
                                   <Button onPress={() => setPage(page - 1)} isDisabled={page === 1} colorScheme="primary">
                                        <ButtonText>{getTermFromDictionary(language, 'previous')}</ButtonText>
                                   </Button>
                                   <Button
                                        colorScheme="primary"
                                        onPress={() => {
                                             if (!isPreviousData && data?.hasMore) {
                                                  logDebugMessage('Adding to page');
                                                  setPage(page + 1);
                                             }
                                        }}
                                        isDisabled={isPreviousData || !data?.hasMore}>
                                        <ButtonText>{getTermFromDictionary(language, 'next')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ScrollView>
                         <Text size="sm" style={{ marginTop: 8 }}>
                              {paginationLabel}
                         </Text>
                    </Box>
               );
          }
          return null;
     };

     const showSystemMessage = () => {
          if (_.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0' || obj.showOn === '1') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} queryClient={queryClient} />;
                    }
               });
          }
          return null;
     };

     const savedEventKeys = Object.keys(savedEvents ?? {});

     return (
          <Box style={{ flex: 1 }}>
               {_.size(systemMessagesForScreen) > 0 ? <Box safeArea={2}>{showSystemMessage()}</Box> : null}
               {getActionButtons()}
               {events.length === 0 || status === 'loading' || isFetching ? (
                    loadingSpinner()
               ) : status === 'error' ? (
                    loadError('Error', '')
               ) : (
                    <>
                         <FlatList data={savedEventKeys} ListEmptyComponent={Empty} ListFooterComponent={Paging} renderItem={({ item }) => <Item data={savedEvents[item]} filterBy={filterBy} setLoading={setLoading} />} keyExtractor={(item, index) => index.toString()} contentContainerStyle={{ paddingBottom: 30 }} />
                    </>
               )}
          </Box>
     );
};

/**
 * Item component that represents a single event item in the list of saved events. It displays the event's cover image, title, date, time, and registration requirement. The component also provides functionality to open the event details or remove the event from the saved list. It handles API calls to remove the event and refresh the user's profile.
 * @param data
 * @returns {React.JSX.Element}
 * @constructor
 */
const Item = (data) => {
     const filterBy = data.filterBy;
     const setLoading = data.setLoading;
     const event = data.data;
     const queryClient = useQueryClient();
     const { data: userState2 } = useUserState();
     const user = userState2?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const language = useActiveLanguage();
     const library = useLibrary();
     const { textColor, resolvedUiColors } = useTheme();
     const backgroundColor = resolvedUiColors.surface;
     const borderColor = resolvedUiColors.border;

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     let coverUrl = event.cover;
     if (_.isNull(event.cover)) {
          coverUrl = library.baseUrl + '/bookcover.php?size=medium&id=' + event.sourceId;
     }

     let registrationRequired = false;
     if (!_.isUndefined(event.registrationRequired)) {
          registrationRequired = event.registrationRequired;
     }

     let hasPassed = false;
     if (typeof event.pastEvent !== 'undefined') {
          hasPassed = event.pastEvent;
     }

     const start = event.startDate ?? null;
     const end = event.endDate ?? null;
     let displayDay = false;
     let displayStartTime = false;
     let displayEndTime = false;
     let day = '';
     let time1arr = '';
     let time2arr = '';
     let startTime = null;
     let endTime = null;

     if (start) {
          startTime = start.date;
          let time1 = startTime.split(' ');
          day = time1[0];
          time1arr = time1[1].split(':');
          displayDay = moment(day);
          displayStartTime = moment().set({ hour: time1arr[0], minute: time1arr[1] });
          displayDay = moment(displayDay).format('dddd, MMMM D, YYYY');
          displayStartTime = moment(displayStartTime).format('h:mm A');
     }

     if (end) {
          endTime = end.date;
          let time2 = endTime.split(' ');
          time2arr = time2[1].split(':');
          displayEndTime = moment().set({ hour: time2arr[0], minute: time2arr[1] });
          displayEndTime = moment(displayEndTime).format('h:mm A');
     }

     const key = 'medium_' + event.sourceId;

     let source = event.source;
     if (event.source === 'lc') {
          source = 'library_calendar';
     }
     if (event.source === 'libcal') {
          source = 'springshare';
     }

     const openEvent = () => {
          if (!event.pastEvent && event.endDate) {
               if (event.bypass) {
                    openURL(event.url);
               } else {
                    navigate('EventDetails', {
                         id: event.sourceId,
                         title: getCleanTitle(event.title),
                         url: library.baseUrl,
                         source: source });
               }
          }
     };

     const openURL = async (url) => {
          const browserParams = {
               enableDefaultShareMenuItem: false,
               presentationStyle: 'automatic',
               showTitle: false,
               toolbarColor: backgroundColor,
               controlsColor: textColor,
               secondaryToolbarColor: backgroundColor };
          await WebBrowser.openBrowserAsync(url, browserParams)
               .then((res) => {
                    logDebugMessage(res);
                    if (res.type === 'cancel' || res.type === 'dismiss') {
                         logDebugMessage('User closed or dismissed window.');
                         WebBrowser.dismissBrowser();
                         WebBrowser.coolDownAsync();
                    }
               })
               .catch(async (err) => {
                    if (err.message === 'Another WebBrowser is already being presented.') {
                         try {
                              WebBrowser.dismissBrowser();
                              WebBrowser.coolDownAsync();
                              await WebBrowser.openBrowserAsync(url, browserParams)
                                   .then((response) => {
                                        logDebugMessage(response);
                                        if (response.type === 'cancel') {
                                             logDebugMessage('User closed window.');
                                        }
                                   })
                                   .catch(async (error) => {
                                        logWarnMessage('Unable to close previous browser session.');
                                   });
                         } catch (error) {
                              logErrorMessage('Really borked.');
                         }
                    } else {
                         popToast(getTermFromDictionary('en', 'error_no_open_resource'), getTermFromDictionary('en', 'error_device_block_browser'), 'error');
                         logErrorMessage(err);
                    }
               });
     };

     const removeEvent = async () => {
          setLoading(true);
          await removeSavedEvent(event.sourceId, language, library.baseUrl).then((result) => {
               setLoading(false);
               queryClient.invalidateQueries({ queryKey: ['saved_events', user.id, library.baseUrl, 1, filterBy] });
               refreshAndSaveUserProfile();
               queryClient.invalidateQueries({ queryKey: ['event', event.sourceId, source, language, library.baseUrl] });
               if (result.success || result.success === 'true') {
                    popAlert(getTermFromDictionary(language, 'removed_successfully'), result.message, 'success');
               } else {
                    popAlert(getTermFromDictionary(language, 'error'), result.message, 'error');
               }
          });
     };

     return (
         <Pressable style={{ borderBottomWidth: 1, borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={openEvent}>
               <HStack space="md">
                    {event.cover ? (
                        <VStack style={{ maxWidth: '35%' }}>
                              {hasPassed ? (
                                   <Box style={{ width: '100%', zIndex: 1 }}>
                                        <Badge colorScheme="warning" variant="solid" style={{ marginBottom: -12, marginLeft: -4, borderRadius: 8 }}>
                                             <BadgeText colorScheme="warning" size="xs">
                                                  {getTermFromDictionary(language, 'flag_past')}
                                             </BadgeText>
                                        </Badge>
                                   </Box>
                              ) : null}
                              <Image
                                   alt={event.title}
                                   source={coverUrl}
                                   style={{
                                        width: 100,
                                        height: 150,
                                        borderRadius: 8 }}
                                   placeholder={blurhash}
                                   transition={1000}
                                   contentFit="cover"
                              />

                              <Button size="sm" variant="ghost" action="negative" onPress={() => removeEvent()}>
                                   <MaterialIcons name="delete" size={14} style={{ marginRight: 4 }} />
                                   <ButtonText>{getTermFromDictionary(language, 'remove')}</ButtonText>
                              </Button>
                         </VStack>
                    ) : null}

                    <VStack style={{ width: event.cover ? '65%' : '100%' }}>
                         <Text
                              bold
                              size="md"
                             >
                              {event.title}
                         </Text>
                         {event.startDate && event.endDate ? (
                              <>
                                   <Text>
                                        {displayDay}
                                   </Text>
                                   <Text>
                                        {displayStartTime} - {displayEndTime}
                                   </Text>
                              </>
                         ) : event.startDate && !event.endDate ? (
                              <>
                                   <Text>
                                        {displayDay}
                                   </Text>
                                   <Text>
                                        {displayStartTime}
                                   </Text>
                              </>
                         ) : null}
                         {!event.cover ? (
                              <Box style={{ alignItems: 'flex-start', paddingTop: 8 }}>
                                   <Button size="sm" variant="ghost" action="negative" style={{ padding: 0 }} onPress={() => removeEvent()}>
                                        <MaterialIcons name="delete" size={14} style={{ marginRight: 4 }} />
                                        <ButtonText>{getTermFromDictionary(language, 'remove')}</ButtonText>
                                   </Button>
                              </Box>
                         ) : null}
                         {registrationRequired ? (
                              <HStack style={{ marginTop: 6, flexWrap: 'wrap' }} space="xs">
                                   <Badge key={0} colorScheme="muted" variant="outline" style={{ marginTop: 4, borderRadius: 8 }}>
                                        <BadgeText colorScheme="muted" size="sm">
                                             {getTermFromDictionary(language, 'registration_required')}
                                        </BadgeText>
                                   </Badge>
                              </HStack>
                         ) : null}
                    </VStack>
               </HStack>
          </Pressable>
     );
};
