import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import _ from 'lodash';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PermissionsPrompt } from '../../components/PermissionsPrompt';

// custom components and helper files
import { getTermFromDictionary } from '../../translations/TranslationService';
import { useKeyboard } from '../../hooks/hooks';

import { useTheme } from '../../themes/theme';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseIcon, Icon, InputIcon } from '@/components/ui/icon';
import { Image } from '@/components/ui/image';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalHeader } from '@/components/ui/modal';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export const SelectYourLibrary = (payload) => {
     const isKeyboardOpen = useKeyboard();
     const { theme, textColor, colorMode } = useTheme();
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const { isCommunity, showModal, setShowModal, updateSelectedLibrary, selectedLibrary, shouldRequestPermissions, libraries, allLibraries, setShouldRequestPermissions } = payload;
     const [query, setQuery] = React.useState('');
     const insets = useSafeAreaInsets();

     const updateStatus = async () => {};

     const clearSearch = () => {
          setQuery('');
     };

     function FilteredLibraries() {
          let haystack = libraries;

          if (!_.isEmpty(query) && query !== ' ') {
               haystack = allLibraries;

               if (!isCommunity) {
                    haystack = libraries;
               }
          }

          if (!isCommunity) {
               haystack = _.filter(haystack, function (branch) {
                    return branch.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
               });
               if (!_.isEmpty(query) && query !== ' ') {
                    return _.sortBy(haystack, ['name', 'librarySystem']);
               }else{
                    return haystack;
               }
          }

          return _.filter(haystack, function (branch) {
               return branch.name.toLowerCase().indexOf(query.toLowerCase()) > -1 || branch.librarySystem.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
     }

     const filteredLibraries = FilteredLibraries(libraries);

     if (libraries.length === 0 && allLibraries.length === 0)
     {
	     return <Center><Text>{getTermFromDictionary('en', 'error_no_library_connection')}</Text></Center>
     }

     if (shouldRequestPermissions && showModal) {
          return <PermissionsPrompt promptTitle="permissions_location_title" promptBody="permissions_location_body" setShouldRequestPermissions={setShouldRequestPermissions} updateStatus={updateStatus} />;
     }

     return (
          <Center>
               <Button onPress={() => setShowModal(true)} size="md" style={{ margin: 20, backgroundColor: theme.tokens.colors.primary['500'] }}>
                    <ButtonIcon as={MaterialIcons} name="place" style={{ marginRight: 4, color: theme.tokens.colors.primary['500-text'] }} />
                    <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{selectedLibrary?.name ? selectedLibrary.name : getTermFromDictionary('en', 'select_your_library')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} size="lg" avoidKeyboard onClose={() => setShowModal(false)}>
                    <ModalBackdrop />
                    <ModalContent
                         style={{
                              backgroundColor: surfaceBg,
                              height: filteredLibraries.length === 0 ? 'auto' : isKeyboardOpen ? '65%' : '80%',
                              maxHeight: filteredLibraries.length === 0 ? 400 : undefined,
                              marginTop: isKeyboardOpen ? insets.top + 16 : undefined,
                         }}
                    >
                         <ModalHeader style={{ borderBottomWidth: 1, borderBottomColor: borderColor }}>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary('en', 'find_your_library')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowModal(false); }}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Box style={{ backgroundColor: surfaceBg, padding: 8, paddingBottom: query ? 0 : 5 }}>
                                   <Input style={{ borderColor }}>
                                        <InputField
                                             size="lg"
                                             autoCorrect={false}
                                             placeholder={getTermFromDictionary('en', 'search')}
                                             value={query}
                                             onChangeText={(text) => setQuery(text)}
                                             style={{ color: textColor }}
                                        />
                                        {query ? <InputSlot onPress={() => clearSearch()}>
                                            <InputIcon as={MaterialCommunityIcons} name="close-circle" style={{ marginRight: 8, color: textColor }} />
                                        </InputSlot> : null}
                                   </Input>
                              </Box>
                              <VStack>
                                   {filteredLibraries.map((item, index) => (
                                        <Item
                                             key={index}
                                             data={item}
                                             isCommunity={isCommunity}
                                             setShowModal={setShowModal}
                                             updateSelectedLibrary={updateSelectedLibrary}
                                             textColor={textColor}
                                             colorMode={colorMode}
                                             theme={theme}
                                        />
                                   ))}
                              </VStack>
                         </ModalBody>
                    </ModalContent>
                </Modal>
          </Center>
     );
};

const Item = (data) => {
     const library = data.data;
     const libraryIcon = library.favicon;
     const { isCommunity, setShowModal, updateSelectedLibrary, textColor, colorMode, theme } = data;

     const handleSelect = () => {
          updateSelectedLibrary(library);
          setShowModal(false);
     };

     return (
          <Pressable style={{ borderBottomWidth: 1, borderBottomColor: colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark, paddingLeft: 16, paddingRight: 20, paddingVertical: 8 }} onPress={handleSelect}>
               <HStack space="lg" style={{ alignItems: 'center' }}>
                    {libraryIcon ? (
                         <Image
                              key={library.name}
                              source={{ uri: libraryIcon }}
                              fallbackSource={require('../../themes/default/aspenLogo.png')}
                              alt={library.name}
                              size="xs"
                              style={{ borderRadius: 999 }}
                         />
                    ) : (
                         <Box
                              size="xs"
                              style={{ borderRadius: 999 }}
                         />
                    )}
                    <VStack style={{ marginLeft: 12 }}>
                         <Text bold size="sm" style={{ color: textColor }}>
                              {library.name}
                         </Text>
                         {isCommunity ? (
                              <Text size="sm" style={{ color: textColor }}>
                                   {library.librarySystem}
                              </Text>
                         ) : null}
                    </VStack>
               </HStack>
          </Pressable>
     );
};
