import _ from 'lodash';
import React from 'react';
import { ScrollView } from 'react-native';

// custom components and helper files
import { LoadingSpinner } from '../../../components/loadingSpinner';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { addAppliedFilter } from '../../../util/api/searchHelper';
import { useTheme } from '../../../themes/theme';
import { Box } from '@/components/ui/box';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';


export const Facet_Slider = ({ data, category, updater, language }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [startValue, setStartValue] = React.useState('*');
     const [endValue, setEndValue] = React.useState('*');
     const { textColor, colorMode, theme } = useTheme();

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
                              <Input
                                   size="lg"
                                   style={{ flex: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray500 : theme.tokens.colors.ui.gray300 }}
                              >
                                   <InputField
                                        placeholder={getTermFromDictionary(language, 'from')}
                                        accessibilityLabel={getTermFromDictionary(language, 'from')}
                                        defaultValue={startValue}
                                        value={startValue}
                                        onChangeText={(value) => {
                                             updateValue('startValue', value);
                                        }}
                                       style={{ color: textColor }}
                                   />
                              </Input>
                              <Input
                                   size="lg"
                                   style={{ flex: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray500 : theme.tokens.colors.ui.gray300 }}
                              >
                                   <InputField
                                        placeholder={getTermFromDictionary(language, 'to')}
                                        accessibilityLabel={getTermFromDictionary(language, 'to')}
                                        defaultValue={endValue}
                                        value={endValue}
                                        onChangeText={(value) => {
                                             updateValue('endValue', value);
                                        }}
                                       style={{ color: textColor }}
                                   />
                              </Input>
                         </HStack>
                    </FormControl>
               </Box>
          </ScrollView>
     );
};
