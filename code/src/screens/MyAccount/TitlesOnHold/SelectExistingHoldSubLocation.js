import _ from 'lodash';
import React from 'react';
import { Box } from '@/components/ui/box';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Icon, ChevronDownIcon } from '@/components/ui/icon';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';

import { getTermFromDictionary } from '../../../translations/TranslationService';

export const SelectExistingHoldSubLocation = (props) => {
     const { sublocations, language, location, activeSublocation, setActiveSublocation, textColor, colorMode, theme } = props;
     const selectBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

     const [locationId, locationCode] = location.split("_");
     if (sublocations !== undefined) {
          if (_.isObject(sublocations)) {
               const validSublocations = [];

               const sublocationValues = Object.values(sublocations);
               let activeSublocationNeedsToChange = true;
               for (const index in sublocationValues) {
                    let sublocation = sublocationValues[index];
                    if (sublocation.locationCode == locationCode) {
                         validSublocations.push(sublocation);
                         if (activeSublocation == sublocation.id) {
                              activeSublocationNeedsToChange = false;
                         }
                    }
               }
               const validSublocationSize = validSublocations.length;
               if (validSublocationSize > 0) {
                    validSublocations.sort((a, b) => a.subLocationWeight - b.subLocationWeight);
                    if (activeSublocationNeedsToChange){
                         //todo set the sublocation to change to
                         setActiveSublocation(validSublocations[0].id);
                    }
               }

               if (validSublocationSize > 1) {
                    return (
                         <>
                              <Box style={{ paddingLeft: 16, paddingRight: 16 }}>
                                   <FormControl>
                                        <FormControlLabel>
                                             <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'select_new_pickup_area')}</FormControlLabelText>
                                        </FormControlLabel>
                                        <Select
                                             selectedValue={activeSublocation}
                                             onValueChange={(itemValue) => setActiveSublocation(itemValue)}>
                                             <SelectTrigger variant="outline" size="md">
                                                  <SelectInput placeholder={getTermFromDictionary(language, 'select_new_pickup_area')} style={{ color: textColor, paddingVertical: 0 }} />
                                                  <SelectIcon as={ChevronDownIcon} style={{ marginRight: 12, color: textColor }} />
                                             </SelectTrigger>
                                             <SelectPortal>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: selectBg }}>
                                                       <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator />
                                                       </SelectDragIndicatorWrapper>
                                                       <SelectScrollView>
                                                            {validSublocations.map((item, index) => {
                                                                 return <SelectItem value={item.id} label={item.displayName} key={index} />;
                                                            })}
                                                       </SelectScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                              </Box>
                         </>
                    );
               }else{
                    return null;
               }
          }else{
               return null;
          }
     } else {
          return null;
     }
};
