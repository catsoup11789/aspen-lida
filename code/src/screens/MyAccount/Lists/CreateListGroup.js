import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUserState, useListGroups, useUpdateUserProfile, useUpdateListGroups } from '../../../hooks/useUserData';
import { MaterialIcons } from '@expo/vector-icons';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { createListGroup, getListGroups } from '../../../util/api/list';
import { refreshProfile } from '../../../util/api/user';
import { popAlert } from '../../../components/feedback';
import { Platform } from 'react-native';
import { toArray } from '../../../helpers/helpers';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { ChevronDownIcon, CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';

const CreateListGroup = (props) => {
      const { setLoading, updateSelectedListGroup } = props;
      const { data: userState } = useUserState();
      const user = userState?.user ?? {};
      const updateUserProfile = useUpdateUserProfile();
      const { data: listGroups } = useListGroups();
      const updateListGroupsData = useUpdateListGroups();
      const library = useLibrary();
      const language = useActiveLanguage();
      const { textColor, theme, colorMode } = useTheme();
      const [loading, setAdding] = React.useState(false);
      const [showModal, setShowModal] = useState(false);

     const [title, setTitle] = useState('');
     const [nestedGroupId, setNestedGroupId] = useState("no");

     const insets = useSafeAreaInsets();
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const tertiaryBg = theme.tokens.colors.tertiary['300'] ?? theme.tokens.colors.tertiary['500'];

     let hasListGroups = false;
     if(user.numListGroups) {
          hasListGroups = user.numListGroups > 0;
     }

     const toggle = () => {
          setShowModal(!showModal);
     };

     return (
          <Center>
               <Button onPress={toggle} size="sm" style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                   <ButtonIcon as={MaterialIcons} name="add" style={{ color: theme.tokens.colors.primary['500-text'], marginRight: 4 }} />
                   <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_new_list_group')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'create_new_list_group')}
                              </Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl style={{ paddingBottom: 20 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'new_list_group_name')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Input style={{ borderColor }}>
                                        <InputField id="title" onChangeText={(text) => setTitle(text)} returnKeyType="next" defaultValue={title} style={{ color: textColor }} />
                                   </Input>
                              </FormControl>
                              {hasListGroups && (
                                   <FormControl style={{ paddingBottom: 20 }}>
                                        <FormControlLabel>
                                             <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'should_nest_list_group')}</FormControlLabelText>
                                        </FormControlLabel>
                                        <Select name="should_nest_list_group" selectedValue={nestedGroupId} accessibilityLabel={getTermFromDictionary(language, 'should_nest_list_group')} onValueChange={(itemValue) => setNestedGroupId(itemValue)}>
                                              <SelectTrigger variant="outline" size="md">
                                                   {nestedGroupId !== 'no' && nestedGroupId !== '' ? (
                                                        toArray(listGroups.groups).map((group) => {
                                                             if (group.id === nestedGroupId) {
                                                                  return <SelectInput style={{ paddingVertical: 0, color: textColor }} value={group.title} />;
                                                             }
                                                        })
                                                   ) : (
                                                        <SelectInput style={{ paddingVertical: 0, color: textColor }} value={getTermFromDictionary(language, 'nest_within_group_no')} />
                                                   )}
                                                   <SelectIcon style={{ marginRight: 12 }}>
                                                        <Icon as={ChevronDownIcon} style={{ color: textColor }} />
                                                   </SelectIcon>
                                              </SelectTrigger>
                                             <SelectPortal>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: surfaceBg, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                       <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator />
                                                       </SelectDragIndicatorWrapper>
                                                   <SelectScrollView>
                                                        <SelectItem label={getTermFromDictionary(language, 'nest_within_group_no')} value="no" key={1} style={{ backgroundColor: nestedGroupId === 'no' ? tertiaryBg : 'transparent' }} />
                                                        {toArray(listGroups?.groups ?? []).map((item, index) => {
                                                             return <SelectItem key={index} value={item.id} label={item.title} style={{ backgroundColor: nestedGroupId === item.id ? tertiaryBg : 'transparent' }} />;
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
                                         style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                         isLoading={loading}
                                         isLoadingText={getTermFromDictionary(language, 'creating_list', true)}
                                         onPress={async () => {
                                              setAdding(true);
                                              await createListGroup(title, nestedGroupId, library.baseUrl).then(async (res) => {
                                                   let status = 'success';
                                                   if (!res.data.result.success) {
                                                        status = 'error';
                                                   }
                                                   // Refresh list groups from API and update local database
                                                   const groupsResponse = await getListGroups(library.baseUrl);
                                                   if (groupsResponse.ok) {
                                                        await updateListGroupsData({
                                                             groups: groupsResponse.data?.result?.groups ?? [],
                                                             unassigned: groupsResponse.data?.result?.unassigned ?? 0 });
                                                   }
                                                   const profileResponse = await refreshProfile(library.baseUrl);
                                                   if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
                                                        await updateUserProfile(profileResponse.data.result.profile);
                                                   }
                                                   toggle();
                                                   setLoading(true);
                                                   popAlert(getTermFromDictionary(language, 'list_created'), res.data.result.message, status);
                                                   if (res.data.result.groupId) {
                                                        updateSelectedListGroup(res.data.result.groupId);
                                                   }
                                              });
                                         }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'create_list_group')}</ButtonText>
                                    </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
}

export default CreateListGroup;
