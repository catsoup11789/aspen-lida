import _ from 'lodash';
import moment from 'moment';
import React from 'react';
import { ScrollView } from 'react-native';

// custom components and helper files
import { LoadingSpinner } from '../../../components/loadingSpinner';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { addAppliedFilter } from '../../../util/api/searchHelper';
import { useTheme } from '../../../themes/theme';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { FormControl } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';


export const Facet_Year = ({ data, category, updater, language }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [yearFrom, setYearFrom] = React.useState('');
     const [yearTo, setYearTo] = React.useState('');
     const [value, setValue] = React.useState('');
     const { theme, textColor, colorMode } = useTheme();

     React.useEffect(() => {
          setIsLoading(false);
     }, []);

     const _updateYearTo = (jump) => {
          const jumpTo = moment().subtract(jump, 'years');
          const year = moment(jumpTo).format('YYYY');
          setYearFrom(year);
          setYearTo('*');
          const years = '[' + year + '+TO+*]';
          setValue(years);
          addAppliedFilter(category, years, false);
          updater(category, years);
     };

     const updateValue = (type, newValue) => {
          if (type === 'yearFrom') {
               setYearFrom(newValue);
          } else {
               setYearTo(newValue);
          }

          if (_.size(newValue) === 4) {
               updateFacet(type === 'yearFrom' ? newValue : yearFrom, type === 'yearTo' ? newValue : yearTo);
          }
     };

     const updateFacet = (from = yearFrom, to = yearTo) => {
          let fromValue = from;
          let toValue = to;
          if (_.isEmpty(from)) {
               fromValue = '*';
          }
          if (_.isEmpty(to)) {
               toValue = '*';
          }
          const years = '[' + fromValue + '+TO+' + toValue + ']';
          addAppliedFilter(category, years, false);
          updater(category, years);
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
                                        style={{ color: textColor }}
                                        placeholder={getTermFromDictionary(language, 'year_from')}
                                        accessibilityLabel={getTermFromDictionary(language, 'year_from')}
                                        value={yearFrom}
                                        onChangeText={(value) => {
                                             updateValue('yearFrom', value);
                                        }}
                                   />
                              </Input>
                              <Input
                                   size="lg"
                                   style={{ flex: 1, borderColor: colorMode === 'light' ? theme.tokens.colors.ui.gray500 : theme.tokens.colors.ui.gray300 }}
                              >
                                   <InputField
                                        style={{ color: textColor }}
                                        placeholder={getTermFromDictionary(language, 'year_to')}
                                        accessibilityLabel={getTermFromDictionary(language, 'year_to')}
                                        onChangeText={(value) => {
                                             updateValue('yearTo', value);
                                        }}
                                   />
                              </Input>
                         </HStack>
                    </FormControl>
                    {category === 'publishDate' || category === 'publishDateSort' ? (
                         <VStack space="sm">
                              <Text style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'published_in_the_last')}
                              </Text>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={() => _updateYearTo(1)} style={{ borderColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>{getTermFromDictionary(language, 'year')}</ButtonText>
                                   </Button>
                                   <Button variant="outline" onPress={() => _updateYearTo(5)} style={{ borderColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>5 {getTermFromDictionary(language, 'years')}</ButtonText>
                                   </Button>
                                   <Button variant="outline" onPress={() => _updateYearTo(10)} style={{ borderColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>10 {getTermFromDictionary(language, 'years')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </VStack>
                    ) : null}
               </Box>
          </ScrollView>
     );
};
