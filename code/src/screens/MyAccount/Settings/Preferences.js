import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import _ from 'lodash';
import React from 'react';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useUserState, useUpdateExpoToken } from '@/src/hooks/useUserData';
import { navigate } from '@/src/helpers/RootNavigator';
import { UseColorMode, useTheme } from '@/src/themes/theme';
import { getTermFromDictionary, LanguageSwitcher } from '@/src/translations/TranslationService';
import { logErrorMessage } from '@/src/util/logging';
import * as Device from "expo-device";
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

/**
 * PreferencesScreen component that displays user preferences and settings. It allows users to manage browse categories, pickup locations, device permissions, support, language, and appearance settings. It also handles fetching and updating the Expo push notification token when the screen is focused.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const PreferencesScreen = () => {
      const navigation = useNavigation();
      const library = useLibrary();
      const language = useActiveLanguage();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const expoToken = userState?.expoToken ?? false;
     const updateExpoToken = useUpdateExpoToken();
     const { textColor, theme } = useTheme();

     React.useEffect(() => {
          const updateTokens = navigation.addListener('focus', async () => {
               try {
                    const token = (!Device.isDevice
                         ? { data: 'ExponentPushToken[testToken' + Device.modelName + ']' }
                         : await Notifications.getExpoPushTokenAsync({
                              projectId: Constants.expoConfig.extra.eas.projectId })).data;
                    if (token) {
                         if (!_.isEmpty(user.notification_preferences)) {
                              const tokenStorage = user.notification_preferences;
                              if (_.find(tokenStorage, _.matchesProperty('token', token))) {
                                   updateExpoToken(token);
                              }
                         }
                    }
               } catch (error) {
                    logErrorMessage('Error fetching Expo push token:', error);
               }
          });
          return updateTokens;
     }, [navigation]);

     return (
         <Box style={{ padding: 12 }}>
               <VStack space="sm">
                    <VStack space="md">
                         <VStack space="sm">
                              <Pressable style={{ paddingVertical: 8 }} onPress={() => navigate('MyPreferences_ManageBrowseCategories', { prevRoute: 'Preferences' })}>
                                   <HStack space="xs" alignItems="center">
                                        <MaterialIcons name="chevron-right" size={24} color={textColor} />
                                        <Text style={{ color: textColor, fontWeight: '500' }}>
                                             {getTermFromDictionary(language, 'manage_browse_categories')}
                                        </Text>
                                   </HStack>
                              </Pressable>
                              {library.allowPickupLocationUpdates ? (
                                   <Pressable style={{ paddingVertical: 8 }} onPress={() => navigate('MyPreferences_ManagePickupLocations')}>
                                        <HStack space="xs" alignItems="center">
                                             <MaterialIcons name="chevron-right" size={24} color={textColor} />
                                             <Text style={{ color: textColor, fontWeight: '500' }}>
                                                  {getTermFromDictionary(language, 'manage_pickup_locations')}
                                             </Text>
                                        </HStack>
                                   </Pressable>
                              ) : null}
                              <Pressable style={{ paddingVertical: 8 }} onPress={() => navigate('PermissionDashboard')}>
                                   <HStack space="xs" alignItems="center">
                                        <MaterialIcons name="chevron-right" size={24} color={textColor} />
                                        <Text style={{ color: textColor, fontWeight: '500' }}>
                                             {getTermFromDictionary(language, 'device_permissions')}
                                        </Text>
                                   </HStack>
                              </Pressable>
                              <Pressable style={{ paddingVertical: 8 }} onPress={() => navigate('MyDevice_Support')}>
                                   <HStack space="xs" alignItems="center">
                                        <MaterialIcons name="chevron-right" size={24} color={textColor} />
                                        <Text style={{ color: textColor, fontWeight: '500' }}>
                                             {getTermFromDictionary(language, 'support')}
                                        </Text>
                                   </HStack>
                              </Pressable>
                         </VStack>
                    </VStack>
                    <Divider/>
                    <VStack>
                         <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text bold style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'language')}
                              </Text>
                              <LanguageSwitcher />
                         </HStack>
                         <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text bold style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'appearance')}
                              </Text>
                              <UseColorMode showText={true} />
                         </HStack>
                    </VStack>
               </VStack>
          </Box>
     );
};
