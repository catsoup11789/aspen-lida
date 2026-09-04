import { ThemedButton as Button, ThemedButtonText as ButtonText } from '../../components/themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import React from 'react';
import { updateOverDriveEmail } from '../../util/api/user';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { ThemedCheckbox as Checkbox, ThemedCheckboxIcon as CheckboxIcon, ThemedCheckboxIndicator as CheckboxIndicator, ThemedCheckboxLabel as CheckboxLabel } from '../../components/themed/ThemedCheckbox';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { CheckIcon } from '@/components/ui/icon';
import { ThemedInput as Input, ThemedInputField as InputField } from '../../components/themed/ThemedFormControls';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { VStack } from '@/components/ui/vstack';

export const GetOverDriveSettings = (props) => {
     const { promptTitle, promptItemId, promptSource, promptPatronId, promptForOverdriveEmail, libraryUrl, showOverDriveSettings, handleOverDriveSettings, showAlert, setEmail, setRememberPrompt, overdriveEmail, language } = props;

     return (
          <Modal isOpen={showOverDriveSettings} onClose={() => handleOverDriveSettings(false)}>
               <ModalBackdrop />
               <ModalContent>
                    <ModalHeader style={{ borderBottomWidth: 0 }}>
                         <Heading>{promptTitle}</Heading>
                         <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody style={{ marginTop: 16 }}>
                         <FormControl>
                              <VStack space="md">
                                   <FormControlLabel>
                                        <FormControlLabelText>{getTermFromDictionary(language, 'overdrive_email_field')}</FormControlLabelText>
                                   </FormControlLabel>
                                   <Input>
                                        <InputField autoCapitalize="none" autoCorrect={false} onChangeText={(text) => setEmail(text)} />
                                   </Input>
                                   <Checkbox value="yes" size="md" onChange={(isSelected) => setRememberPrompt(isSelected)}>
                                        <CheckboxIndicator style={{ marginRight: 8 }}>
                                             <CheckboxIcon as={CheckIcon} />
                                        </CheckboxIndicator>
                                        <CheckboxLabel>{getTermFromDictionary(language, 'remember_settings')}</CheckboxLabel>
                                   </Checkbox>
                              </VStack>
                         </FormControl>
                    </ModalBody>
                    <ModalFooter style={{ borderTopWidth: 0 }}>
                         <ButtonGroup space="md" size="md">
                              <Button action="secondary" variant="ghost" onPress={() => handleOverDriveSettings(false)}>
                                   <ButtonText>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                              </Button>
                              <Button
                                   action="primary"
                                   onPress={async () => {
                                        await updateOverDriveEmail(promptItemId, promptSource, promptPatronId, overdriveEmail, promptForOverdriveEmail, libraryUrl, language).then((response) => {
                                             showAlert(response);
                                        });
                                   }}>
                                   <ButtonText>{getTermFromDictionary(language, 'place_hold')}</ButtonText>
                              </Button>
                         </ButtonGroup>
                    </ModalFooter>
               </ModalContent>
          </Modal>
     );
};
