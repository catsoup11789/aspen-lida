import { useRoute } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { ThemedBadge, ThemedBadgeText } from '../../components/themed/ThemedBadge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { DisplaySystemMessage } from '../../components/Notifications';
import { SystemMessagesContext } from '../../context/initialContext';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useAvailableLocations } from '../../hooks/useLibraryBranchData';
import { navigate } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';
import AdditionalInformation from './AdditionalInformation';
import ContactButtons from './ContactButtons';
import DisplayMap from './DisplayMap';
import Hours from './Hours';
import {logDebugMessage} from "../../util/logging";
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';

const blurhash = 'MHPZ}tt7*0WC5S-;ayWBofj[K5RjM{ofM_';

/**
 * Location component that displays detailed information about a specific library location, including its image, address, phone number, hours of operation, map, contact buttons, and additional information. It also handles system messages and navigation to view all locations if applicable.
 * @returns {React.JSX.Element|null}
 * @constructor
 */
export const Location = () => {
     const route = useRoute();
     const location = route.params?.data ?? false;
     const library = useLibrary();
     const locations = useAvailableLocations();
     const language = useActiveLanguage();
     const queryClient = useQueryClient();
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { colorMode, textColor, runtimeColors } = useTheme();
     const showSystemMessage = () => {
          if (_.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} queryClient={queryClient} />;
                    }
               });
          }
          return null;
     };

     let isClosedToday = false;
     let hoursLabel = '';
     let hasHours = false;
     if (location.hours) {
          if (_.size(location.hours) > 0) {
               hasHours = true;
          }
          const day = moment().day();
          if (_.find(location.hours, _.matchesProperty('day', day))) {
               let todaysHours = _.filter(location.hours, { day: day });
               if (todaysHours[0]) {
                    todaysHours = todaysHours[0];
                    if (todaysHours.isClosed) {
                         isClosedToday = true;
                         hoursLabel = getTermFromDictionary(language, 'location_closed');
                    } else {
                         const closingText = todaysHours.close;
                         const time1 = closingText.split(':');
                         const openingText = todaysHours.open;
                         const time2 = openingText.split(':');
                         const closeTime = moment().set({ hour: time1[0], minute: time1[1] });
                         const openTime = moment().set({ hour: time2[0], minute: time2[1] });
                         const nowTime = moment();
                         const stillOpen = moment(nowTime).isBefore(closeTime);
                         const stillClosed = moment(openTime).isBefore(nowTime);
                         if (!stillOpen) {
                              isClosedToday = true;
                              hoursLabel = getTermFromDictionary(language, 'location_closed');
                         }
                         if (!stillClosed) {
                              isClosedToday = true;
                              let openingTime = moment(openTime).format('h:mm A');
                              hoursLabel = 'Closed until ' + openingTime;
                         } else {
                              isClosedToday = false;
                              let closingTime = moment(closeTime).format('h:mm A');
                              hoursLabel = 'Open until ' + closingTime;
                         }
                    }
               }
          } else {
               isClosedToday = true;
               hoursLabel = getTermFromDictionary(language, 'location_closed');
          }
     }

     const key = 'location_' + location.locationId;
     logDebugMessage(key + ':' + location.locationImage);

     const selectLocations = () => {
          navigate('AllLocations');
     };

     if (!location) {
          return null;
     }

     return (
          <ScrollView>
               <Box>
                    <VStack space="md">
                         {location.locationImage ? (
                              <>
                                   <Image
                                        alt={location.displayName}
                                        source={location.locationImage}
                                        style={{
                                             width: '100%',
                                             height: 200,
                                             borderRadius: "$sm",
                                             zIndex: -1 }}
                                        placeholder={blurhash}
                                        transition={1000}
                                        contentFit="cover"
                                   />
                              </>
                         ) : null}
                         <Box style={{ marginHorizontal: 16, zIndex: 200 }}>
                              {showSystemMessage()}
                              {library.displayName !== location.displayName ? <Heading style={{ marginBottom: 8, color: textColor }}>{location.displayName}</Heading> : <Heading style={{ marginBottom: 4, color: textColor }}>{library.displayName}</Heading>}
                              {location.address ? <Text style={{ color: textColor }}>{location.address}</Text> : null}
                              {location.phone ? (
                                   <Text style={{ color: textColor }}>
                                        {getTermFromDictionary(language, 'phone')}: {location.phone}
                                   </Text>
                              ) : null}
                              {hasHours ? (
                                   <ThemedBadge action={isClosedToday ? 'error' : 'success'} style={{ alignSelf: 'flex-start' }}>
                                        <ThemedBadgeText action={isClosedToday ? 'error' : 'success'} style={{ color: textColor }}>
                                             {hoursLabel}
                                        </ThemedBadgeText>
                                   </ThemedBadge>
                              ) : null}
                         </Box>
                         <DisplayMap data={location} />
                         <Box style={{ marginHorizontal: 16 }} >
                              <ContactButtons data={location} />
                              {hasHours ? <Hours data={location} /> : null}
                              <AdditionalInformation data={location} />
                              {_.size(locations) > 1 ? (
                                   <>
                                        <Divider style={{ marginTop: 20, marginBottom: 8 }} />
                                        <Button size="sm" onPress={selectLocations} style={{ backgroundColor: runtimeColors.primary[500] }}>
                                            <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'view_all_locations')}</ButtonText>
                                        </Button>
                                   </>
                              ) : null}
                         </Box>
                    </VStack>
               </Box>
          </ScrollView>
     );
};
