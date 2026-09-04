import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import _ from 'lodash';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ChevronDownIcon, CircleIcon, Icon } from '@/components/ui/icon';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';

export const SelectItemHold = (props) => {
     const { id, data, item, setItem, setHoldType, showModal, holdTypeForFormat, language, url, textColor, theme, colorMode } = props;
     const insets = useSafeAreaInsets();

     let holdType = props.holdType;
     let copies = data.copies;
     let copyKeys = Object.keys(copies);
     let key = copyKeys[0];
     let defaultItem = copies[key].id;

     if (holdType === 'either') {
          holdType = 'default';
     }

     if (item) {
          defaultItem = item;
     }

     return (
          <>
               {holdTypeForFormat === 'either' ? (
                    <FormControl>
                         <RadioGroup
                              name="holdTypeGroup"
                              value={holdType}
                              onChange={(nextValue) => {
                                   setHoldType(nextValue);
                                   setItem('');
                              }}
                              accessibilityLabel="">
                              <Radio value="default" size="sm" style={{ marginVertical: 4 }}>
                                   <RadioIndicator style={{ marginRight: 4 }}>
                                        <RadioIcon as={CircleIcon} strokeWidth={1} />
                                   </RadioIndicator>
                                   <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'first_available')}</RadioLabel>
                              </Radio>
                              <Radio value="item" size="sm" style={{ marginVertical: 4 }}>
                                   <RadioIndicator style={{ marginRight: 4 }}>
                                        <RadioIcon as={CircleIcon} strokeWidth={1} />
                                   </RadioIndicator>
                                   <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'specific_item')}</RadioLabel>
                              </Radio>
                         </RadioGroup>
                    </FormControl>
               ) : null}
               {holdTypeForFormat === 'item' || holdType === 'item' ? (
                    <FormControl>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'select_item')}</FormControlLabelText>
                         </FormControlLabel>
                         <Select name="itemForHold" selectedValue={defaultItem} minWidth={200} accessibilityLabel={getTermFromDictionary(language, 'select_item')} style={{ marginTop: 4, marginBottom: 8 }} onValueChange={(itemValue) => setItem(itemValue)}>
                              <SelectTrigger variant="outline" size="md">
                                   {_.map(Object.keys(copies), function (item, index, array) {
                                        let copy = copies[item];
                                        if (copy.id === defaultItem) {
                                             setItem(defaultItem);
                                             return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={copy.location} />;
                                        }
                                   })}
                                   <Icon as={ChevronDownIcon} style={{ marginRight: 12, color: textColor }} />
                              </SelectTrigger>
                              <SelectPortal useRNModal={true}>
                                   <SelectBackdrop />
                                   <SelectContent style={{ backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                        <SelectDragIndicatorWrapper>
                                             <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        <SelectScrollView>
                                             {_.map(Object.keys(copies), function (item, index, array) {
                                                  let copy = copies[item];
                                                  if (copy.id === defaultItem) {
                                                       return <SelectItem label={copy.location} value={copy.id} key={copy.id} style={{ backgroundColor: theme.tokens.colors.tertiary['300'] }} textStyle={{ color: theme.tokens.colors.tertiary['500-text'] }} />;
                                                  }
                                                  return <SelectItem label={copy.location} value={copy.id} key={copy.id} textStyle={{ color: textColor }} />;
                                             })}
                                        </SelectScrollView>
                                   </SelectContent>
                              </SelectPortal>
                         </Select>
                    </FormControl>
               ) : null}
          </>
     );
};
