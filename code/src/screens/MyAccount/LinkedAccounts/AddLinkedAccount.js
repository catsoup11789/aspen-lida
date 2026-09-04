import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { Button, ButtonText, ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { InputSlot } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { useUserState, useUpdateUserProfile, useUpdateAccounts, useUpdateViewers } from '@/src/hooks/useUserData';
import { addLinkedAccount, refreshProfile, getLinkedAccounts, getViewerAccounts } from '@/src/util/api/user';
import { formatLinkedAccounts } from '@/src/util/api/userHelper';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import {logErrorMessage} from '@/src/util/logging';
import { toArray } from '@/src/helpers/helpers';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '@/src/components/themed/ThemedFormControls';

/**
 * AddLinkedAccount component that allows users to add a linked account. It displays a button that opens a modal where users can input the username and password of the account they want to link. The component handles API calls to add the linked account and refreshes the linked accounts, viewer accounts, and user profile upon successful completion.
 * @returns {React.JSX.Element}
 * @constructor
 */
const AddLinkedAccount = () => {
     const library = useLibrary();
     const language = useActiveLanguage();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const updateAccounts = useUpdateAccounts();
     const updateViewers = useUpdateViewers();
     const { textColor, uiColors, runtimeColors, colorMode } = useTheme();
     const [loading, setLoading] = useState(false);
     const [showModal, setShowModal] = useState(false);
     const [showPassword, setShowPassword] = useState(false);
     const [newUser, setNewUser] = useState('');
     const [password, setPassword] = useState('');

     const passwordRef = useRef();
     const modalBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const inputBorderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

     const toggle = () => {
          setShowModal(!showModal);
          setNewUser('');
          setPassword('');
          setLoading(false);
     };

     const refreshLinkedAccounts = async () => {
          const linkedResponse = await getLinkedAccounts(library.baseUrl, language);
          if (linkedResponse?.ok) {
               const formatted = formatLinkedAccounts(user, [], library.barcodeStyle, linkedResponse.data.result.linkedAccounts);
               await updateAccounts(formatted.accounts);
          }

          const viewerResponse = await getViewerAccounts(library.baseUrl, language);
          if (viewerResponse?.ok) {
               const viewerList = toArray(viewerResponse.data?.result?.viewers ?? []);
               await updateViewers(viewerList);
          }

          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     };

     return (
          <Center>
               <Button onPress={toggle} style={{ backgroundColor: runtimeColors.primary[500] }}>
                    <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'linked_add_an_account')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="full" avoidKeyboard>
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: modalBg, maxWidth: '95%' }}>
                         <ModalHeader>
                              <Heading size="sm" style={{ color: textColor }}>{getTermFromDictionary(language, 'linked_account_to_manage')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <FormControl>
                                   <FormControlLabel><FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'username')}</FormControlLabelText></FormControlLabel>
                                   <ThemedInput style={{ borderColor: inputBorderColor }}>
                                        <ThemedInputField onChangeText={(text) => setNewUser(text)}
                                                      autoCorrect={false}
                                                      autoCapitalize="none"
                                                      id="username"
                                                      returnKeyType="next"
                                                      textContentType="username"
                                                      required
                                                     onSubmitEditing={() => {
                                                          passwordRef.current.focus();
                                                      }}
                                                     value={newUser}/>
                                   </ThemedInput>
                              </FormControl>
                              <FormControl style={{ marginTop: 12 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>{getTermFromDictionary(language, 'password')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <ThemedInput style={{ borderColor: inputBorderColor }}>
                                        <ThemedInputField onChangeText={(text) => setPassword(text)} value={password} autoCorrect={false}
                                                    autoCapitalize="none" id="password" returnKeyType="next"
                                                    textContentType="password" required type={showPassword ? 'text' : 'password'} ref={passwordRef}
                                        />
                                        <InputSlot onPress={() => setShowPassword(!showPassword)}>
                                             <MaterialCommunityIcons name={showPassword ? 'eye' : 'eye-off'} size={20} color={textColor} style={{ marginRight: 8 }} />
                                        </InputSlot>
                                   </ThemedInput>
                              </FormControl>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="link" onPress={toggle}>
                                       <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                   <Button
                                       style={{ backgroundColor: runtimeColors.primary[500] }}
                                        isLoading={loading}
                                        isLoadingText={getTermFromDictionary(language, 'adding', true)}
                                        onPress={async () => {
                                             setLoading(true);
                                             try {
                                                  await addLinkedAccount(newUser, password, library.baseUrl);
                                                  await refreshLinkedAccounts();
                                             }catch (e) {
                                                  logErrorMessage("Error adding linked account");
                                                  logErrorMessage(e);
                                             }finally {
                                                  toggle();
                                             }
                                        }}>
                                      <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'linked_add_account')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
};

export default AddLinkedAccount;
