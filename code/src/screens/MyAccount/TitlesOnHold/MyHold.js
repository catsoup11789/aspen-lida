import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import _ from 'lodash';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Actionsheet, ActionsheetBackdrop, ActionsheetContent, ActionsheetDragIndicator, ActionsheetDragIndicatorWrapper, ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Checkbox, CheckboxIcon, CheckboxIndicator } from '@/components/ui/checkbox';
import { CheckIcon, Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { VStack } from '@/components/ui/vstack';
import { popAlert } from '../../../components/feedback';
import { HoldsContext } from '../../../context/initialContext';
import { useUserState, useSublocations } from '../../../hooks/useUserData';
import { getAuthor, getBadge, getCleanTitle, getExpirationDate, getFormat, getOnHoldFor, getPickupLocation, getPosition, getOutOfHoldGroupMessage, getTitle, getCallNumber, getVolume, getType, getCollectionName } from '../../../helpers/item';
import { navigateStack } from '../../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { cancelHold, cancelHolds, freezeHold, freezeHolds, thawHold, thawHolds } from '../../../util/api/user';
import { formatPickupLocations } from '../../../util/api/userHelper';
import { formatDiscoveryVersion } from '../../../helpers/helpers';
import { checkoutItem, getPickupLocations } from '../../../util/api/user';
import { SelectPickupLocation } from './SelectPickupLocation';
import { SelectThawDate } from './SelectThawDate.js';

import { useQueryClient } from '@tanstack/react-query';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

export const MyHold = (props) => {
     const hold = props.data;
     const resetGroup = props.resetGroup;
     const [pickupLocations, setPickupLocations] = React.useState([]);
     const { data: sublocations } = useSublocations();
     const section = props.section;
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const library = useLibrary();
     const { updateHolds } = React.useContext(HoldsContext);
     const language = useActiveLanguage();
     const { theme, colorMode, textColor } = useTheme();
     const insets = useSafeAreaInsets();
     const [cancelling, startCancelling] = React.useState(false);
     const [checkingOut, startCheckingOut] = React.useState(false);
     const [thawing, startThawing] = React.useState(false);
     const [freezing, startFreezing] = React.useState(false);
     const actionSheetBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const separatorColor = colorMode === 'light' ? 'transparent' : theme.tokens.colors.ui.iconMuted.dark;
     const checkboxBorderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     let label, method, icon, canCancel;
     const [usesHoldPosition, setUsesHoldPosition] = React.useState(false);
     const [holdPosition, setHoldPosition] = React.useState(null);

     const [showActionsheet, setShowActionsheet] = React.useState(false)
     const handleOpen = () => setShowActionsheet(true);
     const handleClose = () => setShowActionsheet(false);

     React.useEffect(() => {
          if (hold.holdQueueLength) {
               let tmp = getTermFromDictionary(language, 'hold_position_with_queue');
               if (hold.holdQueueLength && hold.position) {
                    tmp = tmp.replace('%1%', hold.position);
                    tmp = tmp.replace('%2%', hold.holdQueueLength);
                    setUsesHoldPosition(true);
                    setHoldPosition(tmp);
               }
          }
          const update = async () => {
               await getPickupLocations(library.baseUrl, null, hold.id).then((result) => {
                    if(result.ok) {
                         const pickupLocationsList = formatPickupLocations(result.data.result);
                         if (pickupLocations !== pickupLocationsList.locations) {
                              setPickupLocations(pickupLocationsList.locations);
                         }
                    }
               });
          };
          update();
     }, [language]);

     if (hold.canFreeze === true) {
          if (hold.frozen === true) {
               label = getTermFromDictionary(language, 'thaw_hold');
               method = 'thawHold';
               icon = 'play';
          } else {
               label = getTermFromDictionary(language, 'freeze_hold');
               method = 'freezeHold';
               icon = 'pause';
               if (hold.available) {
                    label = getTermFromDictionary(language, 'overdrive_delay_checkout');
                    method = 'freezeHold';
                    icon = 'pause';
               }
          }
     }

     if (!hold.available && hold.source !== 'ils') {
          canCancel = hold.cancelable;
          if (hold.source === 'axis360') {
               canCancel = true;
          }
     } else {
          canCancel = hold.cancelable;
     }

     if (hold.pendingCancellation) {
          canCancel = !hold.pendingCancellation;
     }

     let allowLinkedAccountAction = true;
     const discoveryVersion = formatDiscoveryVersion(library.discoveryVersion);
     if (discoveryVersion < '22.05.00') {
          if (hold.userId !== user.id) {
               allowLinkedAccountAction = false;
          }
     }

     const freezingHoldLabel = getTermFromDictionary(language, 'freezing_hold');
     const freezeHoldLabel = getTermFromDictionary(language, 'freeze_hold');

     const openGroupedWork = (item, title) => {
          navigateStack('AccountScreenTab', 'MyHold', {
               id: item,
               title: getCleanTitle(title),
               url: library.baseUrl,
               userContext: user,
               libraryContext: library,
               prevRoute: 'MyHolds' });
     };

     const initializeLeftColumn = () => {
          if (hold.coverUrl) {
               let url = library.baseUrl + '/bookcover.php?id=' + hold.source + ':' + hold.recordId + '&size=medium';
               if (hold.upc) {
                    url = url + '&upc=' + hold.upc;
               }
               return (
                    <VStack>
                         <Image
                              alt={hold.title}
                              source={url}
                              style={{
                                   width: 100,
                                   height: 150 }}
                              borderRadius={8}
                              placeholder={blurhash}
                              transition={1000}
                              contentFit="cover"
                         />
                         {(hold.allowFreezeHolds || canCancel) && allowLinkedAccountAction && section === 'Pending' ? (
                              <Center>
                                   <Checkbox value={method + '|' + hold.recordId + '|' + hold.cancelId + '|' + hold.source + '|' + hold.userId} size="md" accessibilityLabel="Check item" style={{ marginVertical: 12 }}>
                                        <CheckboxIndicator>
                                             <CheckboxIcon as={CheckIcon} style={{ color: theme.tokens.colors.primary['500-text'] }} />
                                        </CheckboxIndicator>
                                   </Checkbox>
                              </Center>
                         ) : null}
                    </VStack>
               );
          } else {
               if (section === 'Pending') {
                    return (
                         <Center>
                              <Checkbox value={method + '|' + hold.recordId + '|' + hold.cancelId + '|' + hold.source + '|' + hold.userId} size="md" accessibilityLabel="Check item" style={{ marginVertical: 12 }}>
                                   <CheckboxIndicator style={{ borderColor: checkboxBorderColor }}>
                                        <CheckboxIcon as={CheckIcon} style={{ color: theme.tokens.colors.primary['500-text'] }}/>
                                   </CheckboxIndicator>
                              </Checkbox>
                         </Center>
                    );
               }
          }

          return null;
     };

     const createOpenGroupedWorkAction = () => {
          if (hold.groupedWorkId) {
               return (
                    <ActionsheetItem
                         onPress={() => {
                              openGroupedWork(hold.groupedWorkId, hold.title);
                              handleClose();
                         }}>
                         <ActionsheetIcon>
                             <Icon as={MaterialIcons} name="search" size="md" style={{ marginRight: 4, color: textColor }} />
                         </ActionsheetIcon>
                         <ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'view_item_details')}</ActionsheetItemText>
                    </ActionsheetItem>
               );
          } else {
               return null;
          }
     };

     const createCheckoutHoldAction = () => {
          if (hold.source === 'overdrive' && hold.available) {
               return (
                    <ActionsheetItem
                         isLoading={checkingOut}
                         isLoadingText={getTermFromDictionary(language, 'checking_out', true)}
                         onPress={async () => {
                              handleClose();
                              startCheckingOut(true);
                              await checkoutItem(library.baseUrl, hold.sourceId, hold.source, hold.userId, '', '', '', language).then((result) => {
                                   popAlert(result.title, result.message, result.success ? 'success' : 'error');
                                   resetGroup();
                                   startCheckingOut(false);
                              });
                         }}>
                         <ActionsheetIcon>
                             <Icon as={MaterialIcons} name="book" size="md" style={{ marginRight: 4, color: textColor }} />
                         </ActionsheetIcon>
                         <ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'checkout_title')}</ActionsheetItemText>
                    </ActionsheetItem>
               );
          }

          return null;
     };

     const createCancelHoldAction = () => {
          if (canCancel && allowLinkedAccountAction) {
               let label = getTermFromDictionary(language, 'cancel_hold');
               if (hold.type === 'interlibrary_loan') {
                    label = getTermFromDictionary(language, 'ill_cancel_request');
               }

               let record = hold.recordId;
               if(hold.source === 'overdrive') {
                  record = hold.sourceId
               }

               return (
                    <ActionsheetItem
                         isLoading={cancelling}
                         isLoadingText={getTermFromDictionary(language, 'canceling', true)}
                         onPress={() => {
                              handleClose();
                              startCancelling(true);
                              cancelHold(hold.cancelId, record, hold.source, library.baseUrl, hold.userId, language).then(() => {
                                   resetGroup();
                                   startCancelling(false);
                              });
                         }}>
                         <ActionsheetIcon>
                             <Icon as={MaterialIcons} name="cancel" size="md" style={{ marginRight: 4, color: textColor }}/>
                         </ActionsheetIcon>
                         <ActionsheetItemText style={{ color: textColor }}>{label}</ActionsheetItemText>
                    </ActionsheetItem>
               );
          } else if (hold.pendingCancellation) {
               return <ActionsheetItem><ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'pending_cancellation')}</ActionsheetItemText></ActionsheetItem>;
          } else {
               return null;
          }
     };

     const createFreezeHoldAction = () => {
          if (hold.allowFreezeHolds === '1' && allowLinkedAccountAction) {
			  let record = hold.recordId;
			  if(hold.source === 'overdrive') {
				  record = hold.sourceId
			  }
               if (hold.frozen) {
                    return (
                         <ActionsheetItem
                              isLoading={thawing}
                              isLoadingText={getTermFromDictionary(language, 'thawing_hold', true)}
                              onPress={() => {
                                   handleClose();
                                   startThawing(true);
                                   thawHold(hold.cancelId, record, hold.source, library.baseUrl, hold.userId, language).then(() => {
                                        resetGroup();
                                        startThawing(false);
                                   });
                              }}>
                              <ActionsheetIcon>
                                   <Icon as={MaterialCommunityIcons} name={icon} size="md" style={{ marginRight: 4, color: textColor }} />
                              </ActionsheetIcon>
                              <ActionsheetItemText style={{ color: textColor }}>{label}</ActionsheetItemText>
                         </ActionsheetItem>
                    );
               } else {
                    if (library.showDateWhenSuspending) {
                         return <SelectThawDate label={null} freezeLabel={freezeHoldLabel} freezingLabel={freezingHoldLabel} language={language} libraryContext={library} holdsContext={updateHolds} onClose={handleClose} freezeId={hold.cancelId} recordId={record} source={hold.source} libraryUrl={library.baseUrl} userId={hold.userId} resetGroup={resetGroup} theme={theme} textColor={textColor} colorMode={colorMode} />;
                    }else{
                         return (
                              <ActionsheetItem
                                   isLoading={freezing}
                                   isLoadingText={getTermFromDictionary(language, 'freezing_hold', true)}
                                   onPress={() => {
                                        handleClose();
                                        startFreezing(true);
                                        freezeHold(hold.cancelId, record, hold.source, library.baseUrl, hold.userId, null, language, library.reactivateDateNotRequired ?? false).then(() => {
                                             resetGroup();
                                             startFreezing(false);
                                        });
                                   }}>
                                   <ActionsheetIcon>
                                       <Icon as={MaterialCommunityIcons} name={icon} size="md" style={{ marginRight: 4, color: textColor }}/>
                                   </ActionsheetIcon>
                                   <ActionsheetItemText style={{ color: textColor }}>{label}</ActionsheetItemText>
                              </ActionsheetItem>
                         );
                    }
               }
          } else {
               return null;
          }
     };

     const createUpdatePickupLocationAction = (canUpdate, available) => {
          if (canUpdate && !available) {
               return <SelectPickupLocation isOpen={showActionsheet} language={language} libraryContext={library} holdsContext={updateHolds} locations={pickupLocations} sublocations={sublocations} onClose={handleClose} userId={hold.userId} currentPickupId={hold.pickupLocationId} holdId={hold.cancelId} resetGroup={resetGroup} textColor={textColor} colorMode={colorMode} theme={theme} />;
          } else {
               return null;
          }
     };

     return (
          <>
               <Pressable onPress={handleOpen} style={{ borderBottomWidth: 1, borderColor: separatorColor, paddingLeft: 16, paddingRight: 80, paddingVertical: 8 }}>
                    <HStack space="sm" maxW="95%">
                         {initializeLeftColumn()}
                         <VStack>
                              {getTitle(hold.title)}
                              {getBadge(hold.status, hold.frozen, hold.available, hold.source, hold.statusMessage ?? '')}
                              {getCallNumber(hold.callNumber)}
                              {getVolume(hold.volume)}
                              {getAuthor(hold.author)}
                              {getFormat(hold.format)}
                              {getCollectionName(hold.source, hold.collectionName ?? null)}
                              {getType(hold.type)}
                              {getOnHoldFor(hold.user)}
                              {getPickupLocation(hold.currentPickupName, hold.source)}
                              {getExpirationDate(hold.expirationDate, hold.available)}
                              {getOutOfHoldGroupMessage(hold.outOfHoldGroupMessage)}
                              {getPosition(hold.position, hold.available, hold.holdQueueLength, holdPosition, usesHoldPosition,hold.outOfHoldGroupMessage)}
                         </VStack>
                    </HStack>
               </Pressable>
               <Actionsheet isOpen={showActionsheet} onClose={handleClose} zIndex={999}>
                    <ActionsheetBackdrop />
                    <ActionsheetContent
                        style={{ backgroundColor: actionSheetBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                    >
                        <ActionsheetItem style={{ height: 60, paddingHorizontal: 16 }}>
                             <ActionsheetItemText bold style={{ color: textColor }}>{hold.title}</ActionsheetItemText>
                         </ActionsheetItem>
                         {createCheckoutHoldAction()}
                         {createOpenGroupedWorkAction()}
                         {createCancelHoldAction()}
                         {createFreezeHoldAction()}
                         {createUpdatePickupLocationAction(hold.locationUpdateable ?? false, hold.available)}
                    </ActionsheetContent>
               </Actionsheet>
          </>
     );
};

export const ManageSelectedHolds = (props) => {
     const { selectedValues, resetGroup } = props;
     const language = useActiveLanguage();
     const library = useLibrary();
     const { updateHolds } = React.useContext(HoldsContext);
     const { theme, colorMode, textColor } = useTheme();
     const insets = useSafeAreaInsets();

     const [showActionsheet, setShowActionsheet] = React.useState(false)
     const handleOpen = () => setShowActionsheet(true);
     const handleClose = () => setShowActionsheet(false);
     const [cancelling, startCancelling] = React.useState(false);
     const [thawing, startThawing] = React.useState(false);
     const [freezing, startFreezing] = React.useState(false);

     let titlesToFreeze = [];
     let titlesToThaw = [];
     let titlesToCancel = [];

     let numToCancel = 0;
     let numToFreeze = 0;
     let numToThaw = 0;
     let numSelected = 0;

     if (_.isArray(selectedValues)) {
          _.map(selectedValues, function (item) {
               if (item.includes('freeze')) {
                    const arr = item.split('|');
                    titlesToFreeze.push({
                         action: arr[0],
                         recordId: arr[1],
                         cancelId: arr[2],
                         source: arr[3],
                         patronId: arr[4] });
               }
               if (item.includes('thaw')) {
                    const arr = item.split('|');
                    titlesToThaw.push({
                         action: arr[0],
                         recordId: arr[1],
                         cancelId: arr[2],
                         source: arr[3],
                         patronId: arr[4] });
               }

               const arr = item.split('|');
               titlesToCancel.push({
                    action: arr[0],
                    recordId: arr[1],
                    cancelId: arr[2],
                    source: arr[3],
                    patronId: arr[4] });
          });

          numToCancel = titlesToCancel.length;
          numToFreeze = titlesToFreeze.length;
          numToThaw = titlesToThaw.length;
          numSelected = _.toString(selectedValues.length);
     }

     const numToCancelLabel = getTermFromDictionary(language, 'cancel_selected_holds') + ' (' + numToCancel + ')';
     const numToFreezeLabel = getTermFromDictionary(language, 'freeze_selected_holds') + ' (' + numToFreeze + ')';
     const numToThawLabel = getTermFromDictionary(language, 'thaw_selected_holds') + ' (' + numToThaw + ')';
     const numSelectedLabel = getTermFromDictionary(language, 'manage_selected') + ' (' + numSelected + ')';
     const freezingHoldLabel = getTermFromDictionary(language, 'freezing_hold');
     const freezeHoldLabel = getTermFromDictionary(language, 'freeze_hold');

     const cancelActionItem = () => {
          if (numToCancel > 0) {
               return (
                    <ActionsheetItem
                         onPress={() => {
                              handleClose();
                              startCancelling(true);
                              cancelHolds(titlesToCancel, library.baseUrl, language).then(() => {
                                   resetGroup();
                                   startCancelling(false);
                              });
                         }}
                         isLoading={cancelling}
                         isLoadingText={getTermFromDictionary(language, 'canceling', true)}>
                         <ActionsheetItemText style={{ color: textColor }}>{numToCancelLabel}</ActionsheetItemText>
                    </ActionsheetItem>
               );
          } else {
               return <ActionsheetItem isDisabled><ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel_holds')}</ActionsheetItemText></ActionsheetItem>;
          }
     };

     const thawActionItem = () => {
          if (numToThaw > 0) {
               return (
                    <ActionsheetItem
                         onPress={() => {
                              handleClose();
                              startThawing(true);
                              thawHolds(titlesToThaw, library.baseUrl, language).then(() => {
                                   resetGroup();
                                   startThawing(false);
                              });
                         }}
                         isLoading={thawing}
                         isLoadingText={getTermFromDictionary(language, 'thawing_hold', true)}>
                         <ActionsheetItemText style={{ color: textColor }}>{numToThawLabel}</ActionsheetItemText>
                    </ActionsheetItem>
               );
          } else {
               return <ActionsheetItem isDisabled><ActionsheetItemText style={{ color: textColor }}>{numToThawLabel}</ActionsheetItemText></ActionsheetItem>;
          }
     };

     const freezeActionItem = () => {
          if (numToFreeze > 0) {
               if (library.showDateWhenSuspending) {
                    return <SelectThawDate label={numToFreezeLabel} freezeLabel={freezeHoldLabel} freezingLabel={freezingHoldLabel} language={language} holdsContext={updateHolds} libraryContext={library} resetGroup={resetGroup} onClose={handleClose} count={numToFreeze} numSelected={numSelected} data={titlesToFreeze} theme={theme} textColor={textColor} colorMode={colorMode} />;
               }else{
                    return (
                         <ActionsheetItem
                              isLoading={freezing}
                              isLoadingText={getTermFromDictionary(language, 'freezing_hold', true)}
                              onPress={() => {
                                   handleClose();
                                   startFreezing(true);
                                   freezeHolds(titlesToFreeze, library.baseUrl, null,'en', library.reactivateDateNotRequired ?? false).then(() => {
                                        resetGroup();
                                        startFreezing(false);
                                   });
                              }}>
                              <ActionsheetItemText style={{ color: textColor }}>{numToFreezeLabel}</ActionsheetItemText>
                         </ActionsheetItem>
                    );
               }
          } else {
               return <ActionsheetItem isDisabled><ActionsheetItemText style={{ color: textColor }}>{numToFreezeLabel}</ActionsheetItemText></ActionsheetItem>;
          }
     }

     return (
          <Center>
               <Button onPress={handleOpen} size="sm" variant="solid" style={{ backgroundColor: theme.tokens.colors.primary['500'], marginRight: 4 }}>
                    <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{numSelectedLabel}</ButtonText>
               </Button>
               <Actionsheet isOpen={showActionsheet} onClose={handleClose} zIndex={999}>
                    <ActionsheetBackdrop />
                    <ActionsheetContent
                         zIndex={999}
                         style={{ backgroundColor: actionSheetBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                    >
                         <ActionsheetDragIndicatorWrapper>
                              <ActionsheetDragIndicator />
                         </ActionsheetDragIndicatorWrapper>
                         {cancelActionItem()}
                         {freezeActionItem()}
                         {thawActionItem()}
                    </ActionsheetContent>
               </Actionsheet>
          </Center>
     );
};

export const ManageAllHolds = (props) => {
     const queryClient = useQueryClient();
     const { resetGroup } = props;
     const language = useActiveLanguage();
     const { holds, updateHolds } = React.useContext(HoldsContext);
     const library = useLibrary();
     const { theme, colorMode, textColor } = useTheme();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const insets = useSafeAreaInsets();

     const [showActionsheet, setShowActionsheet] = React.useState(false)
     const handleOpen = () => setShowActionsheet(true);
     const handleClose = () => setShowActionsheet(false);
     const [cancelling, startCancelling] = React.useState(false);
     const [thawing, startThawing] = React.useState(false);
     const [freezing, startFreezing] = React.useState(false);

     let titlesToFreeze = [];
     let titlesToThaw = [];
     let titlesToCancel = [];

     const holdsNotReady = holds[1].data;

     if (_.isArray(holdsNotReady)) {
          _.map(holdsNotReady, function (item) {
               let record = item.recordId;
               if(item.source === 'overdrive') {
                  record = item.sourceId
               }
               if (item.canFreeze) {
                    if (item.frozen) {
                         titlesToThaw.push({
                              recordId: record,
                              cancelId: item.cancelId,
                              source: item.source,
                              patronId: item.userId });
                    } else {
                         titlesToFreeze.push({
                              recordId: record,
                              cancelId: item.cancelId,
                              source: item.source,
                              patronId: item.userId });
                    }
               }

               if (item.cancelable) {
                    titlesToCancel.push({
                         recordId: record,
                         cancelId: item.cancelId,
                         source: item.source,
                         patronId: item.userId });
               }
          });
     }

     let numToCancel = titlesToCancel.length;
     let numToFreeze = titlesToFreeze.length;
     let numToThaw = titlesToThaw.length;

     let numToManage = numToCancel + numToFreeze + numToThaw;

     const numToCancelLabel = getTermFromDictionary(language, 'cancel_all_holds') + ' (' + numToCancel + ')';
     const numToFreezeLabel = getTermFromDictionary(language, 'freeze_all_holds') + ' (' + numToFreeze + ')';
     const numToThawLabel = getTermFromDictionary(language, 'thaw_all_holds') + ' (' + numToThaw + ')';
     const freezingHoldLabel = getTermFromDictionary(language, 'freezing_hold');
     const freezeHoldLabel = getTermFromDictionary(language, 'freeze_hold');

     const freezeAllActionItem = () => {
          if (numToFreeze > 0) {
               if (library.showDateWhenSuspending) {
                    return <SelectThawDate label={numToFreezeLabel} freezeLabel={freezeHoldLabel} freezingLabel={freezingHoldLabel} language={language} holdsContext={updateHolds} libraryContext={library} resetGroup={resetGroup} onClose={handleClose} count={numToFreeze} numSelected={numToManage} data={titlesToFreeze} theme={theme} textColor={textColor} colorMode={colorMode} />;
               }else{
                    return (
                         <ActionsheetItem
                              isLoading={freezing}
                              isLoadingText={getTermFromDictionary(language, 'freezing_hold', true)}
                              onPress={() => {
                                   handleClose();
                                   startFreezing(true);
                                   freezeHolds(titlesToFreeze, library.baseUrl, null,'en', library.reactivateDateNotRequired ?? false).then(() => {
                                        resetGroup();
                                        startFreezing(false);
                                   });
                                   queryClient.invalidateQueries({ queryKey: ['holds', user.id, library.baseUrl, language] });
                              }}>
                              <ActionsheetItemText style={{ color: textColor }}>{numToFreezeLabel}</ActionsheetItemText>
                         </ActionsheetItem>
                    );
               }
          } else {
               return <ActionsheetItem isDisabled><ActionsheetItemText style={{ color: textColor }}>{freezeHoldLabel}</ActionsheetItemText></ActionsheetItem>;
          }
     }

     if (numToManage >= 1) {
          return (
               <Center>
                    <Button size="sm" variant="solid" style={{ backgroundColor: theme.tokens.colors.primary['500'], marginRight: 1 }} onPress={handleOpen}>
                         <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'hold_manage_all')}</ButtonText>
                    </Button>
                    <Actionsheet isOpen={showActionsheet} onClose={handleClose} zIndex={999}>
                         <ActionsheetBackdrop />
                         <ActionsheetContent
                              zIndex={999}
                              style={{ backgroundColor: actionSheetBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                         >
                              <ActionsheetDragIndicatorWrapper>
                                   <ActionsheetDragIndicator />
                              </ActionsheetDragIndicatorWrapper>
                              <ActionsheetItem
                                   isLoading={cancelling}
                                   isLoadingText={getTermFromDictionary(language, 'canceling', true)}
                                   onPress={() => {
                                        handleClose();
                                        startCancelling(true);
                                        cancelHolds(titlesToCancel, library.baseUrl, language).then(() => {
                                             resetGroup();
                                             startCancelling(false);
                                        });
                                        queryClient.invalidateQueries({ queryKey: ['holds', user.id, library.baseUrl, language] });
                                   }}>
                                   <ActionsheetItemText style={{ color: textColor }}>{numToCancelLabel}</ActionsheetItemText>
                              </ActionsheetItem>

                              {freezeAllActionItem()}

                              <ActionsheetItem
                                   isLoading={thawing}
                                   isLoadingText={getTermFromDictionary(language, 'thaw_hold', true)}
                                   onPress={() => {
                                        handleClose();
                                        startThawing(true);
                                        thawHolds(titlesToThaw, library.baseUrl, language).then(() => {
                                             resetGroup();
                                             startThawing(false);
                                        });
                                        queryClient.invalidateQueries({ queryKey: ['holds', user.id, library.baseUrl, language] });
                                   }}>
                                   <ActionsheetItemText style={{ color: textColor }}>{numToThawLabel}</ActionsheetItemText>
                              </ActionsheetItem>
                         </ActionsheetContent>
                    </Actionsheet>
               </Center>
          );
     }

     return null;
};
