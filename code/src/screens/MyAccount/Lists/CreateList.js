import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { popAlert } from '@/src/components/feedback';
import { useUserState, useListGroups, useUpdateUserProfile, useUpdateLists, useUpdateListGroups } from '@/src/hooks/useUserData';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { createList, getLists, getListGroups } from '@/src/util/api/list';
import { refreshProfile } from '@/src/util/api/user';
import { Platform } from 'react-native';
import {logDebugMessage, logErrorMessage} from '@/src/util/logging';
import { toArray } from '@/src/helpers/helpers';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CircleIcon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../../components/themed/ThemedSelect';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

/**
 * CreateList component that allows users to create a new list. It displays a button that opens a modal where users can input the title, description, access level, and optionally add the list to a new or existing list group. The component handles API calls to create the list and provides feedback on the creation process, including refreshing the user's profile and updating the lists and list groups in the local state.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
const CreateList = (props) => {
      const { setLoading } = props;
      const { data: userState } = useUserState();
      const user = userState?.user ?? {};
      const updateUserProfile = useUpdateUserProfile();
      const { data: listGroups } = useListGroups();
      const updateLists = useUpdateLists();
      const updateListGroups = useUpdateListGroups();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, uiColors, runtimeColors, colorMode } = useTheme();
      const [loading, setAdding] = React.useState(false);
      const [showModal, setShowModal] = useState(false);

     const [title, setTitle] = React.useState('');
     const [description, setDescription] = React.useState('');
     const [isPublic, setPublic] = React.useState("false");
     const [addToGroup, setAddToGroup] = React.useState('no');
     const [groupName, setGroupName] = React.useState('');
     const [newGroupName, setNewGroupName] = React.useState('');
     const [nestedGroup, setNestedGroup] = React.useState('');
     const [existingGroupId, setExistingGroupId] = React.useState(user.lastListGroupAdded ? user.lastListGroupAdded : (listGroups?.groups[0] ? listGroups.groups[0].id : 0));
     const insets = useSafeAreaInsets();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

     let hasListGroups = false;
     if(user.numListGroups) {
          hasListGroups = user.numListGroups > 0;
     }

     const toggle = () => {
          setShowModal(!showModal);
          setTitle('');
          setDescription('');
          setPublic("false");
          setAdding(false);
          setAddToGroup('no')
          setGroupName('');
          setNewGroupName('');
          setNestedGroup('');
          setExistingGroupId(user.lastListGroupAdded ? user.lastListGroupAdded : (listGroups?.groups[0] ? listGroups.groups[0].id : 0));
     };

     return (
          <Center>
               <Button onPress={toggle} size="sm" style={{ backgroundColor: runtimeColors.primary[500] }}>
                   <MaterialIcons name="add" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 4 }} />
                   <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_new_list')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'create_new_list')}
                              </Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'title')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <ThemedInput style={{ borderColor }}>
                                        <ThemedInputField id="title" onChangeText={(text) => setTitle(text)} returnKeyType="next" defaultValue={title} />
                                   </ThemedInput>
                              </FormControl>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'description')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Textarea id="description" onChangeText={(text) => setDescription(text)} defaultValue={description} returnKeyType="next" style={{ borderColor }}>
                                        <TextareaInput style={{ color: textColor }} />
                                   </Textarea>
                              </FormControl>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'access')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <RadioGroup
                                        name="access"
                                        value={isPublic}
                                        onChange={(nextValue) => {
                                             setPublic(nextValue);
                                        }}>
                                       <HStack style={{ flexDirection: 'row', alignItems: 'center', width: '75%', maxWidth: 300 }} space="md">
                                            <Radio value="false" style={{ marginVertical: 4 }}>
                                                 <RadioIndicator style={{ marginRight: 8, borderColor }}>
                                                      <RadioIcon as={CircleIcon} style={{ color: borderColor }} />
                                                  </RadioIndicator>
                                                 <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'private')}</RadioLabel>
                                             </Radio>
                                            <Radio value="true" style={{ marginVertical: 4 }}>
                                                 <RadioIndicator style={{ marginRight: 8, borderColor }}>
                                                      <RadioIcon as={CircleIcon} style={{ color: borderColor }} />
                                                  </RadioIndicator>
                                                 <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'public')}</RadioLabel>
                                             </Radio>
                                        </HStack>
                                   </RadioGroup>
                              </FormControl>
                              <FormControl style={{ paddingBottom: 12 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'should_add_to_list_group')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Select name="should_add_to_list_group" selectedValue={addToGroup} accessibilityLabel={getTermFromDictionary(language, 'should_add_to_list_group')} onValueChange={(itemValue) => setAddToGroup(itemValue)}>
                                        <SelectTrigger variant="outline" size="md">
                                             {addToGroup !== '' ? <SelectInput style={{ paddingVertical: 0, color: textColor }} value={addToGroup === 'new' ? getTermFromDictionary(language, 'add_to_list_group_new') : addToGroup === 'existing' ? getTermFromDictionary(language, 'add_to_list_group_existing') : getTermFromDictionary(language, 'add_to_list_group_no')} /> : <SelectInput value={getTermFromDictionary(language, 'add_to_list_group_no')} style={{ color: textColor }} />}
                                        </SelectTrigger>
                                        <SelectPortal>
                                             <SelectBackdrop />
                                             <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                  <SelectDragIndicatorWrapper>
                                                       <SelectDragIndicator />
                                                  </SelectDragIndicatorWrapper>
                                                  <SelectScrollView>
                                                       <SelectItem label={getTermFromDictionary(language, 'add_to_list_group_no')} value="no" key={1} selectedValue={addToGroup} />
                                                       <SelectItem label={getTermFromDictionary(language, 'add_to_list_group_new')} value="new" key={2} selectedValue={addToGroup} />
                                                       {hasListGroups && <SelectItem label={getTermFromDictionary(language, 'add_to_list_group_existing')} value="existing" key={3} selectedValue={addToGroup} />}
                                                  </SelectScrollView>
                                             </SelectContent>
                                        </SelectPortal>
                                   </Select>
                              </FormControl>
                              {addToGroup === 'new' && (
                                   <>
                                        <FormControl style={{ paddingBottom: 8 }}>
                                             <FormControlLabel>
                                                  <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'new_list_group_name')}</FormControlLabelText>
                                             </FormControlLabel>
                                             <ThemedInput style={{ borderColor }}>
                                                  <ThemedInputField id="newGroupName" onChangeText={(text) => setNewGroupName(text)} defaultValue={newGroupName} />
                                             </ThemedInput>
                                        </FormControl>
                                        {hasListGroups && (
                                             <FormControl style={{ paddingBottom: 8 }}>
                                                  <FormControlLabel>
                                                       <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'should_nest_list_group')}</FormControlLabelText>
                                                  </FormControlLabel>
                                                  <Select name="should_nest_list_group" selectedValue={nestedGroup} accessibilityLabel={getTermFromDictionary(language, 'should_nest_list_group')} onValueChange={(itemValue) => setNestedGroup(itemValue)}>
                                                       <SelectTrigger variant="outline" size="md">
                                                   {nestedGroup !== 'no' && nestedGroup !== '' ? (
                                                        toArray(listGroups.groups).map((group) => {
                                                             if (group.id === nestedGroup) {
                                                                  return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                             }
                                                        })
                                                   ) : (
                                                        <SelectInput style={{ paddingVertical: 0, color: textColor }} value={getTermFromDictionary(language, 'nest_within_group_no')} />
                                                   )}
                                                       </SelectTrigger>
                                                       <SelectPortal>
                                                            <SelectBackdrop />
                                                            <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                                 <SelectDragIndicatorWrapper>
                                                                      <SelectDragIndicator />
                                                                 </SelectDragIndicatorWrapper>
                                                                  <SelectScrollView>
                                                                       <SelectItem label={getTermFromDictionary(language, 'nest_within_group_no')} value="no" key={1} selectedValue={nestedGroup} />
                                                                       {toArray(listGroups.groups).map((item, index) => {
                                                                            return <SelectItem key={index} value={item.id} label={item.title} selectedValue={nestedGroup} />;
                                                                       })}
                                                                  </SelectScrollView>
                                                            </SelectContent>
                                                       </SelectPortal>
                                                  </Select>
                                             </FormControl>
                                        )}
                                   </>
                              )}
                              {addToGroup === 'existing' && hasListGroups && (
                                   <FormControl style={{ paddingBottom: 20 }}>
                                        <FormControlLabel>
                                             <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'choose_existing_list_group')}</FormControlLabelText>
                                        </FormControlLabel>
                                        <Select
                                             selectedValue={existingGroupId}
                                             defaultValue={existingGroupId}
                                             onValueChange={(itemValue) => {
                                                  setExistingGroupId(itemValue);
                                                  setNestedGroup(itemValue);
                                                  logDebugMessage(itemValue);
                                             }}>
                                             <SelectTrigger variant="outline" size="md">
                                                   {existingGroupId && existingGroupId !== -1 ? (
                                                        toArray(listGroups.groups).map((group) => {
                                                             if (group.id === existingGroupId) {
                                                                  return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                             }
                                                        })
                                                   ) : (
                                                        <SelectInput style={{ paddingVertical: 0, color: textColor }} value={listGroups.groups[0].id} />
                                                   )}
                                             </SelectTrigger>
                                             <SelectPortal>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                        <SelectDragIndicatorWrapper>
                                                             <SelectDragIndicator />
                                                        </SelectDragIndicatorWrapper>
                                                         <SelectScrollView>
                                                              {toArray(listGroups.groups).map((item, index) => {
                                                                   return <SelectItem key={index} value={item.id} label={item.title} selectedValue={existingGroupId} />;
                                                              })}
                                                         </SelectScrollView>
                                                   </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                   </FormControl>
                              )}
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={toggle} style={{ borderColor }}>
                                        <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                    <Button
                                         style={{ backgroundColor: runtimeColors.primary[500] }}
                                         isLoading={loading}
                                         isLoadingText={getTermFromDictionary(language, 'creating_list', true)}
                                         onPress={async () => {
                                              setAdding(true);
                                              setLoading(true);
                                              try {
                                                   await createList(title, description, isPublic, library.baseUrl, addToGroup, nestedGroup, newGroupName, existingGroupId).then(async (res) => {
                                                        let status = 'success';
                                                        if (!res.success) {
                                                             status = 'danger';
                                                        }
                                                        const profileResponse = await refreshProfile(library.baseUrl);
                                                        if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
                                                             await updateUserProfile(profileResponse.data.result.profile);
                                                        }
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
                                                        toggle();
                                                        popAlert(getTermFromDictionary(language, 'list_created'), res.message, status);
                                                   });
                                              } catch (error) {
                                                   logErrorMessage("Failed to create list: ", error);
                                                   popAlert("Error", "Something went wrong while creating the list.", "danger");
                                              } finally {
                                                   setAdding(false);
                                                   setLoading(false);
                                              }
                                         }}>
                                        <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_list')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
};

export default CreateList;
