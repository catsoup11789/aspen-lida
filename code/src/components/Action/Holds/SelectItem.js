import React from 'react';
import _ from 'lodash';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { FormControlLabel } from '@/components/ui/form-control';
import { ThemedFormControl as FormControl, ThemedFormControlLabelText as FormControlLabelText } from '../../themed/ThemedFormControls';
import { CircleIcon } from '@/components/ui/icon';
import { ThemedRadio as Radio, ThemedRadioGroup as RadioGroup, ThemedRadioIcon as RadioIcon, ThemedRadioIndicator as RadioIndicator, ThemedRadioLabel as RadioLabel } from '../../themed/ThemedRadio';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../themed/ThemedSelect';

/**
 * SelectItemHold component for selecting a hold type and item for a library hold request.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const SelectItemHold = (props) => {
     const { id, data, item, setItem, setHoldType, showModal, holdTypeForFormat, language, url, textColor, runtimeColors } = props;

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
                                   <RadioLabel>{getTermFromDictionary(language, 'first_available')}</RadioLabel>
                              </Radio>
                              <Radio value="item" size="sm" style={{ marginVertical: 4 }}>
                                   <RadioIndicator style={{ marginRight: 4 }}>
                                        <RadioIcon as={CircleIcon} strokeWidth={1} />
                                   </RadioIndicator>
                                   <RadioLabel>{getTermFromDictionary(language, 'specific_item')}</RadioLabel>
                              </Radio>
                         </RadioGroup>
                    </FormControl>
               ) : null}
               {holdTypeForFormat === 'item' || holdType === 'item' ? (
                    <FormControl>
                         <FormControlLabel>
                              <FormControlLabelText>{getTermFromDictionary(language, 'select_item')}</FormControlLabelText>
                         </FormControlLabel>
                         <Select name="itemForHold" selectedValue={defaultItem} minWidth={200} accessibilityLabel={getTermFromDictionary(language, 'select_item')} style={{ marginTop: 4, marginBottom: 8 }} onValueChange={(itemValue) => setItem(itemValue)}>
                              <SelectTrigger>
                                   {_.map(Object.keys(copies), function (item, index, array) {
                                        let copy = copies[item];
                                        if (copy.id === defaultItem) {
                                             setItem(defaultItem);
                                             return <SelectInput value={copy.location} />;
                                        }
                                   })}
                              </SelectTrigger>
                              <SelectPortal useRNModal={true}>
                                   <SelectBackdrop />
                                   <SelectContent>
                                        <SelectDragIndicatorWrapper>
                                             <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        <SelectScrollView>
                                             {_.map(Object.keys(copies), function (item, index, array) {
                                                  let copy = copies[item];
                                                  if (copy.id === defaultItem) {
                                                       return <SelectItem label={copy.location} value={copy.id} key={copy.id} style={{ backgroundColor: runtimeColors.tertiary[300] }} textStyle={{ color: runtimeColors.tertiary['500-text'] }} />;
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
