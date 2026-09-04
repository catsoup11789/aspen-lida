import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import _ from 'lodash';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserState, useLists, useListGroups } from '../../hooks/useUserData';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { addTitlesToList, createListFromTitle } from '../../util/api/list';
import { saveLastListUsed } from '../../util/db';
import { LoadingSpinner } from '../../components/loadingSpinner';
import { getListGroups } from '../../util/api/list';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useTheme } from '../../themes/theme';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CircleIcon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../components/themed/ThemedSelect';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '../../components/themed/ThemedFormControls';

/**
 * AddToList component that displays a button to add an item to a list. When clicked, it opens a modal that allows the user to select an existing list or create a new one, and optionally add the list to a group. It handles the state of the modal, form fields, and API calls for adding items to lists and creating new lists.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
const AddToList = (props) => {
     const item = props.itemId;
     const btnStyle = props.btnStyle;
     const source = props.source ?? 'GroupedWork';
     const btnWidth = props.btnWidth ?? 'auto';

     const [open, setOpen] = React.useState(false);
     const [screen, setScreen] = React.useState('add-new');
     const [loading, setLoading] = React.useState(false);
     const library = useLibrary();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const { data: userLists } = useLists();
     const { data: listGroups } = useListGroups();
     const language = useActiveLanguage();
     const insets = useSafeAreaInsets();
     const lists = userLists?.lists ?? userLists ?? [];
     const [listId, setListId] = useState();
     const [description, saveDescription] = useState();
     const [title, saveTitle] = useState();
     const [isPublic, saveIsPublic] = useState('1');
     const queryClient = useQueryClient();
     const { uiColors, runtimeColors, textColor, colorMode } = useTheme();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const cancelColor = colorMode === 'light' ? uiColors.textStrong.light : uiColors.textStrong.dark;

     const [addToGroup, setAddToGroup] = React.useState('no');
     const [newGroupName, setNewGroupName] = React.useState('');
     const [nestedGroup, setNestedGroup] = React.useState('');
     const [existingGroupId, setExistingGroupId] = React.useState(user.lastListGroupAdded ? user.lastListGroupAdded : (listGroups?.groups[0] ? listGroups.groups[0].id : 0));

     const { data, isLoading } = useQuery(
          ['list_groups', user.id, library.baseUrl, language],
          () => getListGroups(library.baseUrl),
          {
               refetchInterval: 60 * 1000 * 15,
               refetchOnWindowFocus: 'always' }
     );

     const groups = data?.ok ? (data.data?.result?.groups ?? []) : [];
     const listGroupItems = listGroups?.groups ? Object.values(listGroups.groups) : [];

     let hasListGroups = false;
     if(user.numListGroups) {
          hasListGroups = user.numListGroups > 0;
     }

     const updateLastListUsed = async (itemId) => {
          queryClient.invalidateQueries({ queryKey: ['list', itemId] });
          queryClient.invalidateQueries({ queryKey: ['lists', user.id, library.baseUrl, language] });
          await saveLastListUsed(itemId);
          setListId(itemId);
     };

     const closeModal = () => {
          setOpen(false);
          setScreen('add-new');
          setLoading(false);
     };

     const toggleModal = () => {
          if (open) {
               closeModal();
               return;
          }
          setOpen(true);
     };

     const RenderLargeButton = () => (
          <Center>
               <Button style={{ marginTop: 12, backgroundColor: runtimeColors.tertiary[500] }} onPress={toggleModal}>
                    <MaterialIcons name="bookmark" size={18} color={runtimeColors.tertiary['500-text']} style={{ marginRight: 4 }} />
                    <ButtonText style={{ color: runtimeColors.tertiary['500-text'] }}>{getTermFromDictionary(language, 'add_to_list')}</ButtonText>
               </Button>
          </Center>
     );

     const RenderSmallButton = () => (
          <Button size="xs" variant="link" style={{ marginTop: 4 }} onPress={toggleModal}>
               <MaterialIcons name="bookmark" size={18} color={runtimeColors.tertiary[500]} style={{ marginRight: 4 }} />
               <ButtonText style={{ color: runtimeColors.tertiary[500] }}>{getTermFromDictionary(language, 'add_to_list')}</ButtonText>
          </Button>
     );

     const RenderRegularButton = () => (
          <Button style={{ width: btnWidth, backgroundColor: runtimeColors.primary[500] }} onPress={toggleModal}>
               <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'add_to_list')}</ButtonText>
          </Button>
     );

     return (
          <>
               <Modal
                    isOpen={open}
                    onClose={closeModal}
                    onBackdropPress={closeModal}
                    size="full"
                    avoidKeyboard
               >
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         {isLoading ? (
                              <LoadingSpinner />
                         ) : screen === 'add-new' && !_.isEmpty(lists) ? (
                              <>
                                   <ModalHeader>
                                        <Heading style={{ color: textColor }}>
                                             {getTermFromDictionary(language, 'add_to_list')}
                                        </Heading>
                                        <ModalCloseButton style={{ padding: 12 }} onPress={closeModal}>
                                             <ThemedCloseIcon />
                                        </ModalCloseButton>
                                   </ModalHeader>
                                   <ModalBody>
                                        <FormControl>
                                             <VStack space="md">
                                                  <FormControl>
                                                       <FormControlLabel>
                                                            <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'choose_a_list')}</FormControlLabelText>
                                                       </FormControlLabel>
                                                       <Select
                                                            selectedValue={listId}
                                                            defaultValue={listId}
                                                            onValueChange={(itemValue) => {
                                                                 setListId(itemValue);
                                                            }}>
                                                            <SelectTrigger variant="outline" size="md">
                                                                 <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder="Select list" />
                                                            </SelectTrigger>
                                                            <SelectPortal>
                                                                 <SelectBackdrop />
                                                                 <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                                      <SelectDragIndicatorWrapper>
                                                                           <SelectDragIndicator />
                                                                      </SelectDragIndicatorWrapper>
                                                                      <SelectScrollView>
                                                                           {_.map(lists, function (item, index) {
                                                                                return <SelectItem key={index} value={item.id} label={item.title} selectedValue={listId} />;
                                                                           })}
                                                                      </SelectScrollView>
                                                                 </SelectContent>
                                                            </SelectPortal>
                                                       </Select>
                                                  </FormControl>
                                                  <HStack space="sm" style={{ alignItems: 'center' }}>
                                                       <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'or')}</Text>
                                                       <Button
                                                            size="sm"
                                                            style={{ backgroundColor: runtimeColors.primary[500] }}
                                                            onPress={() => {
                                                                 setScreen('create-new');
                                                            }}>
                                                            <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_new_list')}</ButtonText>
                                                       </Button>
                                                  </HStack>
                                             </VStack>
                                        </FormControl>
                                   </ModalBody>
                                   <ModalFooter>
                                        <ButtonGroup style={{ padding: 16, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                             <Button
                                                  variant="outline"
                                                  style={{ borderColor: cancelColor }}
                                                  onPress={closeModal}>
                                                  <ButtonText style={{ color: cancelColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             {!_.isEmpty(lists) ? (
                                                  <Button
                                                       style={{ backgroundColor: runtimeColors.primary[500] }}
                                                       isLoading={loading}
                                                       onPress={() => {
                                                            setLoading(true);
                                                            addTitlesToList(listId, item, library.baseUrl, source, language).then(() => {
                                                                 updateLastListUsed(listId);
                                                                 queryClient.invalidateQueries({ queryKey: ['list', listId] });
                                                                 closeModal();
                                                            });
                                                       }}>
                                                       <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'save_to_list')}</ButtonText>
                                                  </Button>
                                             ) : (
                                                  <Button style={{ backgroundColor: runtimeColors.primary[500] }}>
                                                       <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_new_list')}</ButtonText>
                                                  </Button>
                                             )}
                                        </ButtonGroup>
                                   </ModalFooter>
                              </>
                         ) : (
                              <>
                                   <ModalHeader>
                                        <Heading size="md" style={{ color: textColor }}>
                                             {getTermFromDictionary(language, 'create_new_list_item')}
                                        </Heading>
                                        <ModalCloseButton style={{ padding: 12 }} onPress={closeModal}>
                                             <ThemedCloseIcon />
                                        </ModalCloseButton>
                                   </ModalHeader>
                                   <ModalBody>
                                        <Box style={{ padding: 16 }}>
                                             <VStack space="md">
                                                  <FormControl>
                                                       <FormControlLabel>
                                                            <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'title')}</FormControlLabelText>
                                                       </FormControlLabel>
                                                       <ThemedInput style={{ borderColor }}>
                                                            <ThemedInputField id="title" onChangeText={(text) => saveTitle(text)} returnKeyType="next" />
                                                       </ThemedInput>
                                                  </FormControl>
                                                  <FormControl>
                                                       <FormControlLabel>
                                                            <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'description')}</FormControlLabelText>
                                                       </FormControlLabel>
                                                       <Textarea id="description" onChangeText={(text) => saveDescription(text)} returnKeyType="next" style={{ borderColor }}>
                                                            <TextareaInput style={{ color: textColor }} />
                                                       </Textarea>
                                                  </FormControl>
                                                  <FormControl>
                                                       <FormControlLabel>
                                                            <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'access')}</FormControlLabelText>
                                                       </FormControlLabel>
                                                       <RadioGroup
                                                            value={isPublic}
                                                            onChange={(nextValue) => {
                                                                 saveIsPublic(nextValue);
                                                            }}>
                                                            <HStack space="md" style={{ flexDirection: 'row', alignItems: 'center', width: '75%', maxWidth: 300 }}>
                                                                 <Radio value="1" style={{ marginVertical: 4 }}>
                                                                      <RadioIndicator style={{ marginRight: 8, borderColor }}>
                                                                           <RadioIcon as={CircleIcon} style={{ color: borderColor }} />
                                                                      </RadioIndicator>
                                                                      <RadioLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'private')}</RadioLabel>
                                                                 </Radio>
                                                                 <Radio value="0" style={{ marginVertical: 4 }}>
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
                                                       <Select selectedValue={addToGroup} accessibilityLabel={getTermFromDictionary(language, 'should_add_to_list_group')} onValueChange={(itemValue) => setAddToGroup(itemValue)}>
                                                            <SelectTrigger variant="outline" size="md">
                                                                 {addToGroup !== '' ? (
                                                                      <SelectInput
                                                                           style={{ paddingVertical: 0, color: textColor }}
                                                                           value={addToGroup === 'new' ? getTermFromDictionary(language, 'add_to_list_group_new') : addToGroup === 'existing' ? getTermFromDictionary(language, 'add_to_list_group_existing') : getTermFromDictionary(language, 'add_to_list_group_no')}
                                                                      />
                                                                 ) : (
                                                                      <SelectInput value={getTermFromDictionary(language, 'add_to_list_group_no')} style={{ color: textColor }} />
                                                                 )}
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
                                                                      <Select selectedValue={nestedGroup} accessibilityLabel={getTermFromDictionary(language, 'should_nest_list_group')} onValueChange={(itemValue) => setNestedGroup(itemValue)}>
                                                                           <SelectTrigger variant="outline" size="md">
                                                                                {nestedGroup !== 'no' && nestedGroup !== '' ? (
                                                                                     listGroupItems.map((group) => {
                                                                                          if (group.id === nestedGroup) {
                                                                                               return <SelectInput key={group.id} style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                                                          }
                                                                                          return null;
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
                                                                                          {_.map(Object.values(groups), function (item, index) {
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
                                                                 selectedValue={existingGroupId !== -1 ? existingGroupId : groups[0]?.id}
                                                                 defaultValue={existingGroupId !== -1 ? existingGroupId : groups[0]?.id}
                                                                 onValueChange={(itemValue) => {
                                                                      setExistingGroupId(itemValue);
                                                                 }}>
                                                                 <SelectTrigger variant="outline" size="md">
                                                                      {existingGroupId && existingGroupId !== -1 ? (
                                                                           _.map(Object.values(groups), function (group) {
                                                                                if (group.id === existingGroupId) {
                                                                                     return <SelectInput key={group.id} style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                                                }
                                                                                return null;
                                                                           })
                                                                      ) : (
                                                                           <SelectInput style={{ paddingVertical: 0, color: textColor }} value={groups[0]?.title} />
                                                                      )}
                                                                      </SelectTrigger>
                                                                 <SelectPortal>
                                                                      <SelectBackdrop />
                                                                      <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                                           <SelectDragIndicatorWrapper>
                                                                                <SelectDragIndicator />
                                                                           </SelectDragIndicatorWrapper>
                                                                           <SelectScrollView>
                                                                                {listGroupItems.map((item, index) => {
                                                                                     return <SelectItem key={index} value={item.id} label={item.title} selectedValue={existingGroupId} />;
                                                                                })}
                                                                           </SelectScrollView>
                                                                      </SelectContent>
                                                                 </SelectPortal>
                                                            </Select>
                                                       </FormControl>
                                                  )}
                                             </VStack>
                                        </Box>
                                   </ModalBody>
                                   <ModalFooter>
                                        <ButtonGroup style={{ padding: 16, flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                             <Button
                                                  variant="outline"
                                                  style={{ borderColor: cancelColor }}
                                                  onPress={closeModal}>
                                                  <ButtonText style={{ color: cancelColor }}>{getTermFromDictionary(language, 'cancel')}</ButtonText>
                                             </Button>
                                             <Button
                                                  style={{ backgroundColor: runtimeColors.primary[500] }}
                                                  isLoading={loading}
                                                  isLoadingText={getTermFromDictionary(language, 'saving', true)}
                                                  onPress={() => {
                                                       setLoading(true);
                                                       createListFromTitle(title, description, isPublic, item, library.baseUrl, source, addToGroup, nestedGroup, newGroupName).then((res) => {
                                                            updateLastListUsed(res.listId);
                                                            queryClient.invalidateQueries({ queryKey: ['lists', user.id, library.baseUrl, language] });
                                                            queryClient.invalidateQueries({ queryKey: ['list_groups', user.id, library.baseUrl, language] });
                                                            closeModal();
                                                       });
                                                  }}>
                                                  <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_list')}</ButtonText>
                                             </Button>
                                        </ButtonGroup>
                                   </ModalFooter>
                              </>
                         )}
                    </ModalContent>
               </Modal>
               {btnStyle === 'lg' ? <RenderLargeButton /> : btnStyle === 'reg' ? <RenderRegularButton /> : <RenderSmallButton />}
          </>
     );
};

export default AddToList;
