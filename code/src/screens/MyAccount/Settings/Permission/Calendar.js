import { Camera } from 'expo-camera';
import React from 'react';
import * as Calendar from 'expo-calendar';
import { useRoute } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { AppState, Platform } from 'react-native';
import { Accordion, AccordionContent, AccordionContentText, AccordionHeader, AccordionIcon, AccordionItem, AccordionTitleText, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';


import { navigate } from '../../../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../../../translations/TranslationService';
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react-native';
import Constants from 'expo-constants';
import { useActiveLanguage } from '../../../../hooks/useLanguageData';
import { useTheme } from '../../../../themes/theme';

export const CalendarPermissionStatus = () => {
     const language = useActiveLanguage();
     const { textColor } = useTheme();
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
                    <Text bold style={{ color: textColor }}>
                         {getTermFromDictionary(language, 'calendar_permission')}
                    </Text>
                    <HStack alignItems="center">
                         <Text style={{ color: textColor }}>{permissionStatus === true ? getTermFromDictionary(language, 'allowed') : getTermFromDictionary(language, 'not_allowed')}</Text>
                         <Icon as={ChevronRight} style={{ marginLeft: 4, color: textColor }} />
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
                         <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'device_set_to')}</Text>

                         <Heading style={{ marginBottom: 4, color: textColor }}>
                              {permissionStatus === true ? getTermFromDictionary(language, 'allowed') : getTermFromDictionary(language, 'not_allowed')}
                         </Heading>
                         <Text style={{ color: textColor }}>
                              {Constants.expoConfig.name} {permissionStatus === true ? getTermFromDictionary(language, 'allowed_calendar') : getTermFromDictionary(language, 'not_allowed_calendar')}
                         </Text>

                         <Text style={{ color: textColor, marginTop: 20 }}>
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
                                             {isExpanded ? <AccordionIcon as={ChevronUp} style={{ marginLeft: 12, color: textColor }} /> : <AccordionIcon as={ChevronDown} style={{ marginLeft: 12, color: textColor }} />}
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
     const { colorMode, theme, textColor } = useTheme();
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

     const dialogBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

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
                    style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                    <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'update_device_settings')}</ButtonText>
               </Button>
               <AlertDialog
                    isOpen={showAlertDialog}
                    onClose={() => {
                         setShowAlertDialog(false);
                    }}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent style={{ backgroundColor: dialogBg }}>
                         <AlertDialogHeader>
                              <Heading style={{ color: textColor }}>{getTermFromDictionary(language, 'update_device_settings')}</Heading>
                         </AlertDialogHeader>
                         <AlertDialogBody>
                              <Text style={{ color: textColor }}>{Platform.OS === 'android' ? getTermFromDictionary(language, 'update_calendar_android') : getTermFromDictionary(language, 'update_calendar_ios')}</Text>
                         </AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup style={{ flexDirection: 'column', alignItems: 'stretch', width: '100%' }}>
                                   <Button
                                        onPress={() => {
                                             Linking.openSettings();
                                             setShowAlertDialog(false);
                                        }}
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'open_device_settings')}</ButtonText>
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
