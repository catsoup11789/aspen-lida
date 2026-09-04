import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Brightness from 'expo-brightness';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { Dimensions } from 'react-native';
import Barcode from 'react-native-barcode-expo';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper } from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Modal, ModalBackdrop, ModalBody, ModalContent } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { PermissionsPrompt } from '@/src/components/PermissionsPrompt';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { useUserState, useCards, useUpdateUserProfile } from '@/src/hooks/useUserData';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { refreshProfile, updateScreenBrightnessStatus } from '@/src/util/api/user';
import { formatDiscoveryVersion, orderByFields, parseToDate } from '@/src/helpers/helpers';
import { logDebugMessage } from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useTranslationWithValues } from '@/src/hooks/useTranslationWithValues';

/**
 * MyLibraryCard component that displays the user's library cards in a carousel format. It manages screen brightness, orientation, and permissions for displaying the cards. It also provides functionality to view barcodes and manage alternate library cards.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const MyLibraryCard = () => {
     const navigation = useNavigation();
     const [shouldRequestPermissions, setShouldRequestPermissions] = React.useState(false);
     const [previousBrightness, setPreviousBrightness] = React.useState();
     const [brightnessMode, setBrightnessMode] = React.useState(1);
     const [isLandscape, setIsLandscape] = React.useState(false);
     const [showDrawer, setShowDrawer] = React.useState(false);
     const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
     const [showBarcodeModal, setShowBarcodeModal] = React.useState(false);
     const [selectedCard, setSelectedCard] = React.useState(null);
     const progressValue = useSharedValue(0);
     const carouselRef = React.useRef();
     const hasOpenModalRef = React.useRef(false);
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const { data: cards } = useCards();
     const updateUserProfile = useUpdateUserProfile();
     const library = useLibrary();
     const language = useActiveLanguage();
     const { uiColors } = useTheme();

     let autoRotate = library.generalSettings?.autoRotateCard ?? 0;


     const updateStatus = async () => {
          await updateScreenBrightnessStatus(false, library.baseUrl, language);
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     };

     React.useEffect(() => {
          const brightenScreen = navigation.addListener('focus', async () => {
               const { status } = await Brightness.getPermissionsAsync();
               if (status === 'undetermined') {
                    if (user.shouldAskBrightness !== undefined && (user.shouldAskBrightness === 1 || user.shouldAskBrightness === '1')) {
                         setShouldRequestPermissions(true);
                    }
               } else {
                    if (status === 'granted') {
                         await Brightness.getBrightnessAsync().then((level) => {
                              logDebugMessage('Storing previous screen brightness for later: ' + level);
                              setPreviousBrightness(level);
                         });
                         await Brightness.getSystemBrightnessModeAsync().then((mode) => {
                              logDebugMessage('Storing system brightness mode for later: ' + mode);
                              setBrightnessMode(mode);
                         });
                         logDebugMessage('Updating screen brightness');
                         Brightness.setSystemBrightnessAsync(1);
                         await updateScreenBrightnessStatus(false, library.baseUrl, language);
                         setShouldRequestPermissions(false);
                    } else {
                         // we were denied permissions
                         await updateScreenBrightnessStatus(false, library.baseUrl, language);
                         setShouldRequestPermissions(false);
                         logDebugMessage('Unable to update screen brightness');
                    }
               }
          });
          const updateOrientation = navigation.addListener('focus', async () => {
               if (autoRotate === '1' || autoRotate === 1) {
                    await ScreenOrientation.unlockAsync();
                    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
                    setIsLandscape(true);
               } else {
                    const result = await ScreenOrientation.getOrientationAsync();
                    const isCurrentlyLandscape = result === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                                                 result === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
                    setIsLandscape(isCurrentlyLandscape);
               }
          });
          const changeOrientation = ScreenOrientation.addOrientationChangeListener(({ orientationInfo, orientationLock }) => {
               switch (orientationInfo.orientation) {
                    case ScreenOrientation.Orientation.LANDSCAPE_LEFT:
                    case ScreenOrientation.Orientation.LANDSCAPE_RIGHT:
                    case ScreenOrientation.Orientation.LANDSCAPE:
                         logDebugMessage('Screen orientation changed to landscape');
                         setIsLandscape(true);
                         break;
                    default:
                         logDebugMessage('Screen orientation changed to portrait');
                         setIsLandscape(false);
                         break;
               }
          });
          return () => {
               brightenScreen();
               updateOrientation();
               changeOrientation.remove();
          };
     }, [navigation, autoRotate, library.baseUrl, language, user, library.barcodeStyle]);

     React.useEffect(() => {
          navigation.addListener('blur', () => {
               (async () => {
                    const { status } = await Brightness.getPermissionsAsync();
                    if (status === 'granted' && previousBrightness) {
                         logDebugMessage('Restoring previous screen brightness');
                         Brightness.setSystemBrightnessAsync(previousBrightness);
                         logDebugMessage('Restoring system brightness');
                         Brightness.restoreSystemBrightnessAsync();
                         await updateScreenBrightnessStatus(false, library.baseUrl, language);
                    }
                    if (status === 'granted' && brightnessMode) {
                         logDebugMessage('Restoring brightness mode');
                         let mode = 'BrightnessMode.MANUAL';
                         if (brightnessMode === 1) {
                              mode = 'BrightnessMode.AUTOMATIC';
                         }
                         Brightness.setSystemBrightnessModeAsync(brightnessMode);
                         await updateScreenBrightnessStatus(false, library.baseUrl, language);
                    }
                    // Only force rotation back to portrait if autoRotate was enabled.
                    if (isLandscape && (autoRotate === '1' || autoRotate === 1)) {
                         await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
                         await ScreenOrientation.unlockAsync();
                    } else if (isLandscape) {
                         await ScreenOrientation.unlockAsync();
                    }
               })();
          });
          return () => {};
     }, [navigation, previousBrightness, isLandscape, autoRotate]);

     if (shouldRequestPermissions) {
          return <PermissionsPrompt promptTitle="permissions_screen_brightness_title" promptBody="permissions_screen_brightness_body" setShouldRequestPermissions={setShouldRequestPermissions} updateStatus={updateStatus} />;
     }

     const version = formatDiscoveryVersion(library.discoveryVersion);
     let shouldShowAlternateLibraryCard = false;
     if (typeof library.showAlternateLibraryCard !== 'undefined') {
          shouldShowAlternateLibraryCard = library.showAlternateLibraryCard;
     }
     if (version >= '24.09.00' && (shouldShowAlternateLibraryCard === '1' || shouldShowAlternateLibraryCard === 1)) {
          shouldShowAlternateLibraryCard = true;
     } else {
          shouldShowAlternateLibraryCard = false;
     }

     const openBarcodeModal = (card) => {
          setSelectedCard(card);
          setShowBarcodeModal(true);
          if (hasOpenModalRef) {
               hasOpenModalRef.current = true;
          }
     };

     const closeBarcodeModal = async () => {
          setShowBarcodeModal(false);
          setSelectedCard(null);
          if (hasOpenModalRef) {
               hasOpenModalRef.current = false;
          }
          await ScreenOrientation.unlockAsync();
     };

     const { textColor, colorMode, runtimeColors } = useTheme();
     const drawerBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;

     return (
          <>
               <VStack style={{ flex: 1, justifyContent: !isLandscape ? 'space-between' : 'flex-start' }}>
                    <Box style={{ flex: 1, justifyContent: !isLandscape ? 'center' : 'flex-start' }}>
                         <CardCarousel
                              cards={cards}
                              orientation={isLandscape}
                              currentIndex={currentCardIndex}
                              setCurrentIndex={setCurrentCardIndex}
                              progressValue={progressValue}
                              carouselRef={carouselRef}
                              openBarcodeModal={openBarcodeModal}
                              hasOpenModalRef={hasOpenModalRef}
                         />
                    </Box>

                    {isLandscape && cards.length > 1 && (
                        <Box style={{ position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 8 }}>
                              <Button variant="link" onPress={() => setShowDrawer(true)} size="sm">
                                  <MaterialCommunityIcons name="chevron-up" size={24} color={textColor} />
                              </Button>
                         </Box>
                    )}

                    {!isLandscape && shouldShowAlternateLibraryCard && (
                        <Box style={{ paddingBottom: 20 }}>
                              <Center>
                                   <Button
                                        size="md"
                                        style={{ backgroundColor: runtimeColors.secondary[500] }}
                                        onPress={() => {
                                             navigateStack('LibraryCardTab', 'MyAlternateLibraryCard', {
                                                  prevRoute: 'MyLibraryCard',
                                                  hasPendingChanges: false });
                                        }}>
                                        <ButtonText style={{ color: runtimeColors.secondary['500-text'] }}>{getTermFromDictionary(language, 'manage_alternate_library_card')}</ButtonText>
                                   </Button>
                              </Center>
                         </Box>
                    )}
               </VStack>

                    <Actionsheet isOpen={showDrawer} onClose={() => setShowDrawer(false)}>
                         <ActionsheetBackdrop />
                         <ActionsheetContent style={{ backgroundColor: drawerBg }}>
                              <ActionsheetDragIndicatorWrapper>
                                   <ActionsheetDragIndicator style={{ backgroundColor: textColor }} />
                              </ActionsheetDragIndicatorWrapper>
                              <VStack space="md" style={{ width: '100%', padding: 16 }}>
                                   <Box>
                                        <Text size="sm" style={{ color: textColor, marginBottom: 8 }}>{getTermFromDictionary(language, 'select_card')}</Text>
                                        <Box style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                                             {cards.map((card, index) => (
                                                  <Button
                                                       key={index}
                                                       size="sm"
                                                       style={{
                                                            marginRight: 4,
                                                            marginBottom: 4,
                                                            backgroundColor: index === currentCardIndex ? runtimeColors.tertiary[500] : 'transparent',
                                                            borderColor: index === currentCardIndex ? 'transparent' : runtimeColors.tertiary[500],
                                                            borderWidth: index === currentCardIndex ? 0 : 1,
                                                       }}
                                                       variant={index === currentCardIndex ? 'solid' : 'outline'}
                                                       onPress={() => {
                                                            carouselRef.current?.scrollTo({ index: index, animated: false });
                                                            setCurrentCardIndex(index);
                                                            setShowDrawer(false);
                                                       }}>
                                                       <ButtonText style={{ color: index === currentCardIndex ? runtimeColors.tertiary['500-text'] : textColor }}>
                                                            {card.displayName}
                                                       </ButtonText>
                                                  </Button>
                                             ))}
                                        </Box>
                                   </Box>
                                   {shouldShowAlternateLibraryCard && (
                                        <Box style={{ marginTop: 8 }}>
                                            <Button
                                                 size="md"
                                                 style={{ backgroundColor: runtimeColors.secondary[500] }}
                                                 onPress={() => {
                                                      setShowDrawer(false);
                                                      navigateStack('LibraryCardTab', 'MyAlternateLibraryCard', {
                                                           prevRoute: 'MyLibraryCard',
                                                           hasPendingChanges: false });
                                                 }}>
                                                 <ButtonText style={{ color: runtimeColors.secondary['500-text'] }}>
                                                      {getTermFromDictionary(language, 'manage_alternate_library_card')}
                                                 </ButtonText>
                                            </Button>
                                        </Box>
                                   )}
                              </VStack>
                         </ActionsheetContent>
                    </Actionsheet>

               {selectedCard && <BarcodeModal card={selectedCard} showModal={showBarcodeModal} closeModal={closeBarcodeModal} language={language} />}
          </>
     );
};

/**
 * CreateLibraryCard component that renders a single library card with its barcode, expiration date, and other relevant information. It handles the display of the card based on the provided data and user preferences.
 * @param data
 * @returns {React.JSX.Element}
 * @constructor
 */
const CreateLibraryCard = (data) => {
     const card = data.card ?? [];
     const { numCards, hasOpenModalRef, openBarcodeModal } = data ?? 0;

     const { uiColors, textColor, colorMode, runtimeColors } = useTheme();

     const library = useLibrary();
     const language = data.language || useActiveLanguage();

     let barcodeStyle;
     if (card.barcodeStyle != null) {
          barcodeStyle = String(card.barcodeStyle);
     } else {
          barcodeStyle = String(library.barcodeStyle);
     }

     let barcodeValue = 'UNKNOWN';
     if (card.ils_barcode !== undefined) {
          barcodeValue = card.ils_barcode;
     } else if (card.cat_username !== undefined) {
          barcodeValue = card.cat_username;
     }

     let expirationDate = null;
     if (card.expires != null
          && card.expires !== ""
          && card.expires !== "Dec 31, 1969") {

          if (typeof card.expires === 'string') {
               expirationDate = parseToDate(card.expires);
          }
     }

     const shouldTranslateExpiration = card.expires != null
          && card.expires !== ''
          && card.expires !== 'Dec 31, 1969';
     const { text: expirationText } = useTranslationWithValues(
          'library_card_expires_on',
          card.expires,
          { enabled: shouldTranslateExpiration, addToDictionary: true, initialValue: '' }
     );

     let cardHasExpired = 0;
     if (card.expired != null && card.expired !== 0 && card.expired !== '0') {
          cardHasExpired = card.expired;
     }

     let neverExpires = false;
     if (cardHasExpired === 0 && expirationDate !== null) {
          const hasExpired = expirationDate < new Date();
          if (hasExpired) {
               neverExpires = true;
          }
     }

     let showExpirationDate = true;
     if (library.showCardExpiration === '0' || library.showCardExpiration === 0) {
          showExpirationDate = false;
     }

     let icon = library.favicon;
     if (card.homeLocation === library.displayName && library.logoApp) {
          icon = library.logoApp;
     }

     const handleBarcodeError = () => {
          barcodeStyle = 'INVALID';
     };

     if (barcodeValue === 'UNKNOWN' || barcodeValue === null || barcodeStyle === null || barcodeValue === '' || barcodeStyle === '' || barcodeStyle === 'INVALID' || barcodeStyle === 'none') {
          return (
               <VStack style={{ maxWidth: '90%', paddingHorizontal: 32, paddingVertical: 20, borderRadius: 12 }}>
                    <Center>
                         <HStack>
                              {icon ? <Image source={{ uri: icon }} fallbackSource={require('../../../themes/default/aspenLogo.png')} alt={getTermFromDictionary(language, 'library_card')} /> : null}
                              <Text bold size="lg" style={{ marginLeft: 12, marginTop: 8 }}>
                                   {card.homeLocation}
                              </Text>
                         </HStack>
                    </Center>
                    <Center style={{ paddingTop: 32 }}>
                         <Text style={{ paddingBottom: 8 }}>
                              {card.displayName}
                         </Text>
                         <Text bold size="xl">
                              {barcodeValue}
                         </Text>
                         {showExpirationDate && expirationDate && !neverExpires ? (
                              <Text size="sm">
                                   {expirationText}
                              </Text>
                         ) : null}
                    </Center>
               </VStack>
          );
     }

     let cardBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const barcodeBg = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;

     return (
          <VStack style={{ backgroundColor: cardBg, paddingHorizontal: 32, paddingVertical: 20, borderRadius: 12 }}>
               {numCards > 1 ? (
                    <>
                         <Center>
                              <HStack>
                                   {icon ? <Image source={{ uri: icon }} fallbackSource={require('../../../themes/default/aspenLogo.png')} alt={getTermFromDictionary(language, 'library_card')} style={{ width: 42, height: 42 }} /> : null}
                                   <Text bold size="lg" style={{ marginLeft: 12, marginTop: 8, color: textColor }}>
                                        {card.homeLocation}
                                   </Text>
                              </HStack>
                         </Center>
                         <Center style={{ paddingTop: 8 }}>
                              <Text size="md" style={{ color: textColor }}>
                                   {card.displayName}
                              </Text>
                         </Center>
                    </>
               ) : null}
               <Center>
                    {showExpirationDate && expirationDate && !neverExpires && numCards > 1 ? <Text style={{ color: textColor }}>{expirationText}</Text> : null}
                    {numCards > 1 ? (
                         <Button variant="link" onPress={() => openBarcodeModal && openBarcodeModal(card)}>
                              <MaterialCommunityIcons name="barcode-scan" size={20} color={runtimeColors.primary[500]} style={{ marginRight: 4 }} />
                              <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'open_barcode')}</ButtonText>
                         </Button>
                    ) : (
                         <VStack alignItems="center" space="sm">
                              <Box style={{ backgroundColor: barcodeBg, padding: 12, borderRadius: 8 }}>
                                   <Barcode
                                        value={barcodeValue}
                                        format={barcodeStyle}
                                        background={barcodeBg}
                                        onError={handleBarcodeError}
                                   />
                              </Box>
                              <Text size="xl" style={{ color: textColor, textAlign: 'center' }}>{barcodeValue}</Text>
                         </VStack>
                    )}
                    {showExpirationDate && expirationDate && !neverExpires && numCards === 1 ? (
                         <Text size="sm" style={{ color: textColor, paddingTop: 8 }}>
                              {expirationText}
                         </Text>
                    ) : null}
               </Center>
          </VStack>
     );
};

/**
 * CardCarousel component that renders a carousel of library cards. It manages the orientation, current index, and progress of the carousel, allowing users to swipe through their cards. It also provides pagination indicators for easy navigation.
 * @param data
 * @returns {React.JSX.Element}
 * @constructor
 */
const CardCarousel = (data) => {
     const { textColor, runtimeColors } = useTheme();
     const language = useActiveLanguage();
     const [internalIndex, setInternalIndex] = React.useState(0);
     const cards = orderByFields(data.cards ?? [], ['key']);
     const isVertical = data.orientation;
     const toggleOrientation = data.toggleOrientation;
     const hasOpenModalRef = data.hasOpenModalRef;
     const openBarcodeModal = data.openBarcodeModal;
     const screenWidth = Dimensions.get('window').width;

     // Use external state if provided (for drawer), otherwise use internal state.
     const currentIndex = data.currentIndex !== undefined ? data.currentIndex : internalIndex;
     const setCurrentIndex = data.setCurrentIndex || setInternalIndex;
     const progressValue = data.progressValue || useSharedValue(0);
     const ref = data.carouselRef || React.useRef();

     let baseOptions = {
          vertical: false,
          width: screenWidth,
          height: screenWidth * 0.9 };

     if (isVertical) {
          baseOptions = {
               vertical: true,
               width: screenWidth * 0.5,
               height: screenWidth * 0.6 };
     }

     const PaginationItem = (props) => {
          const { animValue, index, length, card, isRotate } = props;

          return (
               <Button
                    size="sm"
                    style={{
                         marginRight: 4,
                         marginBottom: 4,
                         backgroundColor: index === currentIndex ? runtimeColors.tertiary[500] : 'transparent',
                         borderColor: index === currentIndex ? 'transparent' : runtimeColors.tertiary[500],
                         borderWidth: index === currentIndex ? 0 : 1,
                    }}
                    variant={index === currentIndex ? 'solid' : 'outline'}
                    onPress={() => {
                         setCurrentIndex(index);
                         ref.current?.scrollTo({
                              index: index,
                              animated: false });
                    }}>
                    <ButtonText style={{ color: index === currentIndex ? runtimeColors.tertiary['500-text'] : textColor }}>{card.displayName}</ButtonText>
               </Button>
          );
     };

     if (cards.length === 1) {
          const card = cards[0];
          return (
               <Box
                    style={{
                         padding: 20,
                         flex: 1,
                         alignItems: 'center',
                         transform: [{ scale: 0.9 }] }}>
                    <CreateLibraryCard key={0} card={card} numCards={cards.length} language={language} hasOpenModalRef={hasOpenModalRef} openBarcodeModal={openBarcodeModal} />
               </Box>
          );
     }

     return (
          <Box style={{ alignItems: 'center', paddingHorizontal: 12 }}>
               <Carousel
                    {...baseOptions}
                    ref={ref}
                    defaultIndex={currentIndex}
                    pagingEnabled={true}
                    snapEnabled={true}
                    autoPlay={false}
                    mode="parallax"
                    onProgressChange={(_, absoluteProgress) => {
                         progressValue.value = absoluteProgress;
                         const totalCards = cards.length;
                         let newIndex = Math.round(absoluteProgress) % totalCards;
                         if (newIndex < 0) newIndex = totalCards + newIndex;
                         if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                              setCurrentIndex(newIndex);
                         }
                    }}
                    onSnapToItem={(index) => setCurrentIndex(index)}
                    modeConfig={{
                         parallaxScrollingScale: 0.9,
                         parallaxScrollingOffset: 50 }}
                    data={cards}
                    renderItem={({ item, index }) => <CreateLibraryCard key={index} card={item} numCards={cards.length} language={language} hasOpenModalRef={hasOpenModalRef} openBarcodeModal={openBarcodeModal} />}
               />
               {!!progressValue && (
                    <Box style={{ flexDirection: 'row', flexWrap: 'wrap', alignContent: 'center', alignSelf: 'center', maxWidth: '100%', justifyContent: 'center' }}>
                         {cards.map((card, index) => {
                              return <PaginationItem card={card} animValue={progressValue} index={index} key={index} isRotate={isVertical} length={cards.length} />;
                         })}
                    </Box>
               )}
          </Box>
     );
};

/**
 * BarcodeModal component that displays a modal with the barcode of a selected library card. It handles orientation changes, barcode rendering, and provides a warning if the barcode is too wide for the current orientation. Users can rotate their device to landscape mode to view the barcode properly.
 * @param param0
 * @param param0.card
 * @param param0.showModal
 * @param param0.closeModal
 * @param param0.language
 * @returns {React.JSX.Element}
 * @constructor
 */
const BarcodeModal = ({ card, showModal, closeModal, language }) => {
     const { uiColors, textColor, colorMode, runtimeColors } = useTheme();
     const library = useLibrary();
     const [orientation, setOrientation] = React.useState('portrait');
     const [screenDimensions, setScreenDimensions] = React.useState(Dimensions.get('window'));
     const [manuallyRotated, setManuallyRotated] = React.useState(false);
     const [showRotateWarning, setShowRotateWarning] = React.useState(false);
     const barcodeWidthRef = React.useRef(null);

     let barcodeStyle;
     if (card.barcodeStyle != null) {
          barcodeStyle = String(card.barcodeStyle);
     } else {
          barcodeStyle = String(library.barcodeStyle);
     }

     let barcodeValue = 'UNKNOWN';
     if (card.ils_barcode !== undefined) {
          barcodeValue = card.ils_barcode;
     } else if (card.cat_username !== undefined) {
          barcodeValue = card.cat_username;
     }

     const handleBarcodeError = () => {
          barcodeStyle = 'INVALID';
     };

     React.useEffect(() => {
          const subscription = Dimensions.addEventListener('change', ({ window }) => {
               if (showModal) {
                    setScreenDimensions(window);
                    const newOrientation = window.width > window.height ? 'landscape' : 'portrait';
                    setOrientation(newOrientation);

                    if (barcodeWidthRef.current) {
                         const shouldShowWarning = evaluateBarcode(barcodeWidthRef.current, newOrientation, window);
                         setShowRotateWarning(shouldShowWarning);
                    }
               }
          });

          return () => subscription?.remove();
     }, [showModal]);

     React.useEffect(() => {
          if (showModal) {
               setShowRotateWarning(false);
               barcodeWidthRef.current = null;
               setManuallyRotated(false);
          }
     }, [showModal]);

     const isPortrait = orientation === 'portrait';

     const evaluateBarcode = (width, currentOrientation, dimensions) => {
          const modalPadding = 32; // ModalBody p="$4" (16px * 2 sides)
          const centerPadding = 16; // Center p="$2" (8px * 2 sides)
          const modalMargins = 32; // Modal itself has margins from screen edges
          const edgeBuffer = 16; // Small buffer from modal content edges

          const availableWidth = dimensions.width - modalPadding - centerPadding - modalMargins - edgeBuffer;
          const isTooWide = width > availableWidth;
          const shouldShowWarning = isTooWide && currentOrientation === 'portrait';

          return shouldShowWarning;
     };

     const rotateToLandscape = async () => {
          setManuallyRotated(true);
          await ScreenOrientation.unlockAsync();
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
     };

     const rotateToPortrait = async () => {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          setManuallyRotated(false);
     };

     const onBarcodeLayout = (event) => {
          const { width } = event.nativeEvent.layout;
          barcodeWidthRef.current = width;
          // Only evaluate if this is the initial measurement; let orientation handler deal with changes.
          if (!showRotateWarning || orientation === 'portrait') {
               const shouldShowWarning = evaluateBarcode(width, orientation, screenDimensions);
               setShowRotateWarning(shouldShowWarning);
          }
     };

     const modalBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const barcodeBg = colorMode === 'light' ? uiColors.surfaceMuted.light : uiColors.surfaceMuted.dark;

     return (
          <Modal isOpen={showModal} onClose={closeModal} size="full">
                    <ModalBackdrop style={{ opacity: 0.85 }} />
                    <ModalContent style={{ backgroundColor: modalBg }}>
                         <ModalBody style={{ margin: 20, padding: 16, backgroundColor: modalBg }}>
                              {/* Always render barcode to measure it, but hide if showing warning. */}
                              <Box style={{ opacity: showRotateWarning ? 0 : 1, position: showRotateWarning ? 'absolute' : 'relative' }}>
                                   <Center style={{ padding: 8 }}>
                                        <Box
                                             style={{ backgroundColor: barcodeBg, padding: 12, borderRadius: 8 }}
                                             onLayout={onBarcodeLayout}>
                                             <Barcode
                                                  value={barcodeValue}
                                                  format={barcodeStyle}
                                                  onError={handleBarcodeError}
                                                  background={barcodeBg}
                                             />
                                        </Box>
                                   </Center>
                              </Box>

                              {showRotateWarning && (
                                   <VStack space="md" style={{ alignItems: 'center', padding: 16 }}>
                                        <Text size="lg" style={{ textAlign: 'center', color: textColor }}>
                                             {getTermFromDictionary(language, 'rotate_device_for_barcode')}
                                        </Text>
                                        <Button
                                             size="md"
                                             style={{ backgroundColor: runtimeColors.primary[500], marginTop: 8 }}
                                             onPress={rotateToLandscape}
                                        >
                                             <MaterialCommunityIcons name="phone-rotate-landscape" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 8 }} />
                                             <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>
                                                  {getTermFromDictionary(language, 'rotate_to_landscape') || 'Rotate to Landscape'}
                                             </ButtonText>
                                        </Button>
                                   </VStack>
                              )}

                              {!showRotateWarning && !isPortrait && manuallyRotated && (
                                   <Center style={{ marginTop: 8, marginBottom: 8 }}>
                                        <Button
                                             size="md"
                                             style={{ backgroundColor: runtimeColors.primary[500] }}
                                             onPress={rotateToPortrait}>
                                             <MaterialCommunityIcons name="phone-rotate-portrait" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 8 }} />
                                             <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>
                                                  {getTermFromDictionary(language, 'rotate_to_portrait') || 'Rotate to Portrait'}
                                             </ButtonText>
                                        </Button>
                                   </Center>
                              )}

                              <Center style={{ marginTop: 8 }}>
                                   <Text size="xl" style={{ color: textColor }}>{barcodeValue}</Text>
                              </Center>
                         </ModalBody>
                    </ModalContent>
               </Modal>
     );
};
