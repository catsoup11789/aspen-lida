import { ThemedButton as Button, ThemedButtonSpinner as ButtonSpinner, ThemedButtonText as ButtonText } from '../../themed/ThemedButton';
import { ThemedButtonGroup as ButtonGroup } from '@/src/components/themed/ThemedButton';
import React from 'react';
import _ from 'lodash';
import { useQueryClient } from '@tanstack/react-query';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { useUserState, useAccounts, useUpdateUserProfile } from '@/src/hooks/useUserData';
import { decodeHTML } from '@/src/helpers/helpers';
import { completeAction } from '@/src/util/api/userHelper';
import { refreshProfile, updateAlternateLibraryCard } from '@/src/util/api/user';
import { HoldPrompt } from '../Holds/HoldPrompt';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { logDebugMessage, logWarnMessage, getErrorMessage } from '@/src/util/logging';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { PasswordVisibilityToggle, ThemedCloseIcon, ThemedFormControl as FormControl, ThemedInput, ThemedInputField, ThemedFormControlLabelText as FormControlLabelText } from '../../themed/ThemedFormControls';
import { FormControlLabel } from '@/components/ui/form-control';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { ThemedModal as Modal, ThemedModalBackdrop as ModalBackdrop, ThemedModalBody as ModalBody, ThemedModalCloseButton as ModalCloseButton, ThemedModalContent as ModalContent, ThemedModalFooter as ModalFooter, ThemedModalHeader as ModalHeader } from '@/src/components/themed/ThemedModal';

/**
 * CheckOut component for handling the checkout process of an item, including alternate library card handling and response management.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const CheckOut = (props) => {
     const queryClient = useQueryClient();
     const { id, title, type, record, prevRoute, response, setResponse, responseIsOpen, setResponseIsOpen, onResponseClose, cancelResponseRef, holdConfirmationResponse, setHoldConfirmationResponse, holdConfirmationIsOpen, setHoldConfirmationIsOpen, onHoldConfirmationClose, cancelHoldConfirmationRef, userHasAlternateLibraryCard, shouldPromptAlternateLibraryCard } = props;
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const { data: accounts } = useAccounts();
     const updateUserProfile = useUpdateUserProfile();
     const library = useLibrary();
     const language = useActiveLanguage();
     const [loading, setLoading] = React.useState(false);
     const { uiColors, runtimeColors, colorMode, textColor } = useTheme();

     const volumeInfo = {
          numItemsWithVolumes: 0,
          numItemsWithoutVolumes: 1,
          hasItemsWithoutVolumes: true,
          majorityOfItemsHaveVolumes: false };

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     if (_.size(accounts) > 0) {
          return (
               <HoldPrompt
                    language={language}
                    id={record}
                    title={title}
                    action={type}
                    volumeInfo={volumeInfo}
                    prevRoute={prevRoute}
                    isEContent={true}
                    setResponseIsOpen={setResponseIsOpen}
                    responseIsOpen={responseIsOpen}
                    onResponseClose={onResponseClose}
                    cancelResponseRef={cancelResponseRef}
                    response={response}
                    setResponse={setResponse}
                    setHoldConfirmationIsOpen={setHoldConfirmationIsOpen}
                    holdConfirmationIsOpen={holdConfirmationIsOpen}
                    onHoldConfirmationClose={onHoldConfirmationClose}
                    cancelHoldConfirmationRef={cancelHoldConfirmationRef}
                    holdConfirmationResponse={holdConfirmationResponse}
                    setHoldConfirmationResponse={setHoldConfirmationResponse}
                    userHasAlternateLibraryCard={userHasAlternateLibraryCard}
                    shouldPromptAlternateLibraryCard={shouldPromptAlternateLibraryCard}
               />
          );
     } else if (shouldPromptAlternateLibraryCard && !userHasAlternateLibraryCard) {
          const [showAddAlternateLibraryCardModal, setShowAddAlternateLibraryCardModal] = React.useState(false);

          let cardLabel = getTermFromDictionary(language, 'alternate_library_card');
          let passwordLabel = getTermFromDictionary(language, 'password');
          let formMessage = '';
          let showAlternateLibraryCardPassword = false;

          if (library?.alternateLibraryCardConfig?.alternateLibraryCardLabel) {
               cardLabel = library.alternateLibraryCardConfig.alternateLibraryCardLabel;
          }

          if (library?.alternateLibraryCardConfig?.alternateLibraryCardPasswordLabel) {
               passwordLabel = library.alternateLibraryCardConfig.alternateLibraryCardPasswordLabel;
          }

          if (library?.alternateLibraryCardConfig?.alternateLibraryCardFormMessage) {
               formMessage = decodeHTML(library.alternateLibraryCardConfig.alternateLibraryCardFormMessage);
          }

          if (library?.alternateLibraryCardConfig?.showAlternateLibraryCardPassword) {
               if (library.alternateLibraryCardConfig.showAlternateLibraryCardPassword === '1' || library.alternateLibraryCardConfig.showAlternateLibraryCardPassword === 1) {
                    showAlternateLibraryCardPassword = true;
               }
          }

          const { width } = useWindowDimensions();
          const [card, setCard] = React.useState(user?.alternateLibraryCard ?? '');
          const [password, setPassword] = React.useState(user?.alternateLibraryCardPassword ?? '');
          const [showPassword, setShowPassword] = React.useState(false);
          const toggleShowPassword = () => setShowPassword(!showPassword);

          const source = {
               baseUrl: library.baseUrl,
               html: formMessage };

          const tagsStyles = {
               body: {
                    color: textColor },
               a: {
                    color: textColor,
                    textDecorationColor: textColor } };

          const updateCard = async () => {
               await updateAlternateLibraryCard(card, password, false, library.baseUrl, language);
               await refreshProfile(library.baseUrl).then(async (data) => {
                    if(data.ok) {
                         await updateUserProfile(data.data.result.profile);
                    } else {
                         logWarnMessage('Could not refresh profile after placing hold from volume selection.');
                         logDebugMessage(data);
                         getErrorMessage(data.code ?? 0, data.problem);
                    }
               });
               setCard('');
               setPassword('');
          };
          return (
               <>
                    <Button colorScheme="primary" style={{ minWidth: '100%', maxWidth: '100%' }} onPress={() => setShowAddAlternateLibraryCardModal(true)}>
                         <ButtonText>{title}</ButtonText>
                    </Button>
                    <Modal isOpen={showAddAlternateLibraryCardModal} onClose={() => setShowAddAlternateLibraryCardModal(false)} closeOnOverlayClick={false} size="lg">
                         <ModalBackdrop />
                         <ModalContent style={{ maxWidth: '90%' }}>
                              <ModalHeader style={{ borderBottomWidth: 1, borderBottomColor: colorMode === 'light' ? uiColors.border.light : uiColors.border.dark }}>
                                   <Heading>
                                        {getTermFromDictionary(language, 'add_alternate_library_card')}
                                   </Heading>
                                   <ModalCloseButton onPress={() => { setShowAddAlternateLibraryCardModal(false); }}>
                                        <ThemedCloseIcon />
                                   </ModalCloseButton>
                              </ModalHeader>
                              <ModalBody style={{ marginTop: 12 }}>
                                   {formMessage ? <RenderHtml contentWidth={width} source={source} tagsStyles={tagsStyles} /> : null}
                                   <FormControl style={{ marginBottom: 8 }}>
                                        <FormControlLabel>
                                             <FormControlLabelText size="sm">
                                                  {cardLabel}
                                             </FormControlLabelText>
                                        </FormControlLabel>
                                        <ThemedInput>
                                             <ThemedInputField textContentType="none" name="card" defaultValue={card} accessibilityLabel={cardLabel} onChangeText={(value) => setCard(value)} />
                                        </ThemedInput>
                                   </FormControl>
                                   {showAlternateLibraryCardPassword ? (
                                        <FormControl style={{ marginBottom: 8 }}>
                                             <FormControlLabel>
                                                  <FormControlLabelText size="sm">
                                                       {passwordLabel}
                                                  </FormControlLabelText>
                                             </FormControlLabel>
                                             <ThemedInput>
                                                  <ThemedInputField textContentType="none" type={showPassword ? 'text' : 'password'} name="password" defaultValue={password} accessibilityLabel={passwordLabel} onChangeText={(value) => setPassword(value)} />
                                                  <PasswordVisibilityToggle showPassword={showPassword} onPress={toggleShowPassword} />
                                             </ThemedInput>
                                        </FormControl>
                                   ) : null}
                              </ModalBody>
                              <ModalFooter style={{ borderTopWidth: 1, borderTopColor: colorMode === 'light' ? uiColors.border.light : uiColors.border.dark }}>
                                   <ButtonGroup space="sm">
                                        <Button
                                             variant="outline"
                                             style={{ borderColor: colorMode === 'light' ? uiColors.border.light : uiColors.border.dark }}
                                             onPress={() => {
                                                  setShowAddAlternateLibraryCardModal(false);
                                                  setLoading(false);
                                             }}>
                                             <ButtonText style={{ color: colorMode === 'light' ? uiColors.text.light : uiColors.text.dark }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                        </Button>
                                        <Button
                                             colorScheme="primary"
                                             isDisabled={loading}
                                             onPress={async () => {
                                                  setLoading(true);
                                                  await updateCard();
                                                  await completeAction(record, type, user.id, null, null, null, null, null, library.baseUrl).then(async (response) => {
                                                       logDebugMessage("Completed Action - Checkout with alternate card");
                                                       setResponse(response);
                                                       if (response.success) {
                                                            queryClient.invalidateQueries({ queryKey: ['checkouts', user.id, library.baseUrl, language] });
                                                            await refreshAndSaveUserProfile();
                                                       }
                                                       setLoading(false);
                                                       setResponseIsOpen(true);
                                                       setShowAddAlternateLibraryCardModal(false);
                                                  });
                                             }}>
                                             {loading ? <ButtonSpinner style={{ color: runtimeColors.primary['500-text'] }} /> : <ButtonText>{title}</ButtonText>}
                                        </Button>
                                   </ButtonGroup>
                              </ModalFooter>
                         </ModalContent>
                    </Modal>
               </>
          );
     } else {
          return (
               <>
                    <Button
                         variant="solid"
                         colorScheme="primary" style={{ minWidth: '100%', maxWidth: '100%' }}
                         onPress={async () => {
                              setLoading(true);
                              await completeAction(record, type, user.id, null, null, null, null, null, library.baseUrl).then(async (eContentResponse) => {
                                   setResponse(eContentResponse);
                                   logDebugMessage("Completed Action - Checkout");
                                   if (eContentResponse.success) {
                                        queryClient.invalidateQueries({ queryKey: ['checkouts', user.id, library.baseUrl, language] });
                                        await refreshAndSaveUserProfile();
                                   }
                                   setLoading(false);
                                   setResponseIsOpen(true);
                              });
                         }}>
                        {loading ? <ButtonSpinner style={{ color: runtimeColors.primary['500-text'], paddingRight: 8 }} /> : <ButtonText>{title}</ButtonText>}
                    </Button>
               </>
          );
     }
};
