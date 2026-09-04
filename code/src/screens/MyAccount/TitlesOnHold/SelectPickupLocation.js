import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { changeHoldPickUpLocation } from '../../../util/api/user';
import {SelectExistingHoldSubLocation} from './SelectExistingHoldSubLocation';
import { ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Icon, ChevronDownIcon, CloseIcon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { ScrollView } from '@/components/ui/scroll-view';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';

export const SelectPickupLocation = (props) => {
     const { locations, sublocations, onClose, currentPickupId, holdId, userId, libraryContext, holdsContext, resetGroup, language, textColor, colorMode, theme } = props;
     let pickupLocation = _.findIndex(locations, function (o) {
          return o.locationId === currentPickupId;
     });

     let pickupId = currentPickupId;
     if (_.isNumber(pickupId)) {
          pickupId = _.toString(pickupId);
     }

     pickupLocation = _.nth(locations, pickupLocation);
     let pickupLocationCode = _.get(pickupLocation, 'code', '');
     if (_.isNumber(pickupLocationCode)) {
          pickupLocationCode = _.toString(pickupLocationCode);
     }
     if (pickupId != false) {
          pickupLocation = pickupId.concat('_', pickupLocationCode);
     }else{
          pickupLocation = '';
     }

     const [loading, setLoading] = React.useState(false);
     const [showModal, setShowModal] = React.useState(false);
     let [location, setLocation] = React.useState(pickupLocation);
     let [activeSublocation, setActiveSublocation] = React.useState(null);
     const modalBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const tertiaryBg = theme.tokens.colors.tertiary['300'] ?? theme.tokens.colors.tertiary['500'];

     return (
          <>
               <ActionsheetItem
                    onPress={() => {
                         setShowModal(true);
                    }}>
                    <ActionsheetIcon>
                        <Ionicons name="location" size={18} color={textColor} style={{ marginRight: 4 }} />
                    </ActionsheetIcon>
                   <ActionsheetItemText style={{ color: textColor }}>{getTermFromDictionary(language, 'change_location')}</ActionsheetItemText>
               </ActionsheetItem>
               <Modal

                    isOpen={showModal}
                    avoidKeyboard={true}
                    onBackdropPress={() => {
                         setShowModal(false);
                    }}>
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: modalBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'change_hold_location')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowModal(false); }}>
                                  <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Box style={{ paddingLeft: 16, paddingRight: 16 }}>
                                   <FormControl>
                                       <FormControlLabel><FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'select_new_pickup')}</FormControlLabelText></FormControlLabel>
                                        <Select
                                             name="pickupLocations"
                                             selectedValue={location}
                                             minWidth="100%"
                                             accessibilityLabel={getTermFromDictionary(language, 'select_new_pickup')}
                                             style={{ marginTop: 4, marginBottom: 12 }}
                                             onValueChange={(itemValue) => setLocation(itemValue)}>

                                             <SelectTrigger variant="outline" size="md">
                                                  {locations.map((item, index) => {
                                                       const locationId = item.locationId;
                                                       const code = item.code;
                                                       const id = locationId.concat('_', code);
                                                       if (id === location) {
                                                            return <SelectInput key={index} value={item.name} style={{ color: textColor, paddingVertical: 0 }} />;
                                                       }
                                                       return null;
                                                  })}
                                                  <SelectIcon as={ChevronDownIcon} style={{ marginRight: 12, color: textColor }} />
                                             </SelectTrigger>
                                             <SelectPortal>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: modalBg }}>
                                                       <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator />
                                                       </SelectDragIndicatorWrapper>
                                                       <ScrollView style={{ maxHeight: 400, minWidth: "100%" }}>
                                                            {locations.map((item, index) => {
                                                                 const locationId = item.locationId;
                                                                 const code = item.code;
                                                                 const id = locationId.concat('_', code);
                                                                 return (
                                                                     <SelectItem
                                                                          value={id}
                                                                          label={item.name}
                                                                          key={index}
                                                                          style={{ backgroundColor: location === id ? tertiaryBg : 'transparent' }}
                                                                      />
                                                                 );
                                                            })}
                                                       </ScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                              </Box>
                              <SelectExistingHoldSubLocation location={location} sublocations={sublocations} language={language} activeSublocation={activeSublocation} setActiveSublocation={setActiveSublocation} textColor={textColor} colorMode={colorMode} theme={theme} />
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup
                                   space="md"
                                   style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}
                                   >
                                   <Button
                                        variant="outline"
                                        style={{ borderColor: theme.tokens.colors.primary['500'] }}
                                        onPress={() => {
                                             setShowModal(false);
                                        }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                   </Button>
                                   <Button
                                        isLoading={loading}
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        isLoadingText={getTermFromDictionary(language, 'updating', true)}
                                        onPress={() => {
                                             setLoading(true);
                                             changeHoldPickUpLocation(holdId, location, activeSublocation, libraryContext.baseUrl, userId, language).then((r) => {
                                                  setShowModal(false);
                                                  resetGroup();
                                                  onClose(onClose);
                                                  setLoading(false);
                                             });
                                        }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'change_location')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </>
     );
};
