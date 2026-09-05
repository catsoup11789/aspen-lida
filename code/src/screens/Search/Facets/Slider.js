import _ from 'lodash';
import React from 'react';
import { ThemedScrollView as ScrollView } from '@/src/components/themed/ThemedScrollView';
import { LoadingSpinner } from '@/src/components/loadingSpinner';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { addAppliedFilter } from '@/src/util/api/searchHelper';
import { Box } from '@/components/ui/box';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';

/**
 * Facet_Slider component that renders a slider input for filtering search results based on a numeric range facet. It manages the start and end values of the range, updates the applied filters, and triggers an update to the parent component when the values change.
 * @param param0
 * @param param0.data
 * @param param0.category
 * @param param0.updater
 * @param param0.language
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Facet_Slider = ({ data, category, updater, language }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [startValue, setStartValue] = React.useState('*');
     const [endValue, setEndValue] = React.useState('*');

     React.useEffect(() => {
          appliedStartValue();
          appliedEndValue();
          setIsLoading(false);
     }, []);

     const updateValue = (type, value) => {
          if (type === 'startValue') {
               setStartValue(value);
          } else {
               setEndValue(value);
          }
          updateFacet(type === 'startValue' ? value : startValue, type === 'endValue' ? value : endValue);
     };

     const updateFacet = (start = startValue, end = endValue) => {
          let value = '[' + start + '+TO+' + end + ']';
          if (!start && end) {
               value = '[*+TO+' + end + ']';
          } else if (start && !end) {
               value = '[' + start + '+TO+*]';
          } else if (!start && !end) {
               value = '[*+TO+*]';
          }
          addAppliedFilter(category, value, false);
          updater(category, value);
     };

     const appliedStartValue = () => {
          let value = 0.0;
          if (_.find(data, ['isApplied', true])) {
               const appliedFilterObj = _.find(data, ['isApplied', true]);
               value = appliedFilterObj['value'];
          }
          setStartValue(value);
     };

     const appliedEndValue = () => {
          let value = 5.0;
          if (_.find(data, ['isApplied', true])) {
               const appliedFilterObj = _.find(data, ['isApplied', true]);
               value = appliedFilterObj['value'];
          }
          setEndValue(value);
     };

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <ScrollView>
               <Box style={{ padding: 20 }}>
                    <FormControl style={{ marginBottom: 8 }}>
                         <HStack space="sm" style={{ justifyContent: 'center' }}>
                              <ThemedInput
                                   size="lg"
                                   style={{ flex: 1 }}
                              >
                                   <ThemedInputField
                                        placeholder={getTermFromDictionary(language, 'from')}
                                        accessibilityLabel={getTermFromDictionary(language, 'from')}
                                        defaultValue={startValue}
                                        value={startValue}
                                        onChangeText={(value) => {
                                             updateValue('startValue', value);
                                        }}
                                   />
                              </ThemedInput>
                              <ThemedInput
                                   size="lg"
                                   style={{ flex: 1 }}
                              >
                                   <ThemedInputField
                                        placeholder={getTermFromDictionary(language, 'to')}
                                        accessibilityLabel={getTermFromDictionary(language, 'to')}
                                        defaultValue={endValue}
                                        value={endValue}
                                        onChangeText={(value) => {
                                             updateValue('endValue', value);
                                        }}
                                   />
                              </ThemedInput>
                         </HStack>
                    </FormControl>
               </Box>
          </ScrollView>
     );
};
