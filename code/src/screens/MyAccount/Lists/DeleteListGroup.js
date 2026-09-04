import React from 'react';
import { useListGroups, useUpdateUserProfile, useUpdateListGroups, useUpdateLists } from '@/src/hooks/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { deleteListGroup, getLists, getListGroups } from '@/src/util/api/list';
import { refreshProfile } from '@/src/util/api/user';
import { popAlert } from '@/src/components/feedback';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon } from '@/src/components/themed/ThemedFormControls';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';

/**
 * DeleteListGroup component that allows users to delete a list group. It displays a button that opens a confirmation modal where users can confirm the deletion. The component handles API calls to delete the list group and provides feedback on the deletion process, including refreshing the user's profile and updating the list groups and lists in the local state.
 * @param param0
 * @param param0.id
 * @param param0.handleUpdate
 * @returns {React.JSX.Element}
 * @constructor
 */
export const DeleteListGroup = ({id, handleUpdate}) => {
      const updateUserProfile = useUpdateUserProfile();
      const { data: listGroups } = useListGroups();
      const updateLists = useUpdateLists();
      const updateListGroups = useUpdateListGroups();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, uiColors, colorMode, runtimeColors } = useTheme();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);
      const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="xs" style={{ backgroundColor: uiColors.danger }}>
                   <MaterialIcons name="delete" size={18} color={uiColors.white} style={{ marginRight: 4 }} />
                   <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'delete_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'delete_list_group')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'delete_list_group_confirmation')}</Text>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={toggle} style={{ borderColor: runtimeColors.primary[500] }}>
                                       <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                   </Button>
                                   <Button style={{ backgroundColor: uiColors.danger }}
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
                                        <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'delete')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}
