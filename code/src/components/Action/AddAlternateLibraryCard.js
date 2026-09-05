import React from 'react';
import _ from 'lodash';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useUserState, useUpdateUserProfile } from '../../hooks/useUserData';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { refreshProfile, updateAlternateLibraryCard } from '../../util/api/user';
import { decodeHTML } from '../../helpers/helpers';
import { completeAction } from '../../util/api/userHelper';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useQueryClient } from '@tanstack/react-query';
import { logDebugMessage, logWarnMessage, getErrorMessage } from '../../util/logging';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { PasswordVisibilityToggle, ThemedCloseIcon, ThemedFormControl as FormControl, ThemedInput, ThemedInputField, ThemedFormControlLabelText as FormControlLabelText } from '../themed/ThemedFormControls';
import { ThemedButton as Button, ThemedButtonSpinner as ButtonSpinner, ThemedButtonText as ButtonText } from '../themed/ThemedButton';
import { ThemedButtonGroup as ButtonGroup } from '@/src/components/themed/ThemedButton';
import { FormControlLabel } from '@/components/ui/form-control';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { ThemedModal as Modal, ThemedModalBackdrop as ModalBackdrop, ThemedModalBody as ModalBody, ThemedModalCloseButton as ModalCloseButton, ThemedModalContent as ModalContent, ThemedModalFooter as ModalFooter, ThemedModalHeader as ModalHeader } from '@/src/components/themed/ThemedModal';

/**
 * AddAlternateLibraryCard component for adding an alternate library card and password.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const AddAlternateLibraryCard = (props) => {
     const {
          id,
          title,
          action,
          volumeInfo,
          holdTypeForFormat,
          variationId,
          prevRoute,
          isEContent,
          response,
          setResponse,
          responseIsOpen,
          setResponseIsOpen,
          onResponseClose,
          cancelResponseRef,
          holdConfirmationResponse,
          setHoldConfirmationResponse,
          holdConfirmationIsOpen,
          setHoldConfirmationIsOpen,
          onHoldConfirmationClose,
          cancelHoldConfirmationRef,
          holdSelectItemResponse,
          setHoldSelectItemResponse,
          holdItemSelectIsOpen,
          setHoldItemSelectIsOpen,
          onHoldItemSelectClose,
          cancelHoldItemSelectRef,
          recordSource,
          activeAccount } = props;

     let isPlacingHold = false;
     if (_.isObject(action)) {
          isPlacingHold = action.includes('hold');
     }

     const library = useLibrary();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const language = useActiveLanguage();
     const { resolvedUiColors, textColor, runtimeColors } = useTheme();
     const queryClient = useQueryClient();
     const { width } = useWindowDimensions();
     const [card, setCard] = React.useState(user?.alternateLibraryCard ?? '');
     const [password, setPassword] = React.useState(user?.alternateLibraryCardPassword ?? '');
     const [showModal, setShowModal] = React.useState(true);
     const [loading, setLoading] = React.useState(false);
     const inputBorderColor = resolvedUiColors.border;
     const surfaceColor = resolvedUiColors.surface;
     const modalBorderColor = resolvedUiColors.border;

     const [showPassword, setShowPassword] = React.useState(false);
     const toggleShowPassword = () => setShowPassword(!showPassword);

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
     };

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     return (
          <Modal isOpen={showModal} onClose={() => setShowModal(false)} closeOnOverlayClick={false} size="lg">
               <ModalBackdrop />
               <ModalContent style={{ maxWidth: '90%', backgroundColor: surfaceColor }}>
                    <ModalHeader style={{ borderBottomWidth: 1, borderBottomColor: modalBorderColor }}>
                         <Heading>
                              {isPlacingHold ? getTermFromDictionary(language, 'hold_options') : getTermFromDictionary(language, 'checkout_options')}
                         </Heading>
                         <ModalCloseButton onPress={() => { setShowModal(false); }}>
                              <ThemedCloseIcon />
                         </ModalCloseButton>
                    </ModalHeader>
                    <ModalBody className="mt-3">
                         {formMessage ? <RenderHtml contentWidth={width} source={source} tagsStyles={tagsStyles} /> : null}
                         <FormControl className="mb-2">
                              <FormControlLabel>
                                   <FormControlLabelText size="sm">
                                        {cardLabel}
                                   </FormControlLabelText>
                              </FormControlLabel>
                              <ThemedInput style={{ borderColor: inputBorderColor }}>
                                   <ThemedInputField textContentType="none" name="card" defaultValue={card} accessibilityLabel={cardLabel} onChangeText={(value) => setCard(value)} />
                              </ThemedInput>
                         </FormControl>
                         {showAlternateLibraryCardPassword ? (
                              <FormControl className="mb-2">
                                   <FormControlLabel>
                                        <FormControlLabelText size="sm">
                                             {passwordLabel}
                                        </FormControlLabelText>
                                   </FormControlLabel>
                                   <ThemedInput style={{ borderColor: inputBorderColor }}>
                                        <ThemedInputField textContentType="none" type={showPassword ? 'text' : 'password'} name="password" defaultValue={password} accessibilityLabel={passwordLabel} onChangeText={(value) => setPassword(value)} />
                                        <PasswordVisibilityToggle showPassword={showPassword} onPress={toggleShowPassword} />
                                   </ThemedInput>
                              </FormControl>
                         ) : null}
                    </ModalBody>
                    <ModalFooter style={{ borderTopWidth: 1, borderTopColor: modalBorderColor }}>
                         <ButtonGroup space="sm">
                              <Button
                                   variant="outline"
                                   style={{ borderColor: modalBorderColor }}
                                   onPress={() => {
                                        setShowModal(false);
                                        setLoading(false);
                                   }}>
                                   <ButtonText style={{ color: textColor }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                              </Button>
                              <Button
                                   colorScheme="primary"
                                   isDisabled={loading}
                                   onPress={async () => {
                                        setLoading(true);
                                        await completeAction(id, action, activeAccount, '', '', location, null, null, library.baseUrl, volume, holdType, holdNotificationPreferences, item).then(async (result) => {
                                             setResponse(result);
                                             logDebugMessage("Completed Action after add alternate library card");
                                             if (result) {
                                                  if (result.success === true || result.success === 'true') {
                                                       queryClient.invalidateQueries({ queryKey: ['holds', user.id, library.baseUrl, language] });
                                                       queryClient.invalidateQueries({ queryKey: ['checkouts', user.id, library.baseUrl, language] });
                                                       await refreshAndSaveUserProfile();
                                                  }

                                                  if (result?.confirmationNeeded && result.confirmationNeeded === true) {
                                                       let tmp = holdConfirmationResponse;
                                                       const obj = {
                                                            message: result.message,
                                                            title: result.title,
                                                            confirmationNeeded: result.confirmationNeeded ?? false,
                                                            confirmationId: result.confirmationId ?? null,
                                                            recordId: id ?? null };
                                                       tmp = _.merge(obj, tmp);
                                                       setHoldConfirmationResponse(tmp);
                                                  }

                                                  if (result?.shouldBeItemHold && result.shouldBeItemHold === true) {
                                                       let tmp = holdSelectItemResponse;
                                                       const obj = {
                                                            message: result.message,
                                                            title: 'Select an Item',
                                                            patronId: activeAccount,
                                                            pickupLocation: location,
                                                            bibId: id ?? null,
                                                            items: result.items ?? [] };

                                                       tmp = _.merge(obj, tmp);
                                                       setHoldSelectItemResponse(tmp);
                                                  }

                                                  setLoading(false);
                                                  setShowModal(false);
                                                  if (result?.confirmationNeeded && result.confirmationNeeded) {
                                                       setHoldConfirmationIsOpen(true);
                                                  } else if (result?.shouldBeItemHold && result.shouldBeItemHold) {
                                                       setHoldItemSelectIsOpen(true);
                                                  } else {
                                                       setResponseIsOpen(true);
                                                  }
                                             }
                                        });
                                   }}>
                                  {loading ? <ButtonSpinner color={runtimeColors.primary['500-text']} /> : <ButtonText>{title}</ButtonText>}
                              </Button>
                         </ButtonGroup>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};
