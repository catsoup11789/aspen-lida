import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Accordion, AccordionContent, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { ChevronDownIcon, ChevronUpIcon, Icon, InfoIcon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { loadError } from '../../../components/loadError';

import { loadingSpinner } from '../../../components/loadingSpinner';
import { DisplaySystemMessage } from '../../../components/Notifications';
import { SystemMessagesContext } from '../../../context/initialContext';
import { useUserState, useReadingHistory, useUpdateReadingHistory, useUpdateUserProfile } from '../../../hooks/useUserData';
import { getAuthor, getCleanTitle, getDateLastUsed, getFormat, getTitle } from '../../../helpers/item';
import { navigateStack } from '../../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { deleteAllReadingHistory, deleteSelectedReadingHistory, fetchReadingHistory, optIntoReadingHistory, optOutOfReadingHistory, refreshProfile } from '../../../util/api/user';
import { formatReadingHistory } from '../../../util/api/userHelper';
import AddToList from '../../Search/AddToList';

import { logDebugMessage, logErrorMessage, getErrorMessage } from '../../../util/logging.js';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

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
     const { theme, textColor, colorMode } = useTheme();
     const panelBg = colorMode === 'light' ? theme.tokens.colors.ui.surfaceMuted.light : theme.tokens.colors.ui.surfaceMuted.dark;
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const tertiaryBg = theme.tokens.colors.tertiary['300'] ?? theme.tokens.colors.tertiary['500'];
     const dangerColor = theme.tokens.colors.ui.danger;
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
                              <Alert action="info">
                                   <AlertIcon as={InfoIcon} style={{ marginRight: 12 }} />
                                   <AlertText size="xs">
                                        {getTermFromDictionary(language, 'reading_history_disclaimer')}
                                   </AlertText>
                              </Alert>
                         </AccordionContent>
                    </AccordionItem>
               </Accordion>
          );
     };

     const getActionButtons = () => {
          const { theme, textColor, colorMode } = useTheme();

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
                        <Input style={{ borderColor: colorMode === 'light' ? 'transparent' : borderColor }}>
                             <InputField
                                   returnKeyType="search"
                                   autoCapitalize="none"
                                   onChangeText={(term) => setFilter(term)}
                                   inputMode="search"
                                   value={filter}
                                   placeholder={getTermFromDictionary(language, 'search')}
                                   onSubmitEditing={search}
                                   style={{ color: textColor }} />
                        </Input>
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
                                                  <SelectIcon style={{ marginRight: 12 }}>
                                                       <Icon style={{ color: textColor }} as={ChevronDownIcon} />
                                                  </SelectIcon>
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
                                                            <SelectItem label={sortBy.title} value="title" key={0} style={{ backgroundColor: sort === "title" ? tertiaryBg : 'transparent' }} />
                                                            <SelectItem label={sortBy.author} value="author" key={1} style={{ backgroundColor: sort === "author" ? tertiaryBg : 'transparent' }} />
                                                            <SelectItem label={sortBy.last_used} value="checkedOut" key={2} style={{ backgroundColor: sort === "checkedOut" ? tertiaryBg : 'transparent' }} />
                                                            <SelectItem label={sortBy.format} value="format" key={3} style={{ backgroundColor: sort === "format" ? tertiaryBg : 'transparent' }} />
                                                       </SelectScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                                   <ButtonGroup size="sm" variant="solid">
                                        <Button style={{ backgroundColor: dangerColor }} onPress={() => setDeleteAllIsOpen(true)}>
                                             <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'reading_history_delete_all')}</ButtonText>
                                        </Button>
                                        <Button style={{ backgroundColor: dangerColor }} onPress={() => setIsOpen(true)}>
                                             <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'reading_history_opt_out')}</ButtonText>
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
                                        <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'reading_history_opt_out')}</Heading>
                                   </AlertDialogHeader>
                                   <AlertDialogBody>
                                        <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'reading_history_opt_out_warning')}</Text>
                                   </AlertDialogBody>
                                   <AlertDialogFooter>
                                        <ButtonGroup space="sm">
                                             <Button style={{ borderColor }} variant="outline" onPress={onClose}>
                                                  <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             <Button style={{ backgroundColor: dangerColor }} isLoading={optingOut} isLoadingText={getTermFromDictionary(language, 'updating', true)} onPress={optOut} ref={cancelRef}>
                                                  <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
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
                                        <Heading color={textColor} size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'reading_history_delete_all')}</Heading>
                                   </AlertDialogHeader>
                                   <AlertDialogBody>
                                        <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'reading_history_delete_all_warning')}</Text>
                                   </AlertDialogBody>
                                   <AlertDialogFooter>
                                        <ButtonGroup space="sm">
                                             <Button style={{ borderColor }} variant="outline" onPress={onCloseDeleteAll}>
                                                  <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             <Button style={{ backgroundColor: dangerColor }} isLoading={deleting} isLoadingText={getTermFromDictionary(language, 'deleting', true)} onPress={deleteAll} ref={cancelRef}>
                                                  <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
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
                   <Text bold size="lg" style={{ color: textColor }}>
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
                                       style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                       onPress={async () => {
                                           if (page > 1) {
                                                await updatePage(page - 1)
                                            }
                                        }}
                                        isDisabled={page === 1}>
                                       <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'previous')}</ButtonText>
                                   </Button>
                                   <Button
                                       style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        onPress={async () => {
                                             if (readingHistory?.hasMore) {
                                                  logDebugMessage('Adding to page');
                                                  let newPage = page + 1;
                                                  await updatePage(newPage);
                                             }
                                        }}
                                         isDisabled={!readingHistory?.hasMore || isLoading}>
                                         <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'next')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ScrollView>
                         <Text size="sm" style={{ marginTop: 8, color: textColor }}>
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
                        <Button style={{ backgroundColor: theme['tokens']['colors']['primary']['700'] }} onPress={optIn} isLoading={optingIn} isLoadingText={getTermFromDictionary(language, 'updating', true)}>
                             <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'reading_history_opt_in')}</ButtonText>
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

const Item = React.memo(({ data: item, onDelete }) => {
     const { data: userState2 } = useUserState();
     const user = userState2?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const library = useLibrary();
     const language = useActiveLanguage();
     const {textColor, colorMode, theme } = useTheme();
     const insets = useSafeAreaInsets();
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const actionSheetBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

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
                                       style={{ color: textColor }}>
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
