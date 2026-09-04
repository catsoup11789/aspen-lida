import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { ScrollView } from 'react-native';
import Stars from 'react-native-stars';

// custom components and helper files
import { LoadingSpinner } from '../../../components/loadingSpinner';
import { addAppliedFilter, removeAppliedFilter } from '../../../util/api/searchHelper';
import { useTheme } from '../../../themes/theme';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';


export const Facet_Rating = ({ data, category, updater }) => {
     const [isLoading, setIsLoading] = React.useState(true);
     const [value, setValue] = React.useState('');
     const [stars] = React.useState([
          {
               label: 'fiveStar',
               value: '5' },
          {
               label: 'fourStar',
               value: '4' },
          {
               label: 'threeStar',
               value: '3' },
          {
               label: 'twoStar',
               value: '2' },
          {
               label: 'oneStar',
               value: '1' },
          {
               label: 'Unrated',
               value: '0' },
     ]);
     const {theme, textColor, colorMode } = useTheme();

     React.useEffect(() => {
          setIsLoading(false);
          let initialValue = '';
          if (_.find(data, ['isApplied', true])) {
               const appliedFilterObj = _.find(data, ['isApplied', true]);
               initialValue = appliedFilterObj['value'];
          }
          setValue(initialValue);
     }, [data]);

     const getRatingCount = (star) => {
          let results = 0;
          if (_.find(data, ['value', star])) {
               results = _.find(data, ['value', star]);
               results = results['count'];
          }
          return results;
     };

     const updateSearch = (star) => {
          if (star === value) {
               removeAppliedFilter(category, star);
               setValue('');
          } else {
               addAppliedFilter(category, star, false);
               setValue(star);
          }
          updater(category, star);
     };

     if (isLoading) {
          return <LoadingSpinner />;
     }

     return (
          <ScrollView>
               <VStack space="sm">
                    {stars.map((star, index) => (
                        <Pressable key={index} onPress={() => updateSearch(star.label)} style={{ padding: 2, paddingVertical: 8 }}>
                             <HStack space="sm" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                   {value === star.label ?
                                       <MaterialIcons name="radio-button-checked" size={20} color={theme.tokens.colors.primary['600']} /> :
                                       <MaterialIcons name="radio-button-unchecked" size={20} color={theme.tokens.colors.primary['200']} />
                                   }
                                   <Stars
                                        default={star.value}
                                        count={5}
                                        starSize={50}
                                        disabled
                                       fullStar={<MaterialIcons name="star" size={20} color={theme.tokens.colors.yellow['500']} />}
                                       emptyStar={<MaterialIcons name="star-border" size={20} color={theme.tokens.colors.yellow['500']} />}
                                   />
                                   <Text
                                       style={{ color: textColor, marginLeft: 8 }}
                                   >
                                       ({getRatingCount(star.label)})
                                   </Text>
                              </HStack>
                         </Pressable>
                    ))}
               </VStack>
          </ScrollView>
     );
};
