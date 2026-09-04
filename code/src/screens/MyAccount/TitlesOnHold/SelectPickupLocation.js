import { Ionicons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { changeHoldPickUpLocation } from '@/src/util/api/user';
import {SelectExistingHoldSubLocation} from './SelectExistingHoldSubLocation';
import { ThemedCloseIcon } from '@/src/components/themed/ThemedFormControls';
import { ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { ScrollView } from '@/components/ui/scroll-view';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';

/**
 * SelectPickupLocation component that renders a modal for selecting a new pickup location for a hold. It displays a list of available locations and sublocations, allows the user to select one, and updates the hold's pickup location when confirmed.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const SelectPickupLocation = (props) => {
     const { locations, sublocations, onClose, currentPickupId, holdId, userId, libraryContext, holdsContext, resetGroup, language, textColor, colorMode, uiColors } = props;
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
     const modalBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;

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
                              <Heading size="md">{getTermFromDictionary(language, 'change_hold_location')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowModal(false); }}>
                                  <ThemedCloseIcon />
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
                                                                          selectedValue={location}
                                                                      />
                                                                 );
                                                            })}
                                                       </ScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                              </Box>
                              <SelectExistingHoldSubLocation location={location} sublocations={sublocations} language={language} activeSublocation={activeSublocation} setActiveSublocation={setActiveSublocation} textColor={textColor} colorMode={colorMode} uiColors={uiColors} />
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup
                                   space="md"
                                   style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}
                                   >
                                   <Button colorScheme="primary"
                                        variant="outline"
                                       
                                        onPress={() => {
                                             setShowModal(false);
                                        }}>
                                       <ButtonText>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                   </Button>
                                   <Button
                                        isLoading={loading}
                                       colorScheme="primary"
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
                                       <ButtonText>{getTermFromDictionary(language, 'change_location')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </>
     );
};
