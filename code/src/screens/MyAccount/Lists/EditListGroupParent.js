import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListGroups, useUpdateLists, useUpdateListGroups } from '@/src/hooks/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { editListGroupParent, getLists, getListGroups } from '@/src/util/api/list';
import { popAlert } from '@/src/components/feedback';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { Platform } from 'react-native';
import { toArray } from '@/src/helpers/helpers';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon } from '@/src/components/themed/ThemedFormControls';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ThemedButtonGroup as ButtonGroup } from '@/src/components/themed/ThemedButton';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';

/**
 * EditListGroupParent component that allows users to edit the parent group of a list group. It provides a modal interface for selecting a new parent group from existing list groups and updates the backend accordingly.
 * @param param0
 * @param param0.id
 * @param param0.parentId
 * @param param0.handleUpdate
 * @returns {React.JSX.Element}
 * @constructor
 */
export const EditListGroupParent = ({id, parentId, handleUpdate}) => {
      const { data: listGroups } = useListGroups();
      const updateLists = useUpdateLists();
      const updateListGroups = useUpdateListGroups();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, uiColors, runtimeColors, colorMode } = useTheme();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);

      const [selectedGroup, setSelectedGroup] = React.useState(null);
      const [newListGroupParentId, setNewListGroupParentId] = React.useState(parentId); // default state is current list group parent id

      const insets = useSafeAreaInsets();
      const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;

      React.useEffect(() => {
           if (listGroups && listGroups.groups && parentId != null) {
                const found = toArray(listGroups.groups).find((item) => item.id === parentId) || null;
                setSelectedGroup(found);
           } else {
                setSelectedGroup(null);
           }
      }, [listGroups.groups, parentId]);

      const updateSelectedGroup = (groupId) => {
           const group = toArray(listGroups.groups).find((item) => item.id === groupId);
           setSelectedGroup(group);
           setNewListGroupParentId(groupId);
      }

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="xs" colorScheme="primary">
                   <MaterialIcons name="edit" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 4 }} />
                   <ButtonText>{getTermFromDictionary(language, 'move_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md">{getTermFromDictionary(language, 'move_list_group')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'move_list_group_to')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Select
                                        name="newListGroupParent"
                                        selectedValue={newListGroupParentId}
                                        accessibilityLabel={getTermFromDictionary(language, 'move_list_group_to')}
                                        onValueChange={(itemValue) => updateSelectedGroup(itemValue)}>
                                         <SelectTrigger variant="outline" size="md">
                                              {selectedGroup === null && parentId !== null ? (
                                                        toArray(listGroups.groups).map((group) => {
                                                             if (group.id === parentId) {
                                                                  return <SelectInput value={group.title} style={{ color: textColor }} />;
                                                             }
                                                        })
                                                   ) :
                                                   (selectedGroup === null && parentId === null ? (
                                                        <SelectInput style={{ color: textColor }} value={getTermFromDictionary(language, 'choose_existing_list_group')} />
                                                   ) : (
                                                        <SelectInput style={{ color: textColor }} value={selectedGroup.title} />
                                                   ))
                                              }
                                         </SelectTrigger>
                                        <SelectPortal>
                                             <SelectBackdrop />
                                             <SelectContent
                                                  style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}
                                             >
                                                  <SelectDragIndicatorWrapper>
                                                       <SelectDragIndicator />
                                                  </SelectDragIndicatorWrapper>
                                                   <SelectScrollView>
                                                        {toArray(listGroups.groups).map((item, index) => {
                                                             if(item.id === id || item.id === parentId || item.parentGroupId === id) {
                                                                  return null;
                                                             }
                                                             return <SelectItem key={index} value={item.id} label={item.title} selectedValue={newListGroupParentId} />;
                                                        })}
                                                   </SelectScrollView>
                                             </SelectContent>
                                        </SelectPortal>
                                   </Select>
                              </FormControl>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button colorScheme="primary" variant="outline" onPress={toggle}>
                                        <ButtonText>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                     <Button colorScheme="primary"
                                             isLoading={loading}
                                             isDisabled={selectedGroup === null}
                                             isLoadingText={getTermFromDictionary(language, 'saving', true)}
                                            onPress={() => {
                                                 setLoading(true);
                                                 editListGroupParent(id, newListGroupParentId, library.baseUrl).then(async (res) => {
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
                                                      setLoading(false);
                                                      let status = 'success';
                                                      setShowModal(false);
                                                      handleUpdate(id);
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
                                            }}>
                                         <ButtonText>{getTermFromDictionary(language, 'save')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}
