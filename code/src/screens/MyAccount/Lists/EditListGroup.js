import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { editListGroup } from '@/src/util/api/list';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';

/**
 * EditListGroup component that allows users to edit the title of a list group. It displays a button that opens a modal where users can input a new title and save the changes. The component handles API calls to update the list group title and provides feedback on the saving process.
 * @param param0
 * @param param0.currentTitle
 * @param param0.id
 * @param param0.handleUpdate
 * @returns {React.JSX.Element}
 * @constructor
 */
export const EditListGroup = ({currentTitle, id, handleUpdate}) => {
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, uiColors, runtimeColors, colorMode } = useTheme();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);

      const [title, setTitle] = React.useState(currentTitle);
      const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
      const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="xs" style={{ backgroundColor: runtimeColors.primary[500] }}>
                   <MaterialIcons name="edit" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 4 }} />
                   <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'rename_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'rename_list_group')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'rename_list_group_to')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <ThemedInput style={{ borderColor }}><ThemedInputField id="title" defaultValue={currentTitle} autoComplete="off" onChangeText={(text) => setTitle(text)} /></ThemedInput>
                              </FormControl>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={toggle} style={{ borderColor: runtimeColors.primary[500] }}>
                                        <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                    <Button style={{ backgroundColor: runtimeColors.primary[500] }}
                                            isLoading={loading}
                                            isLoadingText={getTermFromDictionary(language, 'saving', true)}
                                            onPress={() => {
                                                 setLoading(true);
                                                 editListGroup(id, title, library.baseUrl).then(async () => {
                                                      setLoading(false);
                                                      setShowModal(false);
                                                      handleUpdate(id);
                                                      navigateStack('AccountScreenTab', 'MyLists', {
                                                           libraryUrl: library.baseUrl,
                                                           hasPendingChanges: true });
                                                 });
                                            }}>
                                        <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'save')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}
