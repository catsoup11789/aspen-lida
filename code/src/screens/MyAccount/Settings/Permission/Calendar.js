import { ThemedMaterialIcons as MaterialIcons } from '../../../../components/themed/ThemedMaterialIcons';
import React from 'react';
import * as Calendar from 'expo-calendar';
import { useRoute } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { AppState, Platform } from 'react-native';
import { Accordion, AccordionContent, AccordionContentText, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../../components/themed/ThemedButton';
import { ThemedButtonGroup as ButtonGroup } from '@/src/components/themed/ThemedButton';
import { Center } from '@/components/ui/center';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { ThemedScrollView as ScrollView } from '@/src/components/themed/ThemedScrollView';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { VStack } from '@/components/ui/vstack';
import { navigate } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import Constants from 'expo-constants';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';

/**
 * CalendarPermissionStatus component that displays the current calendar permission status and allows users to navigate to a detailed description of the permission settings. It checks the calendar permission status and updates it when the app state changes.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const CalendarPermissionStatus = () => {
     const language = useActiveLanguage();
     const [permissionStatus, setPermissionStatus] = React.useState(false);

     const appState = React.useRef(AppState.currentState);
     const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

     React.useEffect(() => {
          (async () => {
               const { status } = await Calendar.getCalendarPermissionsAsync();
               setPermissionStatus(status === 'granted');
          })();

          const subscription = AppState.addEventListener('change', async (nextAppState) => {
               if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                    const { status } = await Calendar.getCalendarPermissionsAsync();
                    setPermissionStatus(status === 'granted');
               }

               appState.current = nextAppState;
               setAppStateVisible(appState.current);
          });

          return () => {
               subscription.remove();
          };
     }, []);

     return (
          <Pressable onPress={() => navigate('PermissionCalendarDescription', { permissionStatus })} style={{ paddingBottom: 12 }}>
               <HStack space="md" justifyContent="space-between" alignItems="center">
                    <Text bold>
                         {getTermFromDictionary(language, 'calendar_permission')}
                    </Text>
                    <HStack alignItems="center">
                         <Text>{permissionStatus === true ? getTermFromDictionary(language, 'allowed') : getTermFromDictionary(language, 'not_allowed')}</Text>
                         <MaterialIcons name="chevron-right" size={20} style={{ marginLeft: 4 }} />
                    </HStack>
               </HStack>
          </Pressable>
     );
};

export const CalendarPermissionDescription = () => {
     const { textColor } = useTheme();
     const [permissionStatus, setPermissionStatus] = React.useState(useRoute().params?.permissionStatus ?? false);
     const language = useActiveLanguage();

     return (
          <ScrollView contentContainerStyle={{ padding: 20 }}>
               <VStack alignItems="stretch">
                    <Box>
                         <Text>{getTermFromDictionary(language, 'device_set_to')}</Text>

                         <Heading style={{ marginBottom: 4 }}>
                              {permissionStatus === true ? getTermFromDictionary(language, 'allowed') : getTermFromDictionary(language, 'not_allowed')}
                         </Heading>
                         <Text>
                              {Constants.expoConfig.name} {permissionStatus === true ? getTermFromDictionary(language, 'allowed_calendar') : getTermFromDictionary(language, 'not_allowed_calendar')}
                         </Text>

                         <Text style={{ marginTop: 20 }}>
                              {getTermFromDictionary(language, 'to_update_settings')}
                         </Text>
                         <CalendarPermissionUsage />
                    </Box>
                    <CalendarPermissionUpdate permissionStatus={permissionStatus} setPermissionStatus={setPermissionStatus} />
               </VStack>
          </ScrollView>
     );
};

const CalendarPermissionUsage = () => {
     const language = useActiveLanguage();
     const { textColor } = useTheme();

     return (
          <Accordion variant="unfilled" width="$full" size="sm">
               <AccordionItem value="description">
                    <AccordionHeader>
                         <AccordionTrigger style={{ paddingHorizontal: 0 }}>
                              {({ isExpanded }) => {
                                   return (
                                        <>
                                             <AccordionTitleText style={{ color: textColor }}>{getTermFromDictionary(language, 'how_we_use_calendar_title')}</AccordionTitleText>
                                             {isExpanded ? <AccordionIcon as={MaterialIcons} name="keyboard-arrow-up" style={{ marginLeft: 12, color: textColor }} /> : <AccordionIcon as={MaterialIcons} name="keyboard-arrow-down" style={{ marginLeft: 12, color: textColor }} />}
                                        </>
                                   );
                              }}
                         </AccordionTrigger>
                    </AccordionHeader>
                    <AccordionContent style={{ paddingHorizontal: 0 }}>
                         <AccordionContentText style={{ color: textColor }}>
                              {Constants.expoConfig.name} {getTermFromDictionary(language, 'how_we_use_calendar_body')}
                         </AccordionContentText>
                    </AccordionContent>
               </AccordionItem>
          </Accordion>
     );
};

const CalendarPermissionUpdate = (payload) => {
     const { resolvedUiColors, textColor } = useTheme();
     const language = useActiveLanguage();
     const [showAlertDialog, setShowAlertDialog] = React.useState(false);
     const [manuallyPromptPermission, setManuallyPromptPermission] = React.useState(false);
     const setPermissionStatus = payload.setPermissionStatus;
     const permissionStatus = payload.permissionStatus;

     const manuallyRequestPermission = async () => {
          await Calendar.requestCalendarPermissionsAsync().then(async () => {
               setManuallyPromptPermission(false);
               const { status } = await Calendar.getCalendarPermissionsAsync();
               setPermissionStatus(status === 'granted');
          });
     };

     React.useEffect(() => {
          (async () => {
               const { status } = await Calendar.getCalendarPermissionsAsync();
               setPermissionStatus(status === 'granted');
               if (status === 'undetermined') {
                    setManuallyPromptPermission(true);
               }
          })();
     }, []);

     const dialogBg = resolvedUiColors.surface;

     return (
          <Center>
               <Button
                    onPress={async () => {
                         if (manuallyPromptPermission) {
                              await manuallyRequestPermission();
                         } else {
                              setShowAlertDialog(true);
                         }
                    }}
                    colorScheme="primary">
                    <ButtonText>{getTermFromDictionary(language, 'update_device_settings')}</ButtonText>
               </Button>
               <AlertDialog
                    isOpen={showAlertDialog}
                    onClose={() => {
                         setShowAlertDialog(false);
                    }}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent style={{ backgroundColor: dialogBg }}>
                         <AlertDialogHeader>
                              <Heading>{getTermFromDictionary(language, 'update_device_settings')}</Heading>
                         </AlertDialogHeader>
                         <AlertDialogBody>
                              <Text>{Platform.OS === 'android' ? getTermFromDictionary(language, 'update_calendar_android') : getTermFromDictionary(language, 'update_calendar_ios')}</Text>
                         </AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup style={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
                                   <Button
                                        onPress={() => {
                                             Linking.openSettings();
                                             setShowAlertDialog(false);
                                        }}
                                        colorScheme="primary">
                                        <ButtonText>{getTermFromDictionary(language, 'open_device_settings')}</ButtonText>
                                   </Button>
                                   <Button variant="link" onPress={() => setShowAlertDialog(false)}>
                                        <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'not_now')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
};
