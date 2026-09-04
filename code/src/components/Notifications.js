import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import _ from 'lodash';
import React, {useContext} from 'react';
import { Platform } from 'react-native';
import { ThemedAlert, ThemedAlertIcon, ThemedAlertText } from './themed/ThemedAlert';
import { Button, ButtonIcon } from '@/components/ui/button';
import { CloseIcon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { VStack } from '@/components/ui/vstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { getTermFromDictionary } from '../translations/TranslationService';
import { dismissSystemMessage } from '../util/api/system';
import { normalizeDisplayText, stripHTML } from '../helpers/helpers';
import { logDebugMessage, logErrorMessage } from '../util/logging.js';

/**
 * Registers the device for push notifications and returns the Expo push token.
 * @param updateUserDebugMessage
 * @returns {Promise<string|boolean>}
 */
export async function registerForPushNotificationsAsync(updateUserDebugMessage) {
     try {
          updateUserDebugMessage("Registering for push notifications async");

          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          // Only ask for permissions if not already granted
          if (existingStatus !== 'granted') {
               updateUserDebugMessage("Requesting notification permissions...");
               // Call requestPermissionsAsync without any parameters
               const { status } = await Notifications.requestPermissionsAsync();
               finalStatus = status;
          }

          if (finalStatus !== 'granted') {
               logErrorMessage('Failed to get push notification permissions');
               return false;
          }

          // Create notification channels for Android
          if (Platform.OS === 'android') {
               await createChannelsAndCategories();
          }

          // Get the token
          if (!Device.isDevice) {
               // For simulator
               updateUserDebugMessage("Running on simulator - using development notification setup");
               logDebugMessage("created simulator push token");
               return 'ExponentPushToken[testToken' + Device.modelName + ']';
          }else{
               //Real devices
               const response = await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig.extra.eas.projectId });

               logDebugMessage('Got push token:' + response.data);
               return response.data;
          }
     } catch (error) {
          logErrorMessage("Error in registerForPushNotificationsAsync:", error);
          updateUserDebugMessage("Error in registerForPushNotificationsAsync");
          updateUserDebugMessage(error);
          return false;
     }
}

async function createNotificationChannelGroup(id, name, description = null) {
     if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelGroupAsync(`${id}`, {
               name: `${name}`,
               description: `${description}` });
     }
}

async function getNotificationChannelGroup(group) {
     if (Platform.OS === 'android') {
          return Notifications.getNotificationChannelGroupAsync(`${group}`);
     }
     return false;
}

async function createNotificationChannel(id, name, groupId) {
     if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(`${id}`, {
               name: `${name}`,
               importance: Notifications.AndroidImportance.MAX,
               vibrationPattern: [0, 250, 250, 250],
               lightColor: '#FF231F7C',
               groupId: `${groupId}`,
               showBadge: true });
     }
}

async function getNotificationChannel(channel) {
     if (Platform.OS === 'android') {
          return Notifications.getNotificationChannelAsync(`${channel}`);
     }
     return false;
}

async function createNotificationCategory(id, name, button) {
     await Notifications.setNotificationCategoryAsync(`${id}`, [
          {
               identifier: `${name}`,
               buttonTitle: `${button}` },
     ]);
}

async function getNotificationCategories() {
     return Notifications.getNotificationCategoriesAsync();
}

export async function createChannelsAndCategories() {
     logDebugMessage('Creating channels and categories for notifications...');
     const updatesChannelGroup = await getNotificationChannelGroup('updates');
     if (!updatesChannelGroup) {
          await createNotificationChannelGroup('updates', 'Updates');
     }

     const savedSearchChannel = await getNotificationChannel('savedSearch');
     if (!savedSearchChannel) {
          await createNotificationChannel('savedSearch', 'Saved Searches', 'updates');
     }

     const libraryAlertChannel = await getNotificationChannel('libraryAlert');
     if (!libraryAlertChannel) {
          await createNotificationChannel('libraryAlert', 'Library Alert', 'updates');
     }

     const accountAlertChannel = await getNotificationChannel('accountAlert');
     if (!accountAlertChannel) {
          await createNotificationChannel('accountAlert', 'Account Alert', 'updates');
     }

     const existingCategories = await getNotificationCategories('savedSearch');

     const hasCategory = (identifier) =>
          existingCategories.some((cat) => cat.identifier === identifier);
     if (!hasCategory('savedSearch')) {
          await createNotificationCategory('savedSearch', 'Saved Searches', 'View');
     }

     if (!hasCategory('libraryAlert')) {
          await createNotificationCategory('libraryAlert', 'Library Alert', 'Read More');
     }

     if (!hasCategory('accountAlert')) {
          await createNotificationCategory('accountAlert', 'Account Alert', 'View');
     }
}

/** status/colorScheme options: success, error, info, warning **/
export function showILSMessage(type, message, index = 0) {
     const formattedMessage = stripHTML(message);
     logDebugMessage("Showing ILS Message");
     return (
          <ThemedAlert action={type} key={index} style={{ marginHorizontal: 8, marginBottom: 4 }}>
               <ThemedAlertIcon action={type} style={{ marginRight: 12 }} />
               <ThemedAlertText action={type} size="xs" bold>
                    {formattedMessage}
               </ThemedAlertText>
          </ThemedAlert>
     );
}

/** status/colorScheme options: success, error, info, warning **/
export const DisplayMessage = (props) => {
     const safeMessage = normalizeDisplayText(props.message);
     const fallbackMessage = getTermFromDictionary('en', 'unknown_error') || 'An unknown error occurred.';
     const displayMessage = safeMessage || fallbackMessage;

     return (
          <ThemedAlert action={props.type} variant="solid" style={{ marginBottom: 8, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'flex-start', minHeight: 0, height: 'auto' }}>
               <Text size="sm" style={{ color: '#111827', flexShrink: 1, flexWrap: 'wrap', fontWeight: '500' }}>
                    {displayMessage}
               </Text>
          </ThemedAlert>
     );
};

async function hideSystemMessage(allSystemMessages, currentMessageId, isDismissible, url) {
     let messages = allSystemMessages;
     // remove it from the array to hide it for the session
     messages = _.reject(messages, { id: currentMessageId });

     if (isDismissible === 1 || isDismissible === '1') {
          // send request to dismiss it with Discovery
          await dismissSystemMessage(currentMessageId, url);
     }

     return messages;
}

export const DisplayAndroidEndOfSupportMessage = (props) => {
     const setIsOpen = props.setIsOpen;
     const language = props.language;
     return (
          <ThemedAlert action="error" style={{ marginBottom: 12 }}>
               <VStack space="xs" style={{ width: '100%' }}>
                    <HStack alignItems="flex-start" justifyContent="space-between">
                         <ThemedAlertText action="error" size="sm">
                              {getTermFromDictionary(language, 'android_end_of_life')}
                         </ThemedAlertText>
                         <Button
                              variant="link"
                              onPress={() => setIsOpen(false)}>
                              <ButtonIcon as={CloseIcon} size="md" />
                         </Button>
                    </HStack>
               </VStack>
          </ThemedAlert>
     );
};
/** status/colorScheme options: success, error, info, warning **/
export const DisplaySystemMessage = (props) => {
     const queryClient = props.queryClient;
     const updateSystemMessages = props.updateSystemMessages;
     let style = props.style;
     if (style === '') {
          style = 'none';
     }else if (style === 'danger') {
          style = 'error';
     }
     logDebugMessage("System Message Style is " + style);

     return (
          <ThemedAlert action={style} variant="solid" style={{ minHeight: 200, marginBottom: 8, borderRadius: 4 }}>
               <VStack space="sm" style={{ width: '100%', padding: 12 }}>
                    <HStack alignItems="flex-start" justifyContent="space-between">
                         <ThemedAlertText action={style} variant="solid" style={{ marginRight: 8 }}>{props.message}</ThemedAlertText>
                         <Pressable
                              onPress={async () => {
                                   await hideSystemMessage(props.all, props.id, props.dismissable, props.url).then((result) => {
                                        queryClient.setQueryData(['system_messages', props.url], result);
                                        updateSystemMessages(result);
                                   });
                              }}>
                              <CloseIcon style={{ color: '#000000' }} />
                         </Pressable>
                    </HStack>
               </VStack>
          </ThemedAlert>
     );
};
