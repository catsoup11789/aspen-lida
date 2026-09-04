import _ from 'lodash';
import React from 'react';
import { loadingSpinner } from '../../components/loadingSpinner';

import { useLibrary } from '../../hooks/useLibrarySystemData';
import { getTermFromDictionary, getTranslationWithValuesText } from '../../translations/TranslationService';
import { normalizeDisplayText } from '../../helpers/helpers';
import { LIBRARY } from '../../util/globals';
import { logDebugMessage, getErrorMessage } from '../../util/logging';
import { resetPassword } from '../../util/api/user';
import { useTheme } from '../../themes/theme';
import { Button, ButtonText, ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CloseIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';

function ResultFooter({ textColor, onClose, onRetry, retryLabel = 'try_again', showRetry = false, primaryColor, primaryTextColor, okLabel = 'button_ok' }) {
     return (
          <ModalFooter>
               <ButtonGroup space="sm">
                    <Button variant="link" onPress={onClose}>
                         <ButtonText style={{ color: textColor }}>{getTermFromDictionary('en', okLabel)}</ButtonText>
                    </Button>
                    {showRetry ? (
                         <Button style={{ backgroundColor: primaryColor }} onPress={onRetry}>
                              <ButtonText style={{ color: primaryTextColor }}>{getTermFromDictionary('en', retryLabel)}</ButtonText>
                         </Button>
                    ) : null}
               </ButtonGroup>
          </ModalFooter>
     );
}

function ResetForm({ resetBody, usernameLabel, emailLabel, username, setUsername, email, setEmail, onSubmit, fieldRef, textColor, borderColor, submitLabel, isProcessing, primaryColor, primaryTextColor, onClose }) {
     return (
          <>
               <ModalBody>
                    <Text style={{ color: textColor, marginBottom: 8 }}>{resetBody}</Text>
                    <FormControl style={{ marginBottom: emailLabel ? 8 : 0 }}>
                         <FormControlLabel>
                              <FormControlLabelText size="sm" style={{ color: textColor }}>{usernameLabel}</FormControlLabelText>
                         </FormControlLabel>
                         <Input style={{ borderColor }}>
                              <InputField
                                   id="username"
                                   autoCorrect={false}
                                   autoCapitalize="none"
                                   size="xl"
                                   returnKeyType={emailLabel ? 'next' : 'done'}
                                   enterKeyHint={emailLabel ? 'next' : 'done'}
                                   onChangeText={(text) => setUsername(text)}
                                   onSubmitEditing={() => {
                                        if (fieldRef?.current) {
                                             fieldRef.current.focus();
                                        } else {
                                             onSubmit();
                                        }
                                   }}
                                   blurOnSubmit={!emailLabel}
                                   textContentType="username"
                                   style={{ color: textColor }}
                                   value={username}
                              />
                         </Input>
                    </FormControl>
                    {emailLabel ? (
                         <FormControl>
                              <FormControlLabel>
                                   <FormControlLabelText size="sm" style={{ color: textColor }}>{emailLabel}</FormControlLabelText>
                              </FormControlLabel>
                              <Input style={{ borderColor }}>
                                   <InputField
                                        id="email"
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        size="xl"
                                        enterKeyHint="done"
                                        returnKeyType="done"
                                        onChangeText={(text) => setEmail(text)}
                                        textContentType="emailAddress"
                                        ref={fieldRef}
                                        onSubmitEditing={onSubmit}
                                        style={{ color: textColor }}
                                        value={email}
                                   />
                              </Input>
                         </FormControl>
                    ) : null}
               </ModalBody>
               <ModalFooter>
                    <ButtonGroup space="sm">
                         <Button variant="link" onPress={onClose}>
                              <ButtonText style={{ color: textColor }}>{getTermFromDictionary('en', 'cancel')}</ButtonText>
                         </Button>
                         <Button isLoading={isProcessing} isLoadingText={getTermFromDictionary('en', 'button_processing', true)} style={{ backgroundColor: primaryColor }} onPress={onSubmit}>
                              <ButtonText style={{ color: primaryTextColor }}>{submitLabel}</ButtonText>
                         </Button>
                    </ButtonGroup>
               </ModalFooter>
          </>
     );
}

function useResetPasswordState(setShowForgotPasswordModal, setIsProcessing) {
     const [showResults, setShowResults] = React.useState(false);
     const [results, setResults] = React.useState('');
     const [hasError, setHasError] = React.useState(false);

     const closeWindow = () => {
          setShowForgotPasswordModal(false);
          setIsProcessing(false);
          setShowResults(false);
          setResults('');
          setHasError(false);
     };

     const resetWindow = () => {
          setShowResults(false);
          setResults('');
          setHasError(false);
     };

     return {
          showResults,
          setShowResults,
          results,
          setResults,
          hasError,
          setHasError,
          closeWindow,
          resetWindow,
     };
}

function renderStandardResults({ results, showResults, hasError, textColor, closeWindow, resetWindow, primaryColor, primaryTextColor, successHasResend = false, onResend }) {
     if (results && showResults && !hasError) {
          if (_.isEmpty(results.success) && results.error) {
               return (
                    <>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{normalizeDisplayText(results.error)}</Text>
                         </ModalBody>
                         <ResultFooter
                              textColor={textColor}
                              onClose={closeWindow}
                              onRetry={resetWindow}
                              showRetry
                              primaryColor={primaryColor}
                              primaryTextColor={primaryTextColor}
                         />
                    </>
               );
          }

          if (!_.isEmpty(results.message)) {
               return (
                    <>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{normalizeDisplayText(results.message)}</Text>
                              {successHasResend ? (
                                   <Center>
                                        <Button size="sm" style={{ backgroundColor: primaryColor, marginTop: 12 }} onPress={onResend}>
                                             <ButtonText style={{ color: primaryTextColor }}>{getTermFromDictionary('en', 'resend_email')}</ButtonText>
                                        </Button>
                                   </Center>
                              ) : null}
                         </ModalBody>
                         <ResultFooter
                              textColor={textColor}
                              onClose={closeWindow}
                              primaryColor={primaryColor}
                              primaryTextColor={primaryTextColor}
                         />
                    </>
               );
          }

          return (
               <>
                    <ModalBody>
                         <Text style={{ color: textColor }}>{getTermFromDictionary('en', 'password_reset_success_body_1')}</Text>
                         <Text style={{ color: textColor }}>{getTermFromDictionary('en', 'password_reset_success_body_2')}</Text>
                         {successHasResend ? (
                              <Center>
                                   <Button size="sm" style={{ backgroundColor: primaryColor, marginTop: 12 }} onPress={onResend}>
                                        <ButtonText style={{ color: primaryTextColor }}>{getTermFromDictionary('en', 'resend_email')}</ButtonText>
                                   </Button>
                              </Center>
                         ) : null}
                    </ModalBody>
                    <ResultFooter
                         textColor={textColor}
                         onClose={closeWindow}
                         primaryColor={primaryColor}
                         primaryTextColor={primaryTextColor}
                    />
               </>
          );
     }

     if (showResults && hasError) {
          return (
               <>
                    <ModalBody>
                         <Text style={{ color: textColor }}>{normalizeDisplayText(results)}</Text>
                    </ModalBody>
                    <ResultFooter
                         textColor={textColor}
                         onClose={closeWindow}
                         okLabel="cancel"
                         primaryColor={primaryColor}
                         primaryTextColor={primaryTextColor}
                    />
               </>
          );
     }

     return null;
}

function AspenResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [username, setUsername] = React.useState('');
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, '', false, 'aspen', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     const renderedResults = renderStandardResults({
          results,
          showResults,
          hasError,
          textColor,
          closeWindow,
          resetWindow,
          primaryColor: theme.tokens.colors.primary['500'],
          primaryTextColor: theme.tokens.colors.primary['500-text'],
     });

     if (renderedResults) {
          return renderedResults;
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               username={username}
               setUsername={setUsername}
               onSubmit={initiateResetPassword}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

function KohaResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [email, setEmail] = React.useState('');
     const [username, setUsername] = React.useState('');
     const [resend, setResend] = React.useState(false);
     const fieldRef = React.useRef();
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, email, resend, 'koha', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     const renderedResults = renderStandardResults({
          results,
          showResults,
          hasError,
          textColor,
          closeWindow,
          resetWindow,
          primaryColor: theme.tokens.colors.primary['500'],
          primaryTextColor: theme.tokens.colors.primary['500-text'],
          successHasResend: true,
          onResend: () => {
               setResend(true);
               initiateResetPassword();
          },
     });

     if (renderedResults) {
          return renderedResults;
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               emailLabel={getTermFromDictionary('en', 'patron_email')}
               username={username}
               setUsername={setUsername}
               email={email}
               setEmail={setEmail}
               onSubmit={initiateResetPassword}
               fieldRef={fieldRef}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

function SirsiResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [username, setUsername] = React.useState('');
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, '', false, 'sirsi', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     const renderedResults = renderStandardResults({
          results,
          showResults,
          hasError,
          textColor,
          closeWindow,
          resetWindow,
          primaryColor: theme.tokens.colors.primary['500'],
          primaryTextColor: theme.tokens.colors.primary['500-text'],
     });

     if (renderedResults) {
          return renderedResults;
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               username={username}
               setUsername={setUsername}
               onSubmit={initiateResetPassword}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

const HorizonResetPassword = SirsiResetPassword;

function EvergreenResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [email, setEmail] = React.useState('');
     const [username, setUsername] = React.useState('');
     const [resend, setResend] = React.useState(false);
     const fieldRef = React.useRef();
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, email, resend, 'evergreen', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     const renderedResults = renderStandardResults({
          results,
          showResults,
          hasError,
          textColor,
          closeWindow,
          resetWindow,
          primaryColor: theme.tokens.colors.primary['500'],
          primaryTextColor: theme.tokens.colors.primary['500-text'],
          successHasResend: true,
          onResend: () => {
               setResend(true);
               initiateResetPassword();
          },
     });

     if (renderedResults) {
          return renderedResults;
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               emailLabel={getTermFromDictionary('en', 'patron_email')}
               username={username}
               setUsername={setUsername}
               email={email}
               setEmail={setEmail}
               onSubmit={initiateResetPassword}
               fieldRef={fieldRef}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

function SymphonyResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [username, setUsername] = React.useState('');
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, '', false, 'symphony', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     const renderedResults = renderStandardResults({
          results,
          showResults,
          hasError,
          textColor,
          closeWindow,
          resetWindow,
          primaryColor: theme.tokens.colors.primary['500'],
          primaryTextColor: theme.tokens.colors.primary['500-text'],
     });

     if (renderedResults) {
          return renderedResults;
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               username={username}
               setUsername={setUsername}
               onSubmit={initiateResetPassword}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

function MillenniumResetPassword(props) {
     const { usernameLabel, setShowForgotPasswordModal, isProcessing, setIsProcessing, modalButtonLabel, resetBody, libraryUrl, textColor, theme, borderColor } = props;
     const [username, setUsername] = React.useState('');
     const { showResults, setShowResults, results, setResults, hasError, setHasError, closeWindow, resetWindow } = useResetPasswordState(setShowForgotPasswordModal, setIsProcessing);

     const initiateResetPassword = async () => {
          setIsProcessing(true);
          await resetPassword(username, '', false, 'millennium', libraryUrl).then((response) => {
               if (response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating reset password");
                    logDebugMessage(response);
                    setHasError(true);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
               }
          });
          setIsProcessing(false);
     };

     if (results && showResults && !hasError) {
          return (
               <>
                    <ModalBody>
                         <Text style={{ color: textColor }}>{normalizeDisplayText(results.message)}</Text>
                    </ModalBody>
                    <ModalFooter>
                         <ButtonGroup space="sm">
                              <Button variant="link" onPress={closeWindow}>
                                   <ButtonText style={{ color: textColor }}>{getTermFromDictionary('en', 'button_ok')}</ButtonText>
                              </Button>
                              {!_.isEmpty(results.error) ? (
                                   <Button style={{ backgroundColor: theme.tokens.colors.primary['500'] }} onPress={resetWindow}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary('en', 'try_again')}</ButtonText>
                                   </Button>
                              ) : null}
                         </ButtonGroup>
                    </ModalFooter>
               </>
          );
     }

     if (showResults && hasError) {
          return (
               <>
                    <ModalBody>
                         <Text style={{ color: textColor }}>{normalizeDisplayText(results)}</Text>
                    </ModalBody>
                    <ResultFooter
                         textColor={textColor}
                         onClose={closeWindow}
                         okLabel="cancel"
                         primaryColor={theme.tokens.colors.primary['500']}
                         primaryTextColor={theme.tokens.colors.primary['500-text']}
                    />
               </>
          );
     }

     return (
          <ResetForm
               resetBody={resetBody}
               usernameLabel={usernameLabel}
               username={username}
               setUsername={setUsername}
               onSubmit={initiateResetPassword}
               textColor={textColor}
               borderColor={borderColor}
               submitLabel={modalButtonLabel}
               isProcessing={isProcessing}
               primaryColor={theme.tokens.colors.primary['500']}
               primaryTextColor={theme.tokens.colors.primary['500-text']}
               onClose={closeWindow}
          />
     );
}

export const ResetPassword = (props) => {
     const library = useLibrary();
     const { theme, textColor, colorMode } = useTheme();
     const surfaceBg = colorMode === 'light' ? (theme?.tokens?.colors?.ui?.surface?.light ?? '#FFFFFF') : (theme?.tokens?.colors?.ui?.surface?.dark ?? '#1F1F1F');
     const borderColor = colorMode === 'light' ? (theme?.tokens?.colors?.ui?.border?.light ?? '#6b7280') : (theme?.tokens?.colors?.ui?.border?.dark ?? '#d6d3d1');
     const { ils, forgotPasswordType, usernameLabel, passwordLabel, showForgotPasswordModal, setShowForgotPasswordModal } = props;
     const [isProcessing, setIsProcessing] = React.useState(false);
     const [isLoading, setIsLoading] = React.useState(false);

     const language = 'en';
     const libraryUrl = library.baseUrl ?? LIBRARY.url;

     const [buttonLabel, setButtonLabel] = React.useState('Forgot PIN?');
     const [modalTitle, setModalTitle] = React.useState('Forgot PIN');
     const [modalButtonLabel, setModalButtonLabel] = React.useState('Reset My PIN');
     const [resetBody, setResetBody] = React.useState('To reset your PIN, enter your card number or your email address.  You must have an email associated with your account to reset your PIN.  If you do not, please contact the library.');

     React.useEffect(() => {
          setIsLoading(true);

          async function fetchTranslations() {
               setButtonLabel(await getTranslationWithValuesText('forgot_password_link', passwordLabel, language, libraryUrl, true));
               setModalTitle(await getTranslationWithValuesText('forgot_password_title', passwordLabel, language, libraryUrl, true));
               setModalButtonLabel(await getTranslationWithValuesText('reset_my_password', passwordLabel, language, libraryUrl, true));

               if (ils === 'koha') {
                    setResetBody(await getTranslationWithValuesText('koha_password_reset_body', [_.lowerCase(passwordLabel), _.lowerCase(usernameLabel)], language, libraryUrl, true));
               } else if (ils === 'sirsi' || ils === 'horizon') {
                    setResetBody(await getTranslationWithValuesText('sirsi_password_reset_body', _.lowerCase(passwordLabel), language, libraryUrl, true));
               } else if (ils === 'evergreen') {
                    setResetBody(await getTranslationWithValuesText('evergreen_password_reset_body', _.lowerCase(passwordLabel), language, libraryUrl, true));
               } else if (ils === 'millennium') {
                    setResetBody(await getTranslationWithValuesText('millennium_password_reset_body', [_.lowerCase(usernameLabel), _.lowerCase(passwordLabel)], language, libraryUrl, true));
                    setModalButtonLabel(await getTranslationWithValuesText('request_pin_reset', passwordLabel, language, libraryUrl, true));
               } else if (ils === 'symphony') {
                    setResetBody(await getTranslationWithValuesText('symphony_password_reset_body', _.lowerCase(usernameLabel), language, libraryUrl, true));
               } else {
                    setResetBody(await getTranslationWithValuesText('aspen_password_reset_body', [_.lowerCase(passwordLabel), _.lowerCase(usernameLabel)], language, libraryUrl, true));
               }
               setIsLoading(false);
          }

          fetchTranslations();
     }, [ils, language, libraryUrl, passwordLabel, usernameLabel]);

     const sharedProps = {
          libraryUrl,
          usernameLabel,
          passwordLabel,
          modalButtonLabel,
          resetBody,
          setShowForgotPasswordModal,
          isProcessing,
          setIsProcessing,
          theme,
          textColor,
          borderColor,
          colorMode,
     };

     const resetPasswordComponent =
          (ils === 'koha' && forgotPasswordType === 'emailResetLink' && <KohaResetPassword {...sharedProps} />) ||
          (ils === 'sirsi' && forgotPasswordType === 'emailResetLink' && <SirsiResetPassword {...sharedProps} />) ||
          (ils === 'horizon' && forgotPasswordType === 'emailResetLink' && <HorizonResetPassword {...sharedProps} />) ||
          (ils === 'evergreen' && forgotPasswordType === 'emailResetLink' && <EvergreenResetPassword {...sharedProps} />) ||
          (ils === 'millennium' && forgotPasswordType === 'emailResetLink' && <MillenniumResetPassword {...sharedProps} />) ||
          (ils === 'symphony' && forgotPasswordType === 'emailResetLink' && <SymphonyResetPassword {...sharedProps} />) ||
          (forgotPasswordType === 'emailAspenResetLink' && <AspenResetPassword {...sharedProps} />) ||
          null;

     return (
          <Center>
               <Button variant="link" onPress={() => setShowForgotPasswordModal(true)}>
                    <ButtonText size={buttonLabel.length > 80 ? 'sm' : undefined} style={{ color: theme.tokens.colors.primary['500'] }}>{buttonLabel}</ButtonText>
               </Button>
               <Modal isOpen={showForgotPasswordModal} size="lg" avoidKeyboard onClose={() => setShowForgotPasswordModal(false)}>
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{modalTitle}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowForgotPasswordModal(false); }}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>

                         {isLoading ? (
                              <ModalBody>{loadingSpinner()}</ModalBody>
                         ) : (
                              resetPasswordComponent
                         )}
                    </ModalContent>
               </Modal>
          </Center>
     );
};
