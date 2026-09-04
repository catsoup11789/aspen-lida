import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { popAlert } from '@/src/components/feedback';
import { useUserState, useListGroups, useUpdateUserProfile, useUpdateLists } from '@/src/hooks/useUserData';
import { navigateStack } from '@/src/helpers/RootNavigator';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { deleteList, editList, getLists } from '@/src/util/api/list';
import { refreshProfile } from '@/src/util/api/user';
import {Platform} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toArray } from '@/src/helpers/helpers';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogCloseButton, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CheckIcon, ChevronDownIcon, ChevronLeftIcon, CircleIcon, Icon } from '@/components/ui/icon';
import { HStack } from '@/components/ui/hstack';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Pressable } from '@/components/ui/pressable';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';

/**
 * EditList component that allows users to edit the details of a list, including title, description, access level (public/private), and list group. It provides a modal interface for editing and handles API calls to update the list information. It also includes functionality to delete the list with confirmation.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
const EditList = (props) => {
      const { data, listId } = props;
      const navigation = useNavigation();
      const { data: userState } = useUserState();
      const updateUserProfile = useUpdateUserProfile();
      const { data: listGroups } = useListGroups();
      const updateLists = useUpdateLists();
      const library = useLibrary();
      const language = useActiveLanguage();
      const [showModal, setShowModal] = React.useState(false);
      const [loading, setLoading] = React.useState(false);
      const [title, setTitle] = React.useState(data.title);
      const [description, setDescription] = React.useState(data.description);
      const [isPublic, setPublic] = React.useState(data.public);
      const [listGroupId, setListGroupId] = React.useState(data.listGroupId);
      const { theme, runtimeColors, textColor, colorMode } = useTheme();

      const insets = useSafeAreaInsets();
      const user = userState?.user ?? {};
      const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
      const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
      const tertiaryBg = runtimeColors.tertiary[300] ?? runtimeColors.tertiary[500];

     React.useLayoutEffect(() => {
          navigation.setOptions({
               headerLeft: () => (
                    <Pressable
                         onPress={() => {
                              navigateStack('AccountScreenTab', 'MyLists', {
                                   hasPendingChanges: true });
                         }}
                        style={{ marginRight: 12, padding: 4 }}>
                        <ChevronLeftIcon size={20} style={{ color: textColor }} />
                    </Pressable>
               ) });
     }, [navigation]);

     return (
          <>
               <ButtonGroup size="sm" style={{ justifyContent: 'center' }} >
                    <Button onPress={() => setShowModal(true)} style={{ backgroundColor: runtimeColors.primary[500] }}>
                         <MaterialIcons name="edit" size={18} color={runtimeColors.primary['500-text']} style={{ marginRight: 4 }} />
                         <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'edit')}</ButtonText>
                    </Button>
                    <DeleteList listId={listId} />
               </ButtonGroup>
               <Modal isOpen={showModal} onClose={() => setShowModal(false)} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{getTermFromDictionary(language, 'edit')} {data.title}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowModal(false); }}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'title')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <ThemedInput style={{ borderColor }}><ThemedInputField id="title" defaultValue={data.title} autoComplete="off" onChangeText={(text) => setTitle(text)} /></ThemedInput>
                              </FormControl>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel><FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'description')}</FormControlLabelText></FormControlLabel>
                                   <Textarea id="description" defaultValue={data.description} autoComplete="off" onChangeText={(text) => setDescription(text)}><TextareaInput style={{ color: textColor }}/></Textarea>
                              </FormControl>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                     <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'access')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <RadioGroup
                                        value={isPublic ? "true" : "false"}
                                        onChange={(nextValue) => {
                                             setPublic(nextValue === "true");
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
                              <FormControl>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'list_group')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Select
                                       name="newListGroupParent"
                                       selectedValue={listGroupId}
                                       accessibilityLabel={getTermFromDictionary(language, 'list_group')}
                                        onValueChange={(itemValue) => setListGroupId(itemValue)}>
                                        <SelectTrigger variant="outline" size="md">
                                              {listGroupId !== -1 ? (
                                                        toArray(listGroups.groups).map((group) => {
                                                             if (group.id === listGroupId) {
                                                                  return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                             }
                                                        })
                                                   ) :
                                                   <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder={getTermFromDictionary(language, 'no_list_group')} value={-1} />
                                             }
                                             <SelectIcon style={{ marginRight: 12 }}>
                                                  <Icon as={ChevronDownIcon} style={{ color: textColor }} />
                                             </SelectIcon>
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
                                                        <SelectItem label={getTermFromDictionary(language, 'no_list_group')} value="-1" key={-1} style={{ backgroundColor: listGroupId === -1 ? tertiaryBg : 'transparent' }} />
                                                        {toArray(listGroups.groups).map((item, index) => {
                                                             return <SelectItem key={index} value={item.id} label={item.title} style={{ backgroundColor: listGroupId === item.id ? tertiaryBg : 'transparent' }} />;
                                                        })}
                                                   </SelectScrollView>
                                             </SelectContent>
                                        </SelectPortal>
                                   </Select>
                              </FormControl>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="outline" onPress={() => setShowModal(false)} style={{ borderColor: runtimeColors.primary[500] }}>
                                        <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                    <Button
                                         style={{ backgroundColor: runtimeColors.primary[500] }}
                                         isLoading={loading}
                                         isLoadingText={getTermFromDictionary(language, 'saving', true)}
                                         onPress={() => {
                                              setLoading(true);
                                              editList(data.id, title, description, isPublic, library.baseUrl, listGroupId).then(async () => {
                                                   setLoading(false);
                                                   if (title !== null) {
                                                        navigation.setOptions({ title: title });
                                                   }
                                                   setShowModal(false);
                                                   // Refresh lists from API and update local database
                                                   const listsResponse = await getLists(library.baseUrl, 1, 20, 1);
                                                   if (listsResponse.ok) {
                                                        await updateLists(listsResponse.data.result);
                                                   }
                                              });
                                         }}>
                                        <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'save')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </>
     );
};

/**
 * DeleteList component that provides a button to delete a list. When clicked, it opens a confirmation dialog asking the user to confirm the deletion. It also includes an option for the user to opt out of soft deletion. Upon confirmation, it calls the API to delete the list and refreshes the user's lists and profile.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
const DeleteList = (props) => {
      const { listId } = props;
      const {textColor, colorMode, theme } = useTheme();
      const { data: userState } = useUserState();
      const library = useLibrary();
      const language = useActiveLanguage();
      const updateUserProfile = useUpdateUserProfile();
      const updateLists = useUpdateLists();
      const [isOpen, setIsOpen] = React.useState(false);
      const [loading, setLoading] = useState(false);
      const [optOutOfSoftDeletion, setOptOutOfSoftDeletion] = useState(false);
      const onClose = () => setIsOpen(false);
      const cancelRef = React.useRef(null);
      const user = userState?.user ?? {};
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;

     return (
          <Center>
               <Button style={{ backgroundColor: theme.tokens.colors.ui.danger }} onPress={() => setIsOpen(!isOpen)} size="sm">
                    <MaterialIcons name="delete" size={18} color={theme.tokens.colors.ui.white} style={{ marginRight: 4 }} />
                    <ButtonText style={{ color: theme.tokens.colors.ui.white }}>Delete List</ButtonText>
               </Button>
               <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent style={{ backgroundColor: surfaceBg }}>
                         <AlertDialogHeader>
                              <Heading size="md" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'delete_list')}
                              </Heading>
                              <AlertDialogCloseButton>
                                   <ThemedCloseIcon />
                              </AlertDialogCloseButton>
                         </AlertDialogHeader>
                         <AlertDialogBody>
                              <Text style={{ color: textColor }}>{user.hideSoftDeleteListUI ? getTermFromDictionary(language, 'delete_list_confirmation_no_restore') : getTermFromDictionary(language, 'delete_list_confirmation')}</Text>
                              {!user.hideSoftDeleteListUI && (
                                   <FormControl style={{ paddingTop: 12 }}>
                                        <Checkbox value="optOut" isChecked={optOutOfSoftDeletion} onChange={(isChecked) => setOptOutOfSoftDeletion(isChecked)} alignItems="center">
                                             <CheckboxIndicator style={optOutOfSoftDeletion ? { borderColor: runtimeColors.primary[500], backgroundColor: runtimeColors.primary[500] } : { borderColor }}>
                                                  <CheckboxIcon as={CheckIcon} style={{ color: runtimeColors.primary['500-text'] }} />
                                             </CheckboxIndicator>
                                             <CheckboxLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'opt_out_soft_deletion')}</CheckboxLabel>
                                        </Checkbox>
                                   </FormControl>
                              )}
                         </AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup space="sm">
                                   <Button variant="link" onPress={onClose} ref={cancelRef}>
                                        <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                   </Button>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.ui.danger }}
                                        isLoading={loading}
                                        isLoadingText={getTermFromDictionary(language, 'deleting', true)}
                                        onPress={() => {
                                             setLoading(true);
                                             deleteList(listId, library.baseUrl, optOutOfSoftDeletion).then(async (res) => {
                                                  // Refresh lists from API and update local database
                                                  const listsResponse = await getLists(library.baseUrl, 1, 20, 1);
                                                  if (listsResponse.ok) {
                                                       await updateLists(listsResponse.data.result);
                                                  }
                                                  const profileResponse = await refreshProfile(library.baseUrl);
                                                  if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
                                                       await updateUserProfile(profileResponse.data.result.profile);
                                                  }
                                                  setLoading(false);
                                                  let status = 'success';
                                                  setIsOpen(!isOpen);
                                                  if (res.success === false) {
                                                       status = 'error';
                                                       popAlert(res.title, res.message, status);
                                                  } else {
                                                       popAlert(res.title, res.message, status);
                                                       navigateStack('AccountScreenTab', 'MyLists', {
                                                            libraryUrl: library.baseUrl,
                                                            hasPendingChanges: true,
                                                       });
                                                  }
                                             });
                                        }}>
                                        <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'delete')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
};

export default EditList;
