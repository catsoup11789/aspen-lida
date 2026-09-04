import { MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView } from 'react-native';

import { SearchContext } from '../../../context/initialContext';
import {logDebugMessage} from "../../../util/logging";
import { useTheme } from '../../../themes/theme';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

// custom components and helper files

export const SearchIndexScreen = () => {
     const navigation = useNavigation();
     const {theme, textColor, colorMode } = useTheme();
     const { currentIndex, indexes, updateCurrentSource, updateIndexes, updateCurrentIndex } = React.useContext(SearchContext);

     logDebugMessage('currentIndex: ' + currentIndex);

     const search = async () => {
          // Dismiss modal so existing SearchResults screen refreshes with updated context/global state.
          navigation.getParent()?.goBack();
     };

     const updateIndex = async (index) => {
          updateCurrentIndex(index);
          await search();
     };

     return (
          <VStack style={{ paddingTop: 20, flex: 1 }}>
               <ScrollView>
                    <Box style={{ paddingHorizontal: 20 }}>
                         {_.map(indexes, function (obj, index, array) {
                              return (
                                   <Pressable key={index} style={{ padding: 2, paddingVertical: 8 }} onPress={() => updateIndex(index)}>
                                        {currentIndex === index ? (
                                            <HStack space="sm" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                                 <MaterialIcons name="radio-button-checked" size={20} color={theme.tokens.colors.primary['600']} />
                                                 <Text style={{ color: textColor, marginLeft: 8 }}>
                                                       {obj}
                                                  </Text>
                                             </HStack>
                                        ) : (
                                            <HStack space="sm" style={{ justifyContent: 'flex-start', alignItems: 'center' }}>
                                                 <MaterialIcons name="radio-button-unchecked" size={20} color={theme.tokens.colors.primary['200']} />
                                                 <Text style={{ color: textColor, marginLeft: 8 }}>
                                                       {obj}
                                                  </Text>
                                             </HStack>
                                        )}
                                   </Pressable>
                              );
                         })}
                    </Box>
               </ScrollView>
          </VStack>
     );
};
