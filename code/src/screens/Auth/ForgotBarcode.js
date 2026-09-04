import _ from 'lodash';
import React from 'react';
import { Platform } from 'react-native';
import { getTermFromDictionary, getTranslation, getTranslationWithValuesText } from '../../translations/TranslationService';
import { stripHTML } from '../../helpers/helpers';
import { LIBRARY } from '../../util/globals';
import { useKeyboard } from '../../hooks/hooks';
import { logDebugMessage, getErrorMessage } from '../../util/logging';
import { forgotBarcode } from '../../util/api/user';
import { useTheme } from '../../themes/theme';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { ThemedCloseIcon, ThemedInput, ThemedInputField } from '../../components/themed/ThemedFormControls';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';

/**
 * ForgotBarcode component that displays a modal for users to request their forgotten barcode by entering their phone number.
 * @param props
 * @returns {React.JSX.Element|null}
 * @constructor
 */
export const ForgotBarcode = (props) => {
     const isKeyboardOpen = useKeyboard();
     const { theme, runtimeColors, textColor, colorMode }= useTheme();
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const borderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const library = useLibrary();
     const { usernameLabel, showForgotBarcodeModal, setShowForgotBarcodeModal } = props;
     const [isProcessing, setIsProcessing] = React.useState(false);
     const language = 'en';
     const [isLoading, setIsLoading] = React.useState(false);

     let libraryUrl = library.baseUrl ?? LIBRARY.url;

     const [phoneNumber, setPhoneNumber] = React.useState('');
     const [showResults, setShowResults] = React.useState(false);
     const [results, setResults] = React.useState('');
     const [hasError, setHasError] = React.useState(false);

     const [buttonLabel, setButtonLabel] = React.useState('Forgot Barcode?');
     const [modalTitle, setModalTitle] = React.useState('Forgot Barcode');
     const [fieldLabel, setFieldLabel] = React.useState('Phone Number');
     const [modalBody, setModalBody] = React.useState('');
     const [modalButtonLabel, setModalButtonLabel] = React.useState('Send My Barcode');

     React.useEffect(() => {
          setIsLoading(true);

          async function fetchTranslations() {
               setButtonLabel(await getTranslationWithValuesText('forgot_barcode_link', usernameLabel, language, libraryUrl, true));
               setModalTitle(await getTranslationWithValuesText('forgot_barcode_title', usernameLabel, language, libraryUrl, true));
               await getTranslation('Phone Number', language, libraryUrl).then((result) => {
                    let term = _.toString(result);
                    if (!term.includes('%')) {
                         setModalButtonLabel(term);
                    }
               });
               setModalButtonLabel(await getTranslationWithValuesText('send_my_barcode', usernameLabel, language, libraryUrl, true));
               setModalBody(await getTranslationWithValuesText('forgot_barcode_body', usernameLabel, language, libraryUrl, true));
               setIsLoading(false);
          }

          fetchTranslations();
     }, [language, libraryUrl]);

     const closeWindow = () => {
          setShowForgotBarcodeModal(false);
          setIsProcessing(false);
          setShowResults(false);
          setResults('');
     };

     const initiateForgotBarcode = async () => {
          setIsProcessing(true);
          await forgotBarcode(phoneNumber, libraryUrl).then((response) => {
               if(response.ok) {
                    setResults(response.data.result);
                    setShowResults(true);
                    setHasError(false);
               } else {
                    logDebugMessage("Error initiating forgot barcode");
                    logDebugMessage(response);
                    const error = getErrorMessage(response.code ?? 0, response.problem);
                    setResults(error.message);
                    setShowResults(true);
                    setHasError(true);
               }
          });
          setIsProcessing(false);
     };

     const resetWindow = () => {
          setShowResults(false);
          setResults('');
          setHasError(false);
     };

     if (isLoading) {
          return null;
     }

     const ResultsMessage = showResults && !results.success ? (
          <Text style={{ color: textColor }}>{stripHTML(results.message || getTermFromDictionary('en', 'forgot_barcode_error_message'))}</Text>
     ) : hasError ? (
          <Text style={{ color: textColor }}>{results}</Text>
     ) : showResults ? (
          <Text style={{ color: textColor }}>{stripHTML(results.message || getTermFromDictionary('en', 'forgot_barcode_success_message'))}</Text>
     ) : (
          <>
               <Text style={{ color: textColor }}>{modalBody}</Text>
               <FormControl>
                    <FormControlLabel>
                         <FormControlLabelText size="sm" style={{ color: textColor }}>{fieldLabel}</FormControlLabelText>
                    </FormControlLabel>
                    <ThemedInput style={{ borderColor }}>
                         <ThemedInputField id="phoneNumber" size="xl" returnKeyType="done" enterKeyHint="done" onChangeText={(text) => setPhoneNumber(text)} onSubmitEditing={() => initiateForgotBarcode()} textContentType="telephoneNumber"/>
                    </ThemedInput>
               </FormControl>
          </>
     );

     const FooterButtons = (showResults && !results.success) || hasError ? (
          <Button style={{ backgroundColor: runtimeColors.primary[500] }} onPress={resetWindow}>
               <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary('en', 'try_again')}</ButtonText>
          </Button>
     ) : showResults ? (
          <Button variant="link" onPress={closeWindow}>
               <ButtonText style={{ color: textColor }}>{getTermFromDictionary('en', 'button_ok')}</ButtonText>
          </Button>
     ) : (
          <>
               <Button variant="link" style={{ marginRight: 16 }} onPress={closeWindow}>
                    <ButtonText style={{ color: textColor }}>{getTermFromDictionary('en', 'cancel')}</ButtonText>
               </Button>
               <Button
                    isLoading={isProcessing}
                    isLoadingText={getTermFromDictionary('en', 'button_processing', true)}
                    style={{ backgroundColor: runtimeColors.primary[500] }}
                    onPress={initiateForgotBarcode}>
                    <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{modalButtonLabel}</ButtonText>
               </Button>
          </>
     );

     return (
          <Center>
               <Button variant="link" onPress={() => setShowForgotBarcodeModal(true)}>
                   <ButtonText style={{ color: runtimeColors.primary[500] }}>{buttonLabel}</ButtonText>
               </Button>
               <Modal isOpen={showForgotBarcodeModal} size="lg" avoidKeyboard onClose={() => setShowForgotBarcodeModal(false)} style={Platform.OS === 'android' && isKeyboardOpen ? { paddingBottom: '50%' } : undefined}>
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: surfaceBg }}>
                         <ModalHeader>
                              <Heading size="md" style={{ color: textColor }}>{modalTitle}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={() => { setShowForgotBarcodeModal(false); }}>
                                  <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              {ResultsMessage}
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup space="lg">
                                   {FooterButtons}
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
};
