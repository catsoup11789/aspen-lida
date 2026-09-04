import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { SearchGlobal } from '../../../util/globals';
import { logDebugMessage } from '../../../util/logging';
import { addAppliedFilter, removeAppliedFilter } from '../../../util/api/searchHelper';
import { useTheme } from '../../../themes/theme';


export const Facet_RadioGroup = ({ title, data, category, updater, applied }) => {
     const [value, setValue] = React.useState('');
     const {theme, textColor } = useTheme();

     React.useEffect(() => {
          const facets = data;
          if (_.isObject(facets)) {
               const facet = _.filter(facets, 'isApplied');
               if (!_.isEmpty(facet)) {
                    setValue(facet[0]['value'] ?? '');
               }
          }
     }, [data]);

     React.useEffect(() => {
          if (value !== applied) {
               logDebugMessage('prevValue', value);
               logDebugMessage('applied', applied);
          }
     }, [applied, value]);

     const updateValue = (payload) => {
          if (category !== 'sort_by') {
               logDebugMessage('payload > ', payload);
               logDebugMessage('value > ', value);
               if (payload === value) {
                    logDebugMessage('new is same as old. removing.');
                    removeAppliedFilter(category, payload);
                    setValue('');
               } else {
                    logDebugMessage('new value. adding.');
                    addAppliedFilter(category, payload, false);
                    setValue(payload);
               }
               logDebugMessage('current state value: ' + value);
          } else {
               logDebugMessage('sort payload > ', payload);
               logDebugMessage('sort value > ', value);
               if (payload === value) {
                    setValue('relevance');
               } else {
                    setValue(payload);
                    SearchGlobal.sortMethod = payload;
               }
               addAppliedFilter(category, payload, false);
          }
          updater(category, payload);
     };

     logDebugMessage(data);

     if (category === 'sort_by') {
          return (
               <VStack space="sm">
                    {data.map((facet, index) => (
                         <Pressable key={index} onPress={() => updateValue(facet.value)} style={{ paddingVertical: 8, paddingHorizontal: 2 }}>
                              {value === facet.value ? (
                                   <HStack space="sm" justifyContent="flex-start" alignItems="center">
                                        <Icon as={MaterialIcons} name="radio-button-checked" size="lg" style={{ color: theme.tokens.colors.primary['600'] }} />
                                        <Text style={{ color: textColor, marginLeft: 8 }}>
                                             {facet.display}
                                        </Text>
                                   </HStack>
                              ) : (
                                   <HStack space="sm" justifyContent="flex-start" alignItems="center">
                                        <Icon as={MaterialIcons} name="radio-button-unchecked" size="lg" style={{ color: theme.tokens.colors.primary['200'] }} />
                                        <Text style={{ color: textColor, marginLeft: 8 }}>
                                             {facet.display}
                                        </Text>
                                   </HStack>
                              )}
                         </Pressable>
                    ))}
               </VStack>
          );
     }

     return (
          <VStack space="sm">
               {data.map((facet, index) => (
                    <Pressable key={index} onPress={() => updateValue(facet.value)} style={{ paddingVertical: 8, paddingHorizontal: 2 }}>
                         {value === facet.value ? (
                              <HStack space="sm" justifyContent="flex-start" alignItems="center">
                                   <Icon as={MaterialIcons} name="radio-button-checked" size="lg" style={{ color: theme.tokens.colors.primary['600'] }} />
                                   <Text style={{ color: textColor, marginLeft: 8 }}>
                                        {facet.display} ({facet.count})
                                   </Text>
                              </HStack>
                         ) : (
                              <HStack space="sm" justifyContent="flex-start" alignItems="center">
                                   <Icon as={MaterialIcons} name="radio-button-unchecked" size="lg" style={{ color: theme.tokens.colors.primary['200'] }} />
                                   <Text style={{ color: textColor, marginLeft: 8 }}>
                                        {facet.display} ({facet.count})
                                   </Text>
                              </HStack>
                         )}
                    </Pressable>
               ))}
          </VStack>
     );
};
