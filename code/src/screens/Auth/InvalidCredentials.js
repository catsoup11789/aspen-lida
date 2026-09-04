import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import {getTermFromDictionary} from '../../translations/TranslationService';
import { logDebugMessage } from '../../util/logging.js';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

/**
 * InvalidCredentials component that displays an alert dialog when the user has entered invalid credentials, allowing the user to sign out.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const InvalidCredentials = () => {
     const { theme, runtimeColors, colorMode, textColor } = useTheme();
     const surfaceBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;
     const language = useActiveLanguage();
     const { signOut } = React.useContext(AuthContext);
     const [isOpen, setIsOpen] = React.useState(true);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);
     logDebugMessage('Showing Invalid Credentials Alert');

     return (
          <Center>
               <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                    <AlertDialogBackdrop/>
                    <AlertDialogContent style={{ backgroundColor: surfaceBg }}>
                         <AlertDialogHeader><Heading style={{ color: textColor }}>{getTermFromDictionary(language, 'error')}</Heading></AlertDialogHeader>
                         <AlertDialogBody><Text style={{ color: textColor }}>{getTermFromDictionary(language, 'error_invalid_credentials')}</Text></AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup space="sm">
                                   <Button style={{ backgroundColor: runtimeColors.primary[500] }} onPress={signOut} ref={cancelRef}>
                                        <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
};
