import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { ThemedBadge, ThemedBadgeText } from '../../components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { HStack } from '@/components/ui/hstack';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../components/themed/ThemedSelect';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActionButton } from '../../components/Action/ActionButton';
import { LoadError } from '../../components/loadError';
import { LoadingSpinner } from '../../components/loadingSpinner';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useUserState } from '../../hooks/useUserData';
import { navigate, navigateStack } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { placeHold, confirmHold, refreshProfile } from '../../util/api/user';
import { getVariations } from '../../util/api/item';
import { stripHTML } from '../../helpers/helpers';
import { getStatusIndicator } from './StatusIndicator';
import { logDebugMessage, logWarnMessage, getErrorMessage } from '../../util/logging.js';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';

/**
 * Variations component that displays a list of variations for a specific item, allowing users to view details and perform actions such as placing holds.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Variations = (props) => {
     // 1. Hooks (Plural Variations)
     const queryClient = useQueryClient();
     const route = useRoute();
      const insets = useSafeAreaInsets();
     const library = useLibrary();
     const language = useActiveLanguage();
     const { colorMode, textColor, uiColors } = useTheme();

     const [isLoading, setLoading] = React.useState(false);
     const [confirmingHold, setConfirmingHold] = React.useState(false);
     const [responseIsOpen, setResponseIsOpen] = React.useState(false);
     const [response, setResponse] = React.useState('');
     const [holdConfirmationIsOpen, setHoldConfirmationIsOpen] = React.useState(false);
     const [holdConfirmationResponse, setHoldConfirmationResponse] = React.useState('');
     const [holdItemSelectIsOpen, setHoldItemSelectIsOpen] = React.useState(false);
     const [holdSelectItemResponse, setHoldSelectItemResponse] = React.useState('');
     const [placingItemHold, setPlacingItemHold] = React.useState(false);
     const [selectedItem, setSelectedItem] = React.useState('');

     const cancelResponseRef = React.useRef(null);
     const cancelHoldConfirmationRef = React.useRef(null);
     const cancelHoldItemSelectRef = React.useRef(null);

     const id = route.params.id;
     const prevRoute = route.params.prevRoute;
     const format = props.format;

     const { status, data, error, isFetching } = useQuery({
          queryKey: ['variation', id, format, language, library.baseUrl],
          queryFn: () => getVariations(id, format, language, library.baseUrl, props.data.formats[format]),
          enabled: !!id && !!format && !!props.data?.formats?.[format] });

     // 2. Helper Functions
     const onResponseClose = () => setResponseIsOpen(false);
     const onHoldConfirmationClose = () => setHoldConfirmationIsOpen(false);
     const onHoldItemSelectClose = () => setHoldItemSelectIsOpen(false);

     const handleNavigation = (action) => {
          if (prevRoute === 'DiscoveryScreen' || prevRoute === 'SearchResults' || prevRoute === 'HomeScreen') {
               if (action.includes('Checkouts')) {
                    setResponseIsOpen(false);
                    navigateStack('AccountScreenTab', 'MyCheckouts', {});
               } else {
                    setResponseIsOpen(false);
                    navigateStack('AccountScreenTab', 'MyHolds', {});
               }
          } else {
               if (action.includes('Checkouts')) {
                    setResponseIsOpen(false);
                    navigate('MyCheckouts', {});
               } else {
                    setResponseIsOpen(false);
                    navigate('MyHolds', {});
               }
          }
     };

     const decodeMessage = (string) => {
          return stripHTML(string);
     };

     // 3. Render
     const variations = data?.variations ? (Array.isArray(data.variations) ? data.variations : Object.values(data.variations)) : [];

     return (
          <>
               {isLoading || status === 'loading' || isFetching ? (
                    <Box style={{ padding: 20 }}><LoadingSpinner /></Box>
               ) : status === 'error' ? (
                    <Box style={{ padding: 20 }}><LoadError error={error} /></Box>
               ) : (
                    <>
                         <VStack space="md">
                              {variations.length > 0 ? (
                                   variations.map((item, index) => (
                                        <Variation
                                             key={item.variationId || index.toString()}
                                             records={item}
                                             format={format}
                                             volumeInfo={data?.volumeInfo}
                                             id={id}
                                             prevRoute={prevRoute}
                                             setResponseIsOpen={setResponseIsOpen}
                                             responseIsOpen={responseIsOpen}
                                             onResponseClose={onResponseClose}
                                             cancelResponseRef={cancelResponseRef}
                                             response={response}
                                             setResponse={setResponse}
                                             setHoldConfirmationIsOpen={setHoldConfirmationIsOpen}
                                             holdConfirmationIsOpen={holdConfirmationIsOpen}
                                             onHoldConfirmationClose={onHoldConfirmationClose}
                                             cancelHoldConfirmationRef={cancelHoldConfirmationRef}
                                             holdConfirmationResponse={holdConfirmationResponse}
                                             setHoldConfirmationResponse={setHoldConfirmationResponse}
                                             setHoldItemSelectIsOpen={setHoldItemSelectIsOpen}
                                             holdItemSelectIsOpen={holdItemSelectIsOpen}
                                             onHoldItemSelectClose={onHoldItemSelectClose}
                                             cancelHoldItemSelectRef={cancelHoldItemSelectRef}
                                             holdSelectItemResponse={holdSelectItemResponse}
                                             setHoldSelectItemResponse={setHoldSelectItemResponse}
                                        />
                                   ))
                              ) : (
                                   <Center style={{ padding: 20 }}>
                                       <Text style={{ textAlign: 'center' }}>The library does not own any copies of this title</Text>
                                   </Center>
                              )}
                         </VStack>
                         <Center>
                              <AlertDialog leastDestructiveRef={cancelResponseRef} isOpen={responseIsOpen} onClose={onResponseClose}>
                                   <AlertDialogBackdrop />
                                   <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark }}>
                                        <AlertDialogHeader>
                                             <Heading>{response?.title ? response.title : 'Unknown Error'}</Heading>
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                             <Text>{response?.message ? decodeMessage(response.message) : 'Unable to place hold for unknown error. Please contact the library.'}</Text>
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                             <ButtonGroup space="sm">
                                                  {response?.action ? (
                                                       <Button colorScheme="primary" onPress={() => handleNavigation(response.action)}>
                                                            <ButtonText>{response.action}</ButtonText>
                                                       </Button>
                                                  ) : null}
                                                  <Button colorScheme="primary" variant="link" onPress={() => setResponseIsOpen(false)}>
                                                       <ButtonText>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                                  </Button>
                                             </ButtonGroup>
                                        </AlertDialogFooter>
                                   </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog leastDestructiveRef={cancelHoldConfirmationRef} isOpen={holdConfirmationIsOpen} onClose={onHoldConfirmationClose}>
                                   <AlertDialogBackdrop />
                                   <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark }}>
                                        <AlertDialogHeader>
                                             <Heading>{holdConfirmationResponse?.title ? holdConfirmationResponse.title : 'Unknown Error'}</Heading>
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                             <Text>{holdConfirmationResponse?.message ? decodeMessage(holdConfirmationResponse.message) : 'Unable to place hold for unknown error. Please contact the library.'}</Text>
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                             <ButtonGroup space="md">
                                                  <Button colorScheme="primary" variant="link" onPress={() => setHoldConfirmationIsOpen(false)}>
                                                       <ButtonText>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                                  </Button>
                                                  <Button
                                                       isLoading={confirmingHold}
                                                       isLoadingText="Placing hold..."
                                                       variant="solid"
                                                       colorScheme="primary"
                                                       onPress={async () => {
                                                            setConfirmingHold(true);
                                                            await confirmHold(holdConfirmationResponse.recordId, holdConfirmationResponse.confirmationId, language, library.baseUrl).then(async (result) => {
                                                                 setResponse(result);
                                                                 queryClient.invalidateQueries({ queryKey: ['holds', library.baseUrl, language] });
                                                                 await refreshProfile(library.baseUrl).then(async (data) => {
                                                                      if (data.ok) {
                                                                           await updateUserProfile(data.data.result.profile);
                                                                           queryClient.invalidateQueries({ queryKey: ['records'] });
                                                                           queryClient.invalidateQueries({ queryKey: ['variation'] });
                                                                      } else {
                                                                           logWarnMessage('Could not refresh profile after placing hold or checkout from linked account');
                                                                           logDebugMessage(data);
                                                                           getErrorMessage(data.code ?? 0, data.problem);
                                                                      }
                                                                 });

                                                                 setHoldConfirmationIsOpen(false);
                                                                 setConfirmingHold(false);
                                                                 if (result) {
                                                                      setResponseIsOpen(true);
                                                                 }
                                                            });
                                                       }}>
                                                       <ButtonText>{getTermFromDictionary(language, 'confirm_place_hold')}</ButtonText>
                                                  </Button>
                                             </ButtonGroup>
                                        </AlertDialogFooter>
                                   </AlertDialogContent>
                              </AlertDialog>
                              <AlertDialog leastDestructiveRef={cancelHoldItemSelectRef} isOpen={holdItemSelectIsOpen} onClose={onHoldItemSelectClose}>
                                   <AlertDialogBackdrop />
                                   <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark }}>
                                        <AlertDialogHeader>
                                             <Heading>{holdSelectItemResponse?.title ? holdSelectItemResponse.title : 'Unknown Error'}</Heading>
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                             <Text>{holdSelectItemResponse?.message ? decodeMessage(holdSelectItemResponse.message) : 'Unable to place hold for unknown error. Please contact the library.'}</Text>
                                             {holdSelectItemResponse?.items ? (
                                                  <Select name="itemForHold" minWidth={200} accessibilityLabel={getTermFromDictionary(language, 'select_item')} style={{ marginTop: 4, marginBottom: 8 }} onValueChange={(itemValue) => setSelectedItem(itemValue)}>
                                                       <SelectTrigger>
                                                            <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder="Select option" />
                                                       </SelectTrigger>
                                                       <SelectPortal>
                                                            <SelectBackdrop />
                                                            <SelectContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                                 <SelectDragIndicatorWrapper>
                                                                      <SelectDragIndicator />
                                                                 </SelectDragIndicatorWrapper>
                                                                 <SelectScrollView>
                                                                      {(holdSelectItemResponse.items || []).map((item, index) => {
                                                                           let itemLabel = "";
                                                                           if (item.location) {
                                                                                itemLabel = item.location + " - ";
                                                                           }
                                                                           itemLabel += item.callNumber;
                                                                           if (item.status) {
                                                                                itemLabel += " - " + item.status;
                                                                           }
                                                                          return <SelectItem label={itemLabel} value={item.itemNumber} key={index} textStyle={{ color: textColor }} />;
                                                                      })}
                                                                 </SelectScrollView>
                                                            </SelectContent>
                                                       </SelectPortal>
                                                  </Select>
                                             ) : null}
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                             <ButtonGroup space="md">
                                                  <Button colorScheme="primary" variant="link" onPress={() => setHoldItemSelectIsOpen(false)}>
                                                       <ButtonText>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                                  </Button>
                                                  <Button
                                                       isLoading={placingItemHold}
                                                       isLoadingText="Placing hold..."
                                                       variant="solid"
                                                       colorScheme="primary"
                                                       onPress={async () => {
                                                            setPlacingItemHold(true);
                                                            await placeHold(library.baseUrl, selectedItem, 'ils', holdSelectItemResponse.patronId, holdSelectItemResponse.pickupLocation, holdSelectItemResponse.sublocation, false, '', 'item', null, null, null, holdSelectItemResponse.bibId, language).then(async (result) => {
                                                                 setResponse(result);
                                                                 queryClient.invalidateQueries({ queryKey: ['holds', holdSelectItemResponse.patronId, library.baseUrl, language] });
                                                                 await refreshProfile(library.baseUrl).then(async (data) => {
                                                                      if (data.ok) {
                                                                           await updateUserProfile(data.data.result.profile);
                                                                      } else {
                                                                           logWarnMessage('Could not refresh profile after placing item hold from variation selection');
                                                                           logDebugMessage(data);
                                                                           getErrorMessage(data.code ?? 0, data.problem);
                                                                      }
                                                                 });
                                                                 setHoldItemSelectIsOpen(false);
                                                                 setPlacingItemHold(false);
                                                                 if (result) {
                                                                      setResponseIsOpen(true);
                                                                 }
                                                            });
                                                       }}>
                                                       <ButtonText>{getTermFromDictionary(language, 'place_hold')}</ButtonText>
                                                  </Button>
                                             </ButtonGroup>
                                        </AlertDialogFooter>
                                   </AlertDialogContent>
                              </AlertDialog>
                         </Center>
                    </>
               )}
          </>
     );
};

/**
 * Variation component that displays a single variation for a specific item, allowing users to view details and perform actions such as placing holds.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
const Variation = (props) => {
     // 1. Hooks (Singular Variation)
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const library = useLibrary();
     const language = useActiveLanguage();
     const { textColor, colorMode, uiColors } = useTheme();

     // 2. Props Destructuring
     const {
          id,
          format,
          volumeInfo,
          prevRoute,
          setResponseIsOpen,
          responseIsOpen,
          onResponseClose,
          cancelResponseRef,
          response,
          setResponse,
          setHoldConfirmationIsOpen,
          holdConfirmationIsOpen,
          onHoldConfirmationClose,
          cancelHoldConfirmationRef,
          holdConfirmationResponse,
          setHoldConfirmationResponse,
          setHoldItemSelectIsOpen,
          holdItemSelectIsOpen,
          onHoldItemSelectClose,
          cancelHoldItemSelectRef,
          holdSelectItemResponse,
          setHoldSelectItemResponse
     } = props;

     const variation = props.records;
     const actions = Array.isArray(variation.actions) ? variation.actions : Object.values(variation.actions || {});
     const source = variation.source;
     const status = getStatusIndicator(variation.statusIndicator, language);
     const statusIndicator = variation.statusIndicator;
     const holdTypeForFormat = variation.holdType ?? 'default';
     const variationId = variation.variationId ?? null;
     const title = variation.title ?? null;
     const author = variation.author ?? null;
     const publisher = variation.publisher ?? null;
     const isbn = variation.isbn ?? null;
     const oclcNumber = variation.oclcNumber ?? null;

     let shouldPromptAlternateLibraryCard = false;
     let shouldShowAlternateLibraryCard = false;
     let useAlternateCardForCloudLibrary = false;
     let userHasAlternateLibraryCard = false;

     if (typeof library.showAlternateLibraryCard !== 'undefined') {
          if (library.showAlternateLibraryCard === '1' || library.showAlternateLibraryCard === 1) {
               shouldShowAlternateLibraryCard = true;
          }
     }

     if (typeof library.useAlternateCardForCloudLibrary !== 'undefined') {
          if (library.useAlternateCardForCloudLibrary === '1' || library.useAlternateCardForCloudLibrary === 1) {
               useAlternateCardForCloudLibrary = true;
          }
     }

     if (shouldShowAlternateLibraryCard && useAlternateCardForCloudLibrary && source === 'cloud_library') {
          shouldPromptAlternateLibraryCard = true;
     }

     if (typeof user.alternateLibraryCard !== 'undefined') {
          if (user.alternateLibraryCard && user.alternateLibraryCard !== '') {
               if (library.alternateLibraryCardConfig?.showAlternateLibraryCardPassword === '1') {
                    if (user.alternateLibraryCardPassword !== '') {
                         userHasAlternateLibraryCard = true;
                    }
               } else {
                    userHasAlternateLibraryCard = true;
               }
          }
     }

     let fullRecordId = (variation.id || '').split(':');
     const recordId = String(fullRecordId[1] || '');

     const handleOnPress = () => {
          navigate('CopyDetails', { id: id, format: format, prevRoute: prevRoute, type: 'groupedWork', recordId: null, numHolds: statusIndicator.numHolds, source });
     };

     const handleOpenEditions = () => {
          navigate('EditionsModal', {
               id: id,
               format: format,
               recordId: recordId,
               source: source,
               volumeInfo: volumeInfo,
               prevRoute: prevRoute });
     };

     return (
          <Box style={{ marginTop: 20, marginBottom: 0 }}>
               <Center style={{ margin: 4, padding: 12, backgroundColor: colorMode === 'light' ? uiColors.surfaceSoft.light : uiColors.surfaceSoft.dark, borderRadius: 8, alignSelf: 'center', width: '100%' }}>
                    <VStack space="md" style={{ marginBottom: 12, width: '100%' }}>
                         <HStack space="sm" style={{ width: '100%', justifyContent: 'space-around', alignItems: 'center' }}>
                              <ThemedBadge variant="solid" action={status.indicator} style={{ borderRadius: 8, padding: 4 }}>
                                   <ThemedBadgeText action={status.indicator} textTransform="none" style={{ fontSize: 12, lineHeight: 13 }}>
                                        {status.label}
                                   </ThemedBadgeText>
                              </ThemedBadge>
                              {source === 'ils' || statusIndicator.isEContent ? (
                                   <Button variant="link" size="xs" onPress={handleOnPress}>
                                        <MaterialCommunityIcons name="map-marker" size={16} color={colorMode === 'light' ? uiColors.textStrong.light : uiColors.white} style={{ marginRight: 4 }} />
                                        <ButtonText style={{ color: colorMode === 'light' ? uiColors.textStrong.light : uiColors.white }}>{getTermFromDictionary(language, 'where_is_it')}</ButtonText>
                                   </Button>
                              ) : null}
                         </HStack>
                         {status.message ? (
                              <Text italic style={{ lineHeight: 14, textAlign: 'center' }} size="xs">
                                   {status.message}
                              </Text>
                         ) : null}
                    </VStack>
                    <ButtonGroup space="sm" style={{ width: '100%', flexDirection: actions.length > 1 ? 'column' : 'row' }}>
                         {actions.map((item, index) => (
                              <ActionButton
                                   key={index}
                                   language={language}
                                   groupedWorkId={id}
                                   recordId={recordId}
                                   recordSource={source}
                                   fullRecordId={variation.id}
                                   variationId={variationId}
                                   holdTypeForFormat={holdTypeForFormat}
                                   title={title}
                                   author={author}
                                   publisher={publisher}
                                   isbn={isbn}
                                   oclcNumber={oclcNumber}
                                   actions={item}
                                   volumeInfo={volumeInfo}
                                   prevRoute={prevRoute}
                                   setResponseIsOpen={setResponseIsOpen}
                                   responseIsOpen={responseIsOpen}
                                   onResponseClose={onResponseClose}
                                   cancelResponseRef={cancelResponseRef}
                                   response={response}
                                   setResponse={setResponse}
                                   setHoldConfirmationIsOpen={setHoldConfirmationIsOpen}
                                   holdConfirmationIsOpen={holdConfirmationIsOpen}
                                   onHoldConfirmationClose={onHoldConfirmationClose}
                                   cancelHoldConfirmationRef={cancelHoldConfirmationRef}
                                   holdConfirmationResponse={holdConfirmationResponse}
                                   setHoldConfirmationResponse={setHoldConfirmationResponse}
                                   setHoldItemSelectIsOpen={setHoldItemSelectIsOpen}
                                   holdItemSelectIsOpen={holdItemSelectIsOpen}
                                   onHoldItemSelectClose={onHoldItemSelectClose}
                                   cancelHoldItemSelectRef={cancelHoldItemSelectRef}
                                   holdSelectItemResponse={holdSelectItemResponse}
                                   setHoldSelectItemResponse={setHoldSelectItemResponse}
                                   userHasAlternateLibraryCard={userHasAlternateLibraryCard}
                                   shouldPromptAlternateLibraryCard={shouldPromptAlternateLibraryCard}
                              />
                         ))}
                    </ButtonGroup>
                    <Button size="xs" variant="solid" onPress={handleOpenEditions} style={{ width: '100%', marginTop: 8, backgroundColor: uiColors.surfaceMuted.light }}>
                         <ButtonText style={{ color: uiColors.textStrong.light }}>{getTermFromDictionary(language, 'show_editions')}</ButtonText>
                    </Button>
               </Center>
          </Box>
     );
};

export default Variations;
