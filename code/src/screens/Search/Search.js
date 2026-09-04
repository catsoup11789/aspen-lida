import { useNavigation } from '@react-navigation/native';
import _ from 'lodash';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { navigate } from '../../helpers/RootNavigator';
import { getTermFromDictionary } from '../../translations/TranslationService';

import { formatDiscoveryVersion } from '../../helpers/helpers';
import { getDefaultFacets } from '../../util/api/search';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FlatList } from '@/components/ui/flat-list';
import { FormControl } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { Text } from '@/components/ui/text';

export const SearchHome = () => {
     const navigation = useNavigation();
     const [searchTerm, setSearchTerm] = React.useState('');
     const language = useActiveLanguage();
     const library = useLibrary();
     const discoveryVersion = formatDiscoveryVersion(library.discoveryVersion) ?? '22.10.00';
     const quickSearchNum = _.size(library.quickSearches);

     React.useLayoutEffect(() => {
          navigation.setOptions({
               headerLeft: () => <Box />,
          });
     }, [navigation]);

     React.useEffect(() => {
          async function preloadDefaultFacets() {
               if (discoveryVersion >= '22.11.00') {
                    await getDefaultFacets(library.baseUrl, 5, language);
               }
          }

          preloadDefaultFacets();
     }, []);

     const clearText = () => {
          setSearchTerm('');
     };

     const search = async () => {
          navigate('SearchResults', { term: searchTerm, type: 'catalog', prevRoute: 'SearchHome' });
          clearText();
     };

     return (
          <SafeAreaView>
               <Box style={{ padding: 20 }}>
                    <FormControl>
                         <Input variant="filled" size="xl">
                              <InputField autoCapitalize="none" onChangeText={(term) => setSearchTerm(term)} placeholder={getTermFromDictionary(language, 'search')} clearButtonMode="always" onSubmitEditing={search} value={searchTerm} />
                         </Input>
                    </FormControl>
                    {quickSearchNum > 0 ? (
                         <Box>
                              <Center>
                                   <Text bold style={{ marginTop: 8, marginBottom: 2, fontSize: 20 }}>
                                        {getTermFromDictionary(language, 'quick_searches')}
                                   </Text>
                              </Center>
                              <FlatList data={_.sortBy(library.quickSearches, ['weight', 'label'])} keyExtractor={(item, index) => index.toString()} renderItem={({ item }) => <QuickSearch data={item} />} />
                         </Box>
                    ) : null}
               </Box>
          </SafeAreaView>
     );
};

const QuickSearch = (data) => {
     const quickSearch = data.data;
     return (
          <Button
               style={{ marginBottom: 12 }}
               onPress={() =>
                    navigate('SearchResults', {
                         term: quickSearch.searchTerm,
                    })
               }>
               <ButtonText>{quickSearch.label}</ButtonText>
          </Button>
     );
};
