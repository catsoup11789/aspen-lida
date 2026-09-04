import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getVolumes } from '@/src/util/api/item';
import { loadingSpinner } from '../../loadingSpinner';
import { loadError } from '../../loadError';
import _ from 'lodash';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { CircleIcon } from '@/components/ui/icon';
import { ThemedRadio as Radio, ThemedRadioGroup as RadioGroup, ThemedRadioIcon as RadioIcon, ThemedRadioIndicator as RadioIndicator, ThemedRadioLabel as RadioLabel } from '../../themed/ThemedRadio';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../themed/ThemedSelect';

/**
 * SelectVolume component for selecting a volume for a library hold request.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const SelectVolume = (props) => {
     const { id, volume, setVolume, showModal, promptForHoldType, holdType, setHoldType, language, url, textColor, uiColors, colorMode, runtimeColors } = props;
     const insets = useSafeAreaInsets();

     const { status, data, error, isFetching } = useQuery({
          queryKey: ['volumes', id, url],
          queryFn: () => getVolumes(id, url),
          enabled: !!showModal,
     });

     if (!isFetching && data && _.isEmpty(volume)) {
          let volumesKeys = Object.keys(data);
          let key = volumesKeys[0];
          setVolume(data[key].volumeId);
     }

     return (
          <>
               {status === 'loading' || isFetching ? (
                    loadingSpinner()
               ) : status === 'error' ? (
                    loadError('Error', '')
               ) : (
                    <>
                         {promptForHoldType ? (
                              <FormControl>
                                   <RadioGroup
                                        name="holdTypeGroup"
                                        defaultValue={holdType}
                                        value={holdType}
                                        onChange={(nextValue) => {
                                             setHoldType(nextValue);
                                             setVolume('');
                                        }}>
                                        <Radio value="item" size="sm" style={{ marginVertical: 4 }}>
                                             <RadioIndicator style={{ marginRight: 4 }}>
                                                  <RadioIcon as={CircleIcon} strokeWidth={1} />
                                             </RadioIndicator>
                                             <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'first_available')}</RadioLabel>
                                        </Radio>
                                        <Radio value="volume" size="sm" style={{ marginVertical: 4 }}>
                                             <RadioIndicator style={{ marginRight: 4 }}>
                                                  <RadioIcon as={CircleIcon} strokeWidth={1} />
                                             </RadioIndicator>
                                             <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'specific_volume')}</RadioLabel>
                                        </Radio>
                                   </RadioGroup>
                              </FormControl>
                         ) : null}
                         {holdType === 'volume' ? (
                              <FormControl>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'select_volume')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Select name="volumeForHold" selectedValue={volume} defaultValue={volume} minWidth="200" accessibilityLabel={getTermFromDictionary(language, 'select_volume')} style={{ marginTop: 4, marginBottom: 8 }} onValueChange={(itemValue) => setVolume(itemValue)}>
                                        <SelectTrigger variant="outline" size="md">
                                             {_.map(data, function (item, index, array) {
                                                  if (item.volumeId === volume) {
                                                       return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={item.label} />;
                                                  }
                                             })}
                                        </SelectTrigger>
                                        <SelectPortal useRNModal={true}>
                                             <SelectBackdrop />
                                             <SelectContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                 <SelectDragIndicatorWrapper>
                                                      <SelectDragIndicator />
                                                 </SelectDragIndicatorWrapper>
                                                 <SelectScrollView>
                                                      {_.map(data, function (item, index, array) {
                                                           if (item.volumeId === volume) {
                                                                return <SelectItem label={item.label} value={item.volumeId} key={index} style={{ backgroundColor: runtimeColors.tertiary[300] }} textStyle={{ color: runtimeColors.tertiary['500-text'] }} />;
                                                            }
                                                            return <SelectItem label={item.label} value={item.volumeId} key={index} textStyle={{ color: textColor }} />;
                                                       })}
                                                 </SelectScrollView>
                                            </SelectContent>
                                        </SelectPortal>
                                   </Select>
                              </FormControl>
                         ) : null}
                    </>
               )}
          </>
     );
};
