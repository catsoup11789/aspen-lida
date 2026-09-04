import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { FlatList, Platform } from 'react-native';
import { ThemedBadge, ThemedBadgeText } from '@/src/components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { loadError } from '@/src/components/loadError';
import { popToast } from '@/src/components/feedback';
import { loadingSpinner } from '@/src/components/loadingSpinner';
import { DisplaySystemMessage } from '@/src/components/Notifications';
import { SystemMessagesContext } from '@/src/context/initialContext';
import { getCleanTitle } from '@/src/helpers/item';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary as getTermFromDictionaryHelper } from '../../../translations/TranslationHelper';
import { getListTitles, removeTitlesFromList } from '@/src/util/api/list';
import EditList from './EditList';
import {logDebugMessage, logErrorMessage, logInfoMessage} from '@/src/util/logging';
import { useActiveLanguage, useDictionary } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * MyList component that displays a list of titles in a user's list. It fetches data from the API based on the provided list ID and renders a list of titles with sorting and pagination options. It also handles system messages, error states, and allows users to remove titles from the list.
 * @param param0
 * @param param0.route
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MyList = ({ route }) => {
     const providedList = route?.params?.details ?? {};
     const id = providedList.id;
     const [page, setPage] = React.useState(1);
     const [sort, setSort] = React.useState('dateAdded');
     const [pageSize, setPageSize] = React.useState(20);
     const library = useLibrary();
     const [list] = React.useState(providedList);
     const language = useActiveLanguage();
     const dictionary = useDictionary();
     const insets = useSafeAreaInsets();
     const [sortBy, setSortBy] = React.useState({
          title: 'Sort By Title',
          dateAdded: 'Sort By Date Added',
          recentlyAdded: 'Sort By Recently Added',
          custom: 'Sort By User Defined' });
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { textColor, uiColors, colorMode } = useTheme();
     const [paginationLabel, setPaginationLabel] = React.useState('Page 1 of 1');
     const [isLoading, setIsLoading] = React.useState(true);
     const [fetchError, setFetchError] = React.useState(null);
     const [listData, setListData] = React.useState({
          listTitles: [],
          totalResults: 0,
          curPage: 1,
          totalPages: 1,
          hasMore: false,
          sort,
          message: null });
     const hasAppliedDefaultSort = React.useRef(false);
     const browserBackgroundColor = colorMode === 'light' ? '#ffffff' : '#111827';
     const panelBg = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const dangerColor = uiColors.danger;
     const t = React.useCallback((key, ellipsis = false, forcedLanguage) => {
          const lang = forcedLanguage || language;
          return getTermFromDictionaryHelper(lang, key, ellipsis, dictionary);
     }, [language, dictionary]);
     const dayFormatter = React.useMemo(
          () => new Intl.DateTimeFormat(language || undefined, {
               weekday: 'long',
               month: 'long',
               day: 'numeric',
               year: 'numeric' }),
          [language]
     );
     const timeFormatter = React.useMemo(
          () => new Intl.DateTimeFormat(language || undefined, {
               hour: 'numeric',
               minute: '2-digit' }),
          [language]
     );

     const systemMessagesForScreen = React.useMemo(() => {
          if (!Array.isArray(systemMessages)) return [];
          return systemMessages.filter((obj) => obj.showOn === '0');
     }, [systemMessages]);

     React.useEffect(() => {
          setSortBy((prev) => {
               const next = { ...prev };

               const title = t('sort_by_title');
               if (!title.includes('%1%')) next.title = title;

               const dateAdded = t('sort_by_date_added');
               if (!dateAdded.includes('%1%')) next.dateAdded = dateAdded;

               const recentlyAdded = t('sort_by_recently_added');
               if (!recentlyAdded.includes('%1%')) next.recentlyAdded = recentlyAdded;

               const custom = t('sort_by_user_defined');
               if (!custom.includes('%1%')) next.custom = custom;

               return next;
          });
     }, [t]);

     const loadListDetails = React.useCallback(async (targetPage, targetSort) => {
          setIsLoading(true);
          setFetchError(null);
          try {
               const data = await getListTitles(id, library.baseUrl, targetPage, pageSize, pageSize, targetSort);
               setListData(data);
               let tmp = t('page_of_page');
               tmp = tmp.replace('%1%', data.curPage ?? targetPage);
               tmp = tmp.replace('%2%', data.totalPages ?? 1);
               setPaginationLabel(tmp);
          } catch (error) {
               logDebugMessage('Error fetching user list titles for list ' + id);
               logErrorMessage(error);
               setFetchError(error);
          } finally {
               setIsLoading(false);
          }
     }, [id, library.baseUrl, pageSize, t]);

     React.useEffect(() => {
          loadListDetails(page, sort);
     }, [page, sort, loadListDetails]);

     const handleOpenItem = (id, title) => {
          navigateStack('AccountScreenTab', 'ListItem', {
               id: id,
               url: library.baseUrl,
               title: getCleanTitle(title) });
     };

     const handleOpenEvent = (item) => {
          if (item.bypass) {
               openURL(item.url);
          } else {
               navigateStack('AccountScreenTab', 'ListItemEvent', {
                    id: item.id,
                    url: library.baseUrl,
                    title: getCleanTitle(item.title),
                    source: item.source });
          }
     };

     const openURL = async (url) => {
          const browserParams = {
               enableDefaultShareMenuItem: false,
               presentationStyle: 'automatic',
               showTitle: false,
               toolbarColor: browserBackgroundColor,
               controlsColor: textColor,
               secondaryToolbarColor: browserBackgroundColor };
          await WebBrowser.openBrowserAsync(url, browserParams)
               .then((res) => {
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
                                        logInfoMessage('Unable to close previous browser session.');
                                   });
                         } catch (error) {
                              logErrorMessage('Really borked.');
                         }
                    } else {
                         popToast(t('error_no_open_resource', false, 'en'), t('error_device_block_browser', false, 'en'), 'error');
                         logErrorMessage(err);
                    }
               });
     };

     React.useEffect(() => {
          if (!hasAppliedDefaultSort.current && listData?.sort && listData.sort !== sort) {
               hasAppliedDefaultSort.current = true;
               setSort(listData.sort);
          }
     }, [listData?.sort, sort]);

     const renderItem = (item) => {
          const imageUrl = item.image;

          if (item.recordType === 'event') {
               let registrationRequired = false;
               if (item.registration_required !== undefined) {
                    registrationRequired = item.registration_required;
               }

               const startTime = item.start_date.date;
               const endTime = item.end_date.date;
               const normalizeDateTime = (value) => {
                    if (!value || typeof value !== 'string') return null;
                    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
                    const parsed = new Date(normalized);
                    return Number.isNaN(parsed.getTime()) ? null : parsed;
               };

               const startDate = normalizeDateTime(startTime);
               const endDate = normalizeDateTime(endTime);
               const displayDay = startDate ? dayFormatter.format(startDate) : '';
               const displayStartTime = startDate ? timeFormatter.format(startDate) : '';
               const displayEndTime = endDate ? timeFormatter.format(endDate) : '';

               return (
                    <Pressable style={{ borderBottomWidth: 1, borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={() => handleOpenEvent(item)}>
                         <HStack space="sm">
                              <VStack style={{ maxWidth: '35%' }}>
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
                                   <Button
                                        onPress={() => {
                                             removeTitlesFromList(id, item.id, library.baseUrl, 'Events').then(async () => {
                                                       await loadListDetails(page, sort);
                                             });
                                        }}
                                        size="sm"
                                        variant="link">
                                        <MaterialIcons name="delete" size={18} color={dangerColor} />
                                        <ButtonText style={{ color: dangerColor }}>{t('delete')}</ButtonText>
                                   </Button>
                              </VStack>
                              <VStack style={{ width: '65%' }}>
                                   <Text
                                        bold
                                        size="sm"
                                       
                                        >
                                        {item.title}
                                   </Text>
                                   {item.start_date && item.end_date ? (
                                        <>
                                             <Text size="xs">{displayDay}</Text>
                                             <Text size="xs">
                                                  {displayStartTime} - {displayEndTime}
                                             </Text>
                                        </>
                                   ) : null}
                                   {registrationRequired ? (
                                        <HStack style={{ marginTop: 4, flexDirection: 'row', flexWrap: 'wrap' }} space="sm">
                                             <ThemedBadge key={0} action="info" variant="outline" size="sm" style={{ marginTop: 4, borderRadius: 8 }}>
                                                  <ThemedBadgeText action="info">{t('registration_required')}</ThemedBadgeText>
                                             </ThemedBadge>
                                        </HStack>
                                   ) : null}
                              </VStack>
                         </HStack>
                    </Pressable>
               );
          }

          return (
               <Pressable style={{ borderBottomWidth: 1, borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={() => handleOpenItem(item.id, item.title)}>
                    <HStack space="sm">
                         <VStack style={{ maxWidth: '35%' }}>
                              <Image
                                   alt={item.title}
                                   source={imageUrl}
                                   style={{
                                        width: 100,
                                        height: 150,
                                        borderRadius: 8
                                   }}
                                   placeholder={blurhash}
                                   transition={1000}
                                   contentFit="cover"
                              />
                              <Button
                                   onPress={() => {
                                        removeTitlesFromList(id, item.id, library.baseUrl, 'GroupedWork').then(async () => {
                                             await loadListDetails(page, sort);
                                        });
                                   }}
                                   size="sm"
                                   variant="link">
                                   <MaterialIcons name="delete" size={18} color={dangerColor} style={{ marginRight: 4 }} />
                                   <ButtonText style={{ color: dangerColor }}>{t('delete')}</ButtonText>
                              </Button>
                         </VStack>
                         <VStack style={{ width: '65%' }}>
                              <Text
                                   bold
                                   size="sm"
                                  
                                   >
                                   {item.title}
                              </Text>
                              {item.author ? (
                                   <Text size="xs">
                                        {t('by')} {item.author}
                                   </Text>
                              ) : null}
                         </VStack>
                    </HStack>
               </Pressable>
          );
     };

     const Paging = () => {
          return (
               <Box
                    style={{ padding: 8, backgroundColor: panelBg, borderBottomWidth: 1, borderColor, flexWrap: 'nowrap', alignItems: 'center' }}>
                    <ScrollView horizontal>
                         <ButtonGroup size="sm">
                              <Button colorScheme="primary" onPress={() => setPage(page - 1)} isDisabled={page === 1}>
                                   <ButtonText>{t('previous')}</ButtonText>
                              </Button>
                              <Button
                                   colorScheme="primary"
                                   onPress={() => {
                                        if (listData?.hasMore) {
                                             logDebugMessage('Adding to page');
                                             setPage(page + 1);
                                        }
                                   }}
                                   isDisabled={isLoading || !listData?.hasMore}>
                                   <ButtonText>{t('next')}</ButtonText>
                              </Button>
                         </ButtonGroup>
                    </ScrollView>
                    <Text size="sm" style={{ marginTop: 8 }}>
                         {paginationLabel}
                    </Text>
               </Box>
          );
     };

     const getActionButtons = () => {
          let sortLength = 8 * sortBy.dateAdded.length + 80;
          if (sort === 'title') {
               sortLength = 8 * sortBy.title.length + 80;
          } else if (sort === 'recentlyAdded') {
               sortLength = 8 * sortBy.recentlyAdded.length + 80;
          } else if (sort === 'custom') {
               sortLength = 8 * sortBy.custom.length + 80;
          } else if (sort === 'dateAdded') {
               sortLength = 8 * sortBy.dateAdded.length + 80;
          }

          const sortLabel = () => {
               switch (sort) {
                    case "recentlyAdded":
                         return sortBy.recentlyAdded;
                    case "custom":
                         return sortBy.custom;
                    case "title":
                         return sortBy.title;
                    case "dateAdded":
                         return sortBy.dateAdded;
                    default:
                         return t('select_sort_method');
               }
          };

          return (
               <Box
                    style={{ padding: 8, backgroundColor: panelBg, borderBottomWidth: 1, borderColor, flexWrap: 'nowrap' }}>
                    <ScrollView horizontal>
                         <HStack space="sm">
                              <FormControl style={{ width: sortLength }}>
                                   <Select
                                        name="sortBy"
                                        selectedValue={sort}
                                        defaultValue={sort}
                                        accessibilityLabel={t('select_sort_method')}
                                        onValueChange={(itemValue) => setSort(itemValue)}>
                                        <SelectTrigger variant="outline" size="sm">
                                             <SelectInput style={{ paddingVertical: 0, color: textColor }} value={sortLabel()} />
                                        </SelectTrigger>
                                        <SelectPortal>
                                             <SelectBackdrop />
                                             <SelectContent
                                                  style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                                             >
                                                  <SelectDragIndicatorWrapper>
                                                       <SelectDragIndicator />
                                                  </SelectDragIndicatorWrapper>
                                                  <SelectScrollView>
                                                       <SelectItem label={sortBy.title} value="title" key={0} selectedValue={sort} />
                                                       <SelectItem label={sortBy.dateAdded} value="dateAdded" key={1} selectedValue={sort} />
                                                       <SelectItem label={sortBy.recentlyAdded} value="recentlyAdded" key={2} selectedValue={sort} />
                                                       <SelectItem label={sortBy.custom} value="custom" key={3} selectedValue={sort} />
                                                  </SelectScrollView>
                                             </SelectContent>
                                        </SelectPortal>
                                   </Select>
                              </FormControl>
                              <EditList data={list} listId={id} />
                         </HStack>
                    </ScrollView>
               </Box>
          );
     };

     const showSystemMessage = () => {
          if (Array.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} />;
                    }
                    return null;
               });
          }
          return null;
     };

     return (
          <Box style={{ flex: 1 }}>
               {systemMessagesForScreen.length > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
               {isLoading ? (
                    loadingSpinner()
               ) : fetchError ? (
                    loadError('Error', '')
               ) : (
                    <>
                         <Box style={{ paddingBottom: 100 }}>
                              {getActionButtons()}
                              <FlatList data={listData.listTitles} ListFooterComponent={Paging} renderItem={({ item }) => renderItem(item, library.baseUrl)} keyExtractor={(item, index) => index.toString()} />
                         </Box>
                    </>
               )}
          </Box>
     );
};
