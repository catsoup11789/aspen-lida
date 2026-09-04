import React from 'react';

import { useUserState, useListGroups, useUpdateUserProfile, useUpdateListGroups, useUpdateLists } from '../../../hooks/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { deleteListGroup, getLists, getListGroups } from '../../../util/api/list';
import { refreshProfile } from '../../../util/api/user';
import { popAlert } from '../../../components/feedback';
import { navigateStack } from '../../../helpers/RootNavigator';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';

export const DeleteListGroup = ({id, handleUpdate}) => {
      const { data: userState } = useUserState();
      const updateUserProfile = useUpdateUserProfile();
      const { data: listGroups } = useListGroups();
      const updateLists = useUpdateLists();
      const updateListGroups = useUpdateListGroups();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, theme, colorMode } = useTheme();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);
      const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="xs" style={{ backgroundColor: theme.tokens.colors.ui.danger }}>
                   <ButtonIcon as={MaterialIcons} name="delete" style={{ color: theme.tokens.colors.ui.white, marginRight: 4 }} />
                   <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'delete_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'delete_list_group')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'delete_list_group_confirmation')}</Text>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={toggle} style={{ borderColor: theme.tokens.colors.primary['500'] }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                   </Button>
                                   <Button style={{ backgroundColor: theme.tokens.colors.ui.danger }}
                                           isLoading={loading}
                                           isLoadingText={getTermFromDictionary(language, 'deleting', true)}
                                            onPress={() => {
                                                 setLoading(true);
                                                 deleteListGroup(id, library.baseUrl).then(async (res) => {
                                                      // Refresh lists and list groups from API and update local database
                                                      const listsResponse = await getLists(library.baseUrl, 1, 20, 1);
                                                      if (listsResponse.ok) {
                                                           await updateLists(listsResponse.data.result);
                                                      }
                                                      const groupsResponse = await getListGroups(library.baseUrl);
                                                      if (groupsResponse.ok) {
                                                           await updateListGroups({
                                                                groups: groupsResponse.data?.result?.groups ?? [],
                                                                unassigned: groupsResponse.data?.result?.unassigned ?? 0 });
                                                      }
                                                      const profileResponse = await refreshProfile(library.baseUrl);
                                                      if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
                                                           await updateUserProfile(profileResponse.data.result.profile);
                                                      }
                                                      handleUpdate(listGroups.groups[0]?.id || -1);
                                                      setLoading(false);
                                                      let status = 'success';
                                                      setShowModal(false);
                                                      if (res.data.result.success === false) {
                                                           status = 'error';
                                                           popAlert(res.data.result.title, res.data.result.message, status);
                                                      } else {
                                                           popAlert(res.data.result.title, res.data.result.message, status);
                                                           navigateStack('AccountScreenTab', 'MyLists', {
                                                                libraryUrl: library.baseUrl,
                                                                hasPendingChanges: true });
                                                      }
                                                 });
                                            }}
                                   >
                                        <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'delete')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}
