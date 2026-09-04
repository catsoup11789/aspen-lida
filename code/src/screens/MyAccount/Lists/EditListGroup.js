import React from 'react';

import { useUserState } from '../../../hooks/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { editListGroup } from '../../../util/api/list';
import { navigateStack } from '../../../helpers/RootNavigator';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';

export const EditListGroup = ({currentTitle, id, handleUpdate}) => {
      const { data: userState } = useUserState();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, theme, colorMode } = useTheme();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);

      const [title, setTitle] = React.useState(currentTitle);
      const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
      const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="xs" style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                   <MaterialIcons name="edit" size={18} color={theme.tokens.colors.primary['500-text']} style={{ marginRight: 4 }} />
                   <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'rename_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'rename_list_group')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'rename_list_group_to')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Input style={{ borderColor }}><InputField id="title" defaultValue={currentTitle} autoComplete="off" onChangeText={(text) => setTitle(text)} style={{ color: textColor }}/></Input>
                              </FormControl>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={toggle} style={{ borderColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                    <Button style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                            isLoading={loading}
                                            isLoadingText={getTermFromDictionary(language, 'saving', true)}
                                            onPress={() => {
                                                 setLoading(true);
                                                 editListGroup(id, title, library.baseUrl).then(async (res) => {
                                                      setLoading(false);
                                                      setShowModal(false);
                                                      handleUpdate(id);
                                                      navigateStack('AccountScreenTab', 'MyLists', {
                                                           libraryUrl: library.baseUrl,
                                                           hasPendingChanges: true });
                                                 });
                                            }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'save')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}
