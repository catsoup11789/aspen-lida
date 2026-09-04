import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import _ from 'lodash';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { logDebugMessage, logErrorMessage } from '@/src/util/logging';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ChevronDownIcon, Icon } from '@/components/ui/icon';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';

/**
 * SelectNewHoldSublocation component for selecting a new hold sublocation for a library hold request.
 * @param props
 * @returns {React.JSX.Element|null}
 * @constructor
 */
export const SelectNewHoldSublocation = (props) => {
     const {sublocations, location, activeSublocation, setActiveSublocation, language, textColor, uiColors, colorMode, runtimeColors} = props;
     const insets = useSafeAreaInsets();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const tertiaryBg = runtimeColors.tertiary[300] ?? runtimeColors.tertiary[500];

     if (sublocations !== undefined) {
          try {
               if (_.isObject(sublocations)) {
                    const objectSize = Object.keys(sublocations).length;
                    const validSublocations = [];

                    const sublocationValues = Object.values(sublocations);
                    let activeSublocationNeedsToChange = true;
                    logDebugMessage("Active sublocation is " + activeSublocation);
                    for (const sublocation of sublocationValues) {
                         if (sublocation.locationCode == location) {
                              validSublocations.push(sublocation);
                              if (activeSublocation === sublocation.id) {
                                   activeSublocationNeedsToChange = false;
                              }
                         }
                    }

                    logDebugMessage("Valid sublocations");
                    logDebugMessage(validSublocations);
                    const validSublocationSize = validSublocations.length;
                    if (validSublocationSize > 0) {
                         validSublocations.sort((a, b) => a.subLocationWeight - b.subLocationWeight);
                         if (activeSublocationNeedsToChange){
                              setActiveSublocation(validSublocations[0].id);
                         }

                    }

                    //sublocations need to convert from an object to an array!
                    if (validSublocationSize > 1) {
                         const bottomPadding = Platform.OS === 'android' ? (insets ? insets.bottom : 0) + 16 : '$4';
                         return (
                              <>
                                   <FormControl>
                                        <FormControlLabel>
                                             <FormControlLabelText size="sm" style={{ color: textColor }}>
                                                  {getTermFromDictionary(language, 'select_pickup_area')}
                                             </FormControlLabelText>
                                        </FormControlLabel>
                                        <Select name="sublocations" selectedValue={activeSublocation} minWidth={200} onValueChange={(itemValue) => setActiveSublocation(itemValue)}>
                                             <SelectTrigger variant="outline" size="md">
                                                  {validSublocations.map((sublocation, index) => {
                                                       if (sublocation.id === activeSublocation) {
                                                            return <SelectInput key={index} style={{ paddingVertical: 0, color: textColor }} value={sublocation.displayName} />;
                                                       }
                                                       return null;
                                                  })}
                                                  <SelectIcon style={{ marginRight: 12 }}>
                                                       <Icon as={ChevronDownIcon} style={{ color: textColor }} />
                                                  </SelectIcon>
                                             </SelectTrigger>
                                             <SelectPortal useRNModal={true}>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: bottomPadding === '$4' ? 16 : bottomPadding }}>
                                                      <SelectDragIndicatorWrapper>
                                                           <SelectDragIndicator />
                                                      </SelectDragIndicatorWrapper>
                                                      <SelectScrollView>
                                                            {validSublocations.map((sublocation, index) => {
                                                                 if (sublocation.id === activeSublocation) {
                                                                      return <SelectItem label={sublocation.displayName} value={sublocation.id} key={index} style={{ backgroundColor: tertiaryBg }} />;
                                                                 }
                                                                 return <SelectItem label={sublocation.displayName} value={sublocation.id} key={index} />;
                                                            })}
                                                      </SelectScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                              </>
                         );
                    }else if (validSublocationSize <= 1) {
                         //No sub locations to choose from
                         logDebugMessage("Do not need to display sublocations, got " + validSublocationSize);
                         return null;
                    }
               }else{
                    logDebugMessage("Sublocations are an array, expected object");
                    return null;
               }
          } catch (e) {
               logErrorMessage("Error loading sublocations");
               logErrorMessage(e);
               return <Text>Oh no, there was an error loading sublocations</Text>;
          }
     }else{
          logDebugMessage("undefined");
          return <Text>Sublocations were undefined</Text>;
     }
};
