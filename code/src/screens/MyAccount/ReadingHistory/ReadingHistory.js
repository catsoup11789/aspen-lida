import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accordion, AccordionContent, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { ThemedAlert, ThemedAlertIcon, ThemedAlertText } from '@/src/components/themed/ThemedAlert';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { HStack } from '@/components/ui/hstack';
import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { loadError } from '@/src/components/loadError';
import { loadingSpinner } from '@/src/components/loadingSpinner';
import { DisplaySystemMessage } from '@/src/components/Notifications';
import { SystemMessagesContext } from '@/src/context/initialContext';
import { useUserState, useReadingHistory, useUpdateReadingHistory, useUpdateUserProfile } from '@/src/hooks/useUserData';
import { getAuthor, getCleanTitle, getDateLastUsed, getFormat, getTitle } from '@/src/helpers/item';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { deleteAllReadingHistory, deleteSelectedReadingHistory, fetchReadingHistory, optIntoReadingHistory, optOutOfReadingHistory, refreshProfile } from '@/src/util/api/user';
import { formatReadingHistory } from '@/src/util/api/userHelper';
import AddToList from '../../Search/AddToList';
import { logDebugMessage, logErrorMessage, getErrorMessage } from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * MyReadingHistory component that displays the user's reading history. It fetches the reading history from the API and renders it in a FlatList. It also handles system messages, loading states, error states, and user actions such as opting in/out of reading history and deleting all history.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MyReadingHistory = () => {
     const navigation = useNavigation();
     const [isLoading, setLoading] = React.useState(false);
     const [fetchError, setFetchError] = React.useState(null);
     const [page, setPage] = React.useState(1);
     const [sort, setSort] = React.useState('checkedOut');
     const [searchTerm, setSearchTerm] = React.useState('');
     const [filter, setFilter] = React.useState('');
     const library = useLibrary();
     const language = useActiveLanguage();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const { data: readingHistory } = useReadingHistory();
     const updateReadingHistory = useUpdateReadingHistory();
     const insets = useSafeAreaInsets();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const pageSize = 20;
     const systemMessagesForScreen = React.useMemo(() => {
          if (!Array.isArray(systemMessages)) return [];
          return systemMessages.filter((obj) => obj.showOn === '0');
     }, [systemMessages]);
     const [paginationLabel, setPaginationLabel] = React.useState('Page 1 of 1');
     const { uiColors, textColor, colorMode } = useTheme();
     const panelBg = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const dangerColor = uiColors.danger;
     const pageHistory = React.useMemo(() => {
          if (!Array.isArray(readingHistory?.history)) return [];
          return readingHistory.history.slice(0, pageSize);
     }, [readingHistory?.history, pageSize]);

     const [sortBy, setSortBy] = React.useState({
          title: 'Sort by Title',
          author: 'Sort by Author',
          format: 'Sort by Format',
          last_used: 'Sort by Last Used' });

     React.useLayoutEffect(() => {
          navigation.setOptions({
               headerLeft: () => <Box /> });
     }, [navigation]);

     React.useEffect(() => {
          setSortBy((prev) => ({
               ...prev,
               title: getTermFromDictionary(language, 'sort_by_title').includes('%1%') ? prev.title : getTermFromDictionary(language, 'sort_by_title'),
               author: getTermFromDictionary(language, 'sort_by_author').includes('%1%') ? prev.author : getTermFromDictionary(language, 'sort_by_author'),
               format: getTermFromDictionary(language, 'sort_by_format').includes('%1%') ? prev.format : getTermFromDictionary(language, 'sort_by_format'),
               last_used: getTermFromDictionary(language, 'sort_by_last_used').includes('%1%') ? prev.last_used : getTermFromDictionary(language, 'sort_by_last_used') }));
     }, [language]);

     const [isOpen, setIsOpen] = React.useState(false);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);
     const [optingOut, setOptingOut] = React.useState(false);

     const [deleteAllIsOpen, setDeleteAllIsOpen] = React.useState(false);
     const onCloseDeleteAll = () => setDeleteAllIsOpen(false);
     const deleteAllCancelRef = React.useRef(null);
     const [deleting, setDeleting] = React.useState(false);

     const [optingIn, setOptingIn] = React.useState();

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     const refreshReadingHistory = React.useCallback(async (options = {}) => {
          const targetPage = options.page ?? 1;
          const targetSort = options.sort ?? 'checkedOut';
          const targetSearchTerm = options.searchTerm ?? '';

          setLoading(true);
          setFetchError(null);
          try {
               const data = await fetchReadingHistory(targetPage, pageSize, targetSort, targetSearchTerm, library.baseUrl);
               if (data.ok) {
                    const tmpReadingHistory = formatReadingHistory(data.data.result);
                    tmpReadingHistory.history = Array.isArray(tmpReadingHistory.history)
                         ? tmpReadingHistory.history.slice(0, pageSize)
                         : [];
                    await updateReadingHistory(tmpReadingHistory);
                    let tmp = getTermFromDictionary(language, 'page_of_page');
                    tmp = tmp.replace('%1%', tmpReadingHistory.curPage || targetPage);
                    tmp = tmp.replace('%2%', tmpReadingHistory.totalPages || 1);
                    setPaginationLabel(tmp);
               } else {
                    logDebugMessage('Error fetching reading history for user');
                    logDebugMessage(data);
                    getErrorMessage(data.code, data.problem);
               }
          } catch (error) {
               logDebugMessage('Error fetching reading history for user');
               logErrorMessage(error);
               setFetchError(error);
          } finally {
               setLoading(false);
          }
     }, [pageSize, library.baseUrl, language, updateReadingHistory]);

     React.useEffect(() => {
          if (user.trackReadingHistory !== '1') {
               return;
          }
          refreshReadingHistory({ page, sort, searchTerm });
     }, [user.trackReadingHistory, library.baseUrl, language, refreshReadingHistory]);

     const optIn = async () => {
          setOptingIn(true);
          await optIntoReadingHistory(library.baseUrl);
          await refreshAndSaveUserProfile();
          setPage(1);
          setSort('checkedOut');
          setFilter('');
          setSearchTerm('');
          await refreshReadingHistory({ page: 1, sort: 'checkedOut', searchTerm: '' });
          setOptingIn(false);
     };

     const optOut = async () => {
          setOptingOut(true);
          await optOutOfReadingHistory(library.baseUrl);
          await deleteAllReadingHistory(library.baseUrl);
          await refreshAndSaveUserProfile();
          await updateReadingHistory(formatReadingHistory({}));
          setIsOpen(false);
          setOptingOut(false);
     };

     const deleteAll = async () => {
          setDeleting(true);
          await deleteAllReadingHistory(library.baseUrl);
          await refreshAndSaveUserProfile();
          setPage(1);
          await refreshReadingHistory({ page: 1 });
          setDeleteAllIsOpen(false);
          setDeleting(false);
     };

     const updateSort = async (value) => {
          logDebugMessage('updateSort for reading history: ' + value);
          setSort(value);
          setPage(1);
          await refreshReadingHistory({ page: 1, sort: value, searchTerm });
     };

     const updatePage = async (value) => {
          logDebugMessage('updatePage for reading history: ' + value);
          setPage(value);
          await refreshReadingHistory({ page: value, sort, searchTerm });
     };

     const search = async () => {
          logDebugMessage('updateSearchTerm for reading history: ' + filter);
          setPage(1);
          setSearchTerm(filter);
          await refreshReadingHistory({ page: 1, sort, searchTerm: filter });
     }

     const getDisclaimer = () => {
          return (
               <Accordion
                   type="single"
                   isCollapsible={true}
               >
                   <AccordionItem value="disclaimer-item" style={{ borderBottomWidth: 0, backgroundColor: panelBg }}>
                        <AccordionHeader style={{ backgroundColor: surfaceBg }}>
                             <AccordionTrigger style={{ paddingHorizontal: 20, paddingVertical: 4 }}>
                                   {({ isExpanded }) => (
                                        <>
                                             <AccordionTitleText size="xs" style={{ color: textColor, flex: 1 }}>
                                                  {getTermFromDictionary(language, 'reading_history_privacy_notice')}
                                             </AccordionTitleText>
                                             <AccordionIcon
                                                  as={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                                                  style={{ color: textColor }}
                                             />
                                        </>
                                   )}
                             </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent style={{ backgroundColor: 'transparent', padding: 0, paddingTop: 8, paddingHorizontal: 20 }}>
                              <ThemedAlert action="info">
                                   <ThemedAlertIcon action="info" as={InfoIcon} style={{ marginRight: 12 }} />
                                   <ThemedAlertText action="info" size="xs">
                                        {getTermFromDictionary(language, 'reading_history_disclaimer')}
                                   </ThemedAlertText>
                              </ThemedAlert>
                         </AccordionContent>
                    </AccordionItem>
               </Accordion>
          );
     };

     const getActionButtons = () => {
          const { uiColors, textColor, colorMode } = useTheme();

          let sortLength = 8 * sortBy.last_used.length + 80;
          if (sort === 'author') {
               sortLength = 8 * sortBy.author.length + 80;
          } else if (sort === 'format') {
               sortLength = 8 * sortBy.format.length + 80;
          } else if (sort === 'title') {
               sortLength = 8 * sortBy.title.length + 80;
          } else if (sort === 'checkedOut') {
               sortLength = 8 * sortBy.last_used.length + 80;
          }

          const sortLabel = () => {
               switch (sort) {
                    case "author":
                         return sortBy.author;
                    case "format":
                         return sortBy.format;
                    case "checkedOut":
                         return sortBy.last_used;
                    case "title":
                         return sortBy.title;
                    default:
                         return getTermFromDictionary(language, 'select_sort_method');
               }
          };

          return (
               <Box
                   style={{ padding: 20, backgroundColor: panelBg, borderBottomWidth: 1, borderColor, flexWrap: 'nowrap' }}>
                   <VStack space="sm">
                        <ThemedInput style={{ borderColor: colorMode === 'light' ? 'transparent' : borderColor }}>
                             <ThemedInputField
                                   returnKeyType="search"
                                   autoCapitalize="none"
                                   onChangeText={(term) => setFilter(term)}
                                   inputMode="search"
                                   value={filter}
                                   placeholder={getTermFromDictionary(language, 'search')}
                                   onSubmitEditing={search} />
                        </ThemedInput>
                        <ScrollView horizontal>
                             <HStack space="sm">
                                   <FormControl style={{ width: sortLength }}>
                                       <Select
                                            name="sortBy"
                                            selectedValue={sort}
                                            defaultValue={sort}
                                            accessibilityLabel={getTermFromDictionary(language, 'select_sort_method')}
                                            onValueChange={(itemValue) => updateSort(itemValue)}>
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
                                                            <SelectItem label={sortBy.author} value="author" key={1} selectedValue={sort} />
                                                            <SelectItem label={sortBy.last_used} value="checkedOut" key={2} selectedValue={sort} />
                                                            <SelectItem label={sortBy.format} value="format" key={3} selectedValue={sort} />
                                                       </SelectScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                                   <ButtonGroup size="sm" variant="solid">
                                        <Button style={{ backgroundColor: dangerColor }} onPress={() => setDeleteAllIsOpen(true)}>
                                             <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'reading_history_delete_all')}</ButtonText>
                                        </Button>
                                        <Button style={{ backgroundColor: dangerColor }} onPress={() => setIsOpen(true)}>
                                             <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'reading_history_opt_out')}</ButtonText>
                                        </Button>
                                   </ButtonGroup>
                              </HStack>
                         </ScrollView>
                    </VStack>

                    <Center>
                         <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                              <AlertDialogBackdrop />
                              <AlertDialogContent style={{ backgroundColor: surfaceBg }}>
                                   <AlertDialogHeader>
                                        <Heading size="md">{getTermFromDictionary(language, 'reading_history_opt_out')}</Heading>
                                   </AlertDialogHeader>
                                   <AlertDialogBody>
                                        <Text>{getTermFromDictionary(language, 'reading_history_opt_out_warning')}</Text>
                                   </AlertDialogBody>
                                   <AlertDialogFooter>
                                        <ButtonGroup space="sm">
                                             <Button style={{ borderColor }} variant="outline" onPress={onClose}>
                                                  <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             <Button style={{ backgroundColor: dangerColor }} isLoading={optingOut} isLoadingText={getTermFromDictionary(language, 'updating', true)} onPress={optOut} ref={cancelRef}>
                                                  <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                             </Button>
                                        </ButtonGroup>
                                   </AlertDialogFooter>
                              </AlertDialogContent>
                         </AlertDialog>
                    </Center>

                    <Center>
                         <AlertDialog leastDestructiveRef={deleteAllCancelRef} isOpen={deleteAllIsOpen} onClose={onCloseDeleteAll}>
                              <AlertDialogBackdrop />
                              <AlertDialogContent style={{ backgroundColor: surfaceBg }}>
                                   <AlertDialogHeader>
                                        <Heading size="md">{getTermFromDictionary(language, 'reading_history_delete_all')}</Heading>
                                   </AlertDialogHeader>
                                   <AlertDialogBody>
                                        <Text>{getTermFromDictionary(language, 'reading_history_delete_all_warning')}</Text>
                                   </AlertDialogBody>
                                   <AlertDialogFooter>
                                        <ButtonGroup space="sm">
                                             <Button style={{ borderColor }} variant="outline" onPress={onCloseDeleteAll}>
                                                  <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             <Button style={{ backgroundColor: dangerColor }} isLoading={deleting} isLoadingText={getTermFromDictionary(language, 'deleting', true)} onPress={deleteAll} ref={cancelRef}>
                                                  <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                             </Button>
                                        </ButtonGroup>
                                   </AlertDialogFooter>
                              </AlertDialogContent>
                         </AlertDialog>
                    </Center>
               </Box>
          );
     };

     const Empty = () => {
          return (
               <Center style={{ marginTop: 20, marginBottom: 20 }}>
                   <Text bold size="lg">
                         {getTermFromDictionary(language, 'reading_history_empty')}
                    </Text>
               </Center>
          );
     };

     const Paging = () => {
          if (readingHistory?.totalResults > 0) {
               return (
                    <Box
                         style={{ padding: 8, borderTopWidth: 1, backgroundColor: panelBg, borderColor, flexWrap: 'nowrap', alignItems: 'center' }}>
                         <ScrollView horizontal>
                              <ButtonGroup size="sm">
                                   <Button
                                       colorScheme="primary"
                                       onPress={async () => {
                                           if (page > 1) {
                                                await updatePage(page - 1)
                                            }
                                        }}
                                        isDisabled={page === 1}>
                                       <ButtonText>{getTermFromDictionary(language, 'previous')}</ButtonText>
                                   </Button>
                                   <Button
                                       colorScheme="primary"
                                        onPress={async () => {
                                             if (readingHistory?.hasMore) {
                                                  logDebugMessage('Adding to page');
                                                  let newPage = page + 1;
                                                  await updatePage(newPage);
                                             }
                                        }}
                                         isDisabled={!readingHistory?.hasMore || isLoading}>
                                         <ButtonText>{getTermFromDictionary(language, 'next')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ScrollView>
                         <Text size="sm" style={{ marginTop: 8 }}>
                              {paginationLabel}
                         </Text>
                    </Box>
               );
          }else{
               return null;
          }
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

     const handleItemDelete = React.useCallback(async () => {
          await refreshReadingHistory({ page, sort, searchTerm });
     }, [refreshReadingHistory, page, sort, searchTerm]);

     const renderReadingHistoryItem = React.useCallback(({ item }) => {
          return <Item data={item} onDelete={handleItemDelete} />;
     }, [handleItemDelete]);

     const readingHistoryKeyExtractor = React.useCallback((item, index) => {
          if (item?.id != null) {
               return String(item.id);
          }
          return index.toString();
     }, []);

     return (
          <Box style={{ flex: 1 }}>
               {systemMessagesForScreen.length > 0 ? <Box style={{ padding: 8 }}>{showSystemMessage()}</Box> : null}
               {user.trackReadingHistory !== '1' ? (
                   <Box style={{ padding: 20 }}>
                        <Button colorScheme="primary" onPress={optIn} isLoading={optingIn} isLoadingText={getTermFromDictionary(language, 'updating', true)}>
                             <ButtonText>{getTermFromDictionary(language, 'reading_history_opt_in')}</ButtonText>
                         </Button>
                         {getDisclaimer()}
                    </Box>
               ) : (
                    <>
                         {getActionButtons()}
                          {isLoading ? (
                              loadingSpinner()
                          ) : fetchError ? (
                              loadError('Error', '')
                         ) : (
                              <>
                                    <FlatList
                                         data={pageHistory}
                                         ListEmptyComponent={Empty}
                                         ListFooterComponent={Paging}
                                         ListHeaderComponent={getDisclaimer}
                                         renderItem={renderReadingHistoryItem}
                                         keyExtractor={readingHistoryKeyExtractor}
                                         initialNumToRender={8}
                                         maxToRenderPerBatch={8}
                                         windowSize={5}
                                         removeClippedSubviews={Platform.OS !== 'ios'}
                                         contentContainerStyle={{ paddingBottom: 30 }}
                                    />
                              </>
                         )}
                    </>
               )}
          </Box>
     );
};

/**
 * Item component that represents a single reading history item. It displays the item's title, author, format, and last used date. It also provides actions to view item details or delete the item from the reading history.
 * @type {React.NamedExoticComponent<{readonly data?: *, readonly onDelete?: *}>}
 */
const Item = React.memo(({ data: item, onDelete }) => {
     const { data: userState2 } = useUserState();
     const user = userState2?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const library = useLibrary();
     const language = useActiveLanguage();
     const {textColor, colorMode, uiColors } = useTheme();
     const insets = useSafeAreaInsets();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const actionSheetBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;

     const [deleting, setDelete] = React.useState(false);
     const [isOpen, setIsOpen] = React.useState(false);
     const toggle = () => {
          setIsOpen(!isOpen);
     };

     const openGroupedWork = (item, title) => {
          navigateStack('AccountScreenTab', 'ItemDetails', {
               id: item,
               title: getCleanTitle(title),
               url: library.baseUrl,
               userContext: user,
               libraryContext: library });
     };

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     const deleteFromHistory = async (item) => {
          await deleteSelectedReadingHistory(item, library.baseUrl).then(async (result) => {
               if (result) {
                    await refreshAndSaveUserProfile();
                    if (typeof onDelete === 'function') {
                         await onDelete();
                    }
               }
          });
     };

     let url = library.baseUrl + '/bookcover.php?id=' + item.permanentId + '&size=medium';
     if (item.title) {
          return (
              <Pressable onPress={toggle} style={{ borderBottomWidth: 1, borderColor, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }}>
                    <HStack space="md">
                        <VStack style={{ maxWidth: '30%' }}>
                              <Image
                                   alt={item.title}
                                   source={url}
                                   style={{
                                        width: 100,
                                        height: 150,
                                        borderRadius: 8 }}
                                   placeholder={blurhash}
                                   transition={1000}
                                   contentFit="cover"
                              />
                              <AddToList itemId={item.permanentId} btnStyle="sm" />
                         </VStack>
                         <VStack style={{ width: '65%' }}>
                              {getTitle(item.title)}
                              {getAuthor(item.author)}
                              {getFormat(item.format)}
                              {getDateLastUsed(item.checkout, item.checkedOut)}
                         </VStack>
                    </HStack>
                    <Actionsheet isOpen={isOpen} onClose={toggle} size="full">
                         <ActionsheetBackdrop />
                         <ActionsheetContent
                             style={{ backgroundColor: actionSheetBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                         >
                             <Box style={{ width: '100%', height: 60, paddingHorizontal: 16, justifyContent: 'center' }}>
                                   <Text
                                       size="lg"
                                      >
                                        {getTitle(item.title)}
                                   </Text>
                              </Box>
                              {item.existsInCatalog ? (
                                   <ActionsheetItem
                                        onPress={() => {
                                             openGroupedWork(item.permanentId, item.title);
                                             toggle();
                                        }}>
                                        <ActionsheetIcon>
                                            <MaterialIcons name="search" size={18} color={textColor} style={{ marginRight: 4 }} />
                                        </ActionsheetIcon>
                                       <ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'view_item_details')}</ActionsheetItemText>
                                   </ActionsheetItem>
                              ) : null}
                              <ActionsheetItem
                                   isLoading={deleting}
                                   isLoadingText={getTermFromDictionary(language, 'removing', true)}
                                   onPress={async () => {
                                        setDelete(true);
                                        await deleteFromHistory(item.id).then(() => {
                                             setDelete(false);
                                        });
                                        toggle();
                                   }}>
                                   <ActionsheetIcon>
                                       <MaterialIcons name="delete" size={18} color={textColor} style={{ marginRight: 4 }} />
                                   </ActionsheetIcon>
                                   <ActionsheetItemText style={{ color: textColor }}>
                                        {getTermFromDictionary(language, 'reading_history_delete')}
                                   </ActionsheetItemText>
                              </ActionsheetItem>
                         </ActionsheetContent>
                    </Actionsheet>
               </Pressable>
          );
     }else{
          return (
               <Text>Unknown title</Text>
         );
     }
});

Item.displayName = 'ReadingHistoryItem';
