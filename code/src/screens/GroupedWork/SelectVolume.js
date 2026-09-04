import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { getVolumes } from '../../util/api/item';
import { loadingSpinner } from '../../components/loadingSpinner';
import { loadError } from '../../components/loadError';
import _ from 'lodash';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ChevronDownIcon, CircleIcon, Icon } from '@/components/ui/icon';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';

export const SelectVolume = (props) => {
     const { language, id, holdType, setHoldType, volume, setVolume, shouldLoad, promptForHoldType } = props;
     const library = useLibrary();

     const { status, data, error, isFetching } = useQuery({
          queryKey: ['volumes', id, library.baseUrl],
          queryFn: () => getVolumes(id, library.baseUrl),
          enabled: !!shouldLoad,
     });

     return (
          <>
               {status === 'loading' || isFetching ? (
                    loadingSpinner()
               ) : status === 'error' ? (
                    loadError('Error', '')
               ) : (
                    <>
                         {promptForHoldType ? (
                              <FormControl style={{ marginBottom: 16 }}>
                                   <RadioGroup
                                        value={holdType}
                                        onChange={(nextValue) => {
                                             setHoldType(nextValue);
                                        }}>
                                        <Radio value="item" size="sm" style={{ marginBottom: 8 }}>
                                             <RadioIndicator style={{ marginRight: 8 }}>
                                                  <RadioIcon as={CircleIcon} />
                                             </RadioIndicator>
                                             <RadioLabel>{getTermFromDictionary(language, 'first_available')}</RadioLabel>
                                        </Radio>
                                        <Radio value="volume" size="sm">
                                             <RadioIndicator style={{ marginRight: 8 }}>
                                                  <RadioIcon as={CircleIcon} />
                                             </RadioIndicator>
                                             <RadioLabel>{getTermFromDictionary(language, 'specific_volume')}</RadioLabel>
                                        </Radio>
                                   </RadioGroup>
                              </FormControl>
                         ) : null}
                         {holdType === 'volume' ? (
                              <FormControl>
                                   <FormControlLabel>
                                        <FormControlLabelText>{getTermFromDictionary(language, 'select_volume')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Select
                                        selectedValue={volume}
                                        onValueChange={(itemValue) => setVolume(itemValue)}>
                                        <SelectTrigger variant="outline" size="md">
                                             <SelectInput style={{ paddingVertical: 0 }} placeholder={getTermFromDictionary(language, 'select_volume')} />
                                             <Icon as={ChevronDownIcon} style={{ marginRight: 12 }} />
                                        </SelectTrigger>
                                        <SelectPortal>
                                             <SelectBackdrop />
                                             <SelectContent>
                                                  <SelectDragIndicatorWrapper>
                                                       <SelectDragIndicator />
                                                  </SelectDragIndicatorWrapper>
                                                  {_.map(data, function (item, index, array) {
                                                       return <SelectItem label={item.label} value={item.volumeId} key={index} />;
                                                  })}
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
