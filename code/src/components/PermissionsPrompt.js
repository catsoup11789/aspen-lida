import * as Linking from 'expo-linking';
import React from 'react';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { ThemedButton as Button, ThemedButtonText as ButtonText } from './themed/ThemedButton';
import { ButtonGroup } from '@/components/ui/button';
import { ThemedHeading as Heading } from '@/src/components/themed/ThemedHeading';
import { ThemedText as Text } from '@/src/components/themed/ThemedText';
import { getTermFromDictionary } from '../translations/TranslationService';
import { useActiveLanguage } from '../hooks/useLanguageData';
import { useTheme } from '../themes/theme';

/**
 * PermissionsPrompt component for displaying a prompt to the user requesting permissions.
 * @param data
 * @returns {React.JSX.Element}
 * @constructor
 */
export const PermissionsPrompt = (data) => {
     const { promptTitle, promptBody, setShouldRequestPermissions, updateStatus } = data;
     const { uiColors, colorMode } = useTheme();
     const language = useActiveLanguage();
     const [isOpen, setIsOpen] = React.useState(true);
     const onClose = () => {
          updateStatus();
          setShouldRequestPermissions(false);
          setIsOpen(false);
     };
     const cancelRef = React.useRef(null);
     return (
          <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
               <AlertDialogBackdrop />
               <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surfaceSoft.light : uiColors.surfaceSoft.dark }}>
                    <AlertDialogHeader><Heading size="md">{getTermFromDictionary(language, promptTitle)}</Heading></AlertDialogHeader>
                    <AlertDialogBody><Text>{getTermFromDictionary(language, promptBody)}</Text></AlertDialogBody>
                    <AlertDialogFooter>
                         <ButtonGroup space="md">
                              <Button style={{ backgroundColor: uiColors.surface.light }} onPress={onClose} ref={cancelRef}>
                                   <ButtonText style={{ color: uiColors.text.light }}>{getTermFromDictionary(language, 'permissions_cancel')}</ButtonText>
                              </Button>
                              <Button
                                   style={{ backgroundColor: uiColors.danger }}
                                   onPress={() => {
                                        onClose();
                                        Linking.openSettings();
                                   }}>
                                   <ButtonText style={{ color: uiColors.white }}>{getTermFromDictionary(language, 'permissions_update_settings')}</ButtonText>
                              </Button>
                         </ButtonGroup>
                    </AlertDialogFooter>
               </AlertDialogContent>
          </AlertDialog>
     );
};
