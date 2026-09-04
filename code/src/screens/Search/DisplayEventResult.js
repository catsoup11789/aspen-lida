import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { popToast } from '../../components/feedback';
import { getCleanTitle } from '../../helpers/item';
import { navigate } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { decodeHTML } from '../../helpers/helpers';
import AddToList from './AddToList';
import { logDebugMessage, logErrorMessage } from '../../util/logging';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { ThemedBadge, ThemedBadgeText } from '../../components/themed/ThemedBadge';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * DisplayEventResult component that displays an individual event result with its image, title, date, time, location, and registration requirement. It handles user interaction to navigate to the event details or open the event URL in a web browser.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const DisplayEventResult = (props) => {
     const item = props.data;
     const library = useLibrary();
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();

     const backgroundColor = colorMode === 'light' ? theme.tokens.colors.ui.surfaceMuted.light : theme.tokens.colors.ui.surfaceMuted.dark;

     const id = item.key ?? item.id;
     const keyParts = item.key.split('_');

     let url = item.image ?? library.baseUrl + '/bookcover.php?id=' + item.key + '&size=medium&type=' + keyParts[0] + '_event';

     let registrationRequired = false;
     if (!_.isUndefined(item.registration_required)) {
          registrationRequired = item.registration_required;
     }

     const startTime = item.start_date.date;
     const endTime = item.end_date.date;

     let time1 = startTime.split(' ');
     let day = time1[0];
     let time2 = endTime.split(' ');

     let time1arr = time1[1].split(':');
     let time2arr = time2[1].split(':');

     let displayDay = moment(day);
     let displayStartTime = moment().set({ hour: time1arr[0], minute: time1arr[1] });
     let displayEndTime = moment().set({ hour: time2arr[0], minute: time2arr[1] });

     displayDay = moment(displayDay).format('dddd, MMMM D, YYYY');
     displayStartTime = moment(displayStartTime).format('h:mm A');
     displayEndTime = moment(displayEndTime).format('h:mm A');

     let locationData = item?.location ?? [];

     const handlePressItem = () => {
          let eventSource = item.source;
          if (item.source === 'lc') {
               eventSource = 'library_calendar';
          }
          if (item.source === 'libcal' || item.source === 'springshare_libcal') {
               eventSource = 'springshare';
          }

          if (item.source === 'assabet') {
               eventSource = 'assabet';
          }

          if (item.source === 'aspenEvent') {
               eventSource = 'aspenEvent';
          }

          if (item.bypass) {
               openURL(item.url);
          } else {
               navigate('EventScreen', {
                    id: id,
                    title: getCleanTitle(item.title),
                    url: library.baseUrl,
                    source: eventSource });
          }
     };

     const openURL = async (url) => {
          const browserParams = {
               enableDefaultShareMenuItem: false,
               presentationStyle: 'automatic',
               showTitle: false,
               toolbarColor: backgroundColor,
               controlsColor: textColor,
               secondaryToolbarColor: backgroundColor };
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
                                        logDebugMessage('Unable to close previous browser session.');
                                        logErrorMessage(error);
                                   });
                         } catch (error) {
                              logDebugMessage('Really borked.');
                              logErrorMessage(error);
                         }
                    } else {
                         popToast(getTermFromDictionary('en', 'error_no_open_resource'), getTermFromDictionary('en', 'error_device_block_browser'), 'error');
                         logErrorMessage(err);
                    }
               });
     };

     return (
         <Pressable style={{ borderBottomWidth: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={handlePressItem}>
               <HStack space="md">
                    <VStack style={{ width: 100 }}>
                         <Box style={{ height: 150 }}>
                              <Image
                                   alt={item.title}
                                   source={url}
                                   style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: 8 }}
                                   placeholder={blurhash}
                                   transition={1000}
                                   contentFit="cover"
                              />
                         </Box>
                         {item.canAddToList ? <AddToList source="Events" itemId={item.key} btnStyle="sm" /> : null}
                    </VStack>
                    <VStack style={{ width: '65%', paddingTop: 4 }}>
                         <Text bold style={{ color: textColor, fontSize: 14, lineHeight: 17, paddingBottom: 4 }}>
                              {decodeHTML(item.title)}
                         </Text>
                         {item.start_date && item.end_date ? (
                              <>
                                   <Text style={{ color: textColor, fontSize: 12, lineHeight: 15 }}>
                                        {displayDay}
                                   </Text>
                                   <Text style={{ color: textColor, fontSize: 12, lineHeight: 15 }}>
                                        {displayStartTime} - {displayEndTime}
                                   </Text>
                              </>
                         ) : null}
                         {locationData.name ? (
                              <Text style={{ color: textColor, fontSize: 12, lineHeight: 15 }}>
                                   {locationData.name}
                              </Text>
                         ) : null}
                         {registrationRequired ? (
                              <HStack space="xs" style={{ marginTop: 16, flexWrap: 'wrap' }}>
                                   <ThemedBadge key={0} action="secondary" variant="outline" style={{ borderRadius: 8, borderColor: theme['tokens']['colors']['secondary']['400'], backgroundColor: 'transparent' }}>
                                        <ThemedBadgeText action="secondary" style={{ textTransform: 'none', color: theme['tokens']['colors']['secondary']['400'], fontSize: 10, lineHeight: 14 }}>
                                             {getTermFromDictionary(language, 'registration_required')}
                                        </ThemedBadgeText>
                                   </ThemedBadge>
                              </HStack>
                         ) : null}
                    </VStack>
               </HStack>
          </Pressable>
     );
};
