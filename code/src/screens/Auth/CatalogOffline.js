import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import _ from 'lodash';
import { useCatalogStatus } from '../../hooks/useLibrarySystemData';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { logInfoMessage } from '../../util/logging';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';

/**
 * CatalogOffline component that displays an alert dialog when the catalog is offline, allowing the user to sign out.
 * @returns {React.JSX.Element|null}
 * @constructor
 */
export const CatalogOffline = () => {
      const language = useActiveLanguage();
     const { status: catalogStatus, message: catalogStatusMessage } = useCatalogStatus();
     const { signOut } = React.useContext(AuthContext);
     const { theme, uiColors, textColor, colorMode, runtimeColors } = useTheme();
     const surfaceBg = colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark;
     const [isOpen, setIsOpen] = React.useState(true);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);

     logInfoMessage('CatalogOffline: ' + catalogStatus);

     if (catalogStatus > 0 && !_.isUndefined(theme)) {
          return (
               <Center>
                    <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                         <AlertDialogBackdrop />

                         <AlertDialogContent style={{ backgroundColor: surfaceBg }}>
                              <AlertDialogHeader>
                                  <Heading style={{ color: textColor }}>{getTermFromDictionary(language, 'catalog_offline')}</Heading>
                              </AlertDialogHeader>
                              <AlertDialogBody>
                                  <Text style={{ color: textColor }}>{catalogStatusMessage ? catalogStatusMessage : getTermFromDictionary(language, 'catalog_offline_message')}</Text>
                              </AlertDialogBody>
                              <AlertDialogFooter>
                                   <ButtonGroup space="md">
                                       <Button onPress={signOut} style={{ backgroundColor: runtimeColors.primary[500] }} ref={cancelRef}>
                                            <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                        </Button>
                                   </ButtonGroup>
                              </AlertDialogFooter>
                         </AlertDialogContent>
                    </AlertDialog>
               </Center>
          );
     }

     if (catalogStatus > 0) {
          return (
               <Center>
                    <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                         <AlertDialogBackdrop />

                         <AlertDialogContent>
                              <AlertDialogHeader>
                                   <Heading>{getTermFromDictionary(language, 'catalog_offline')}</Heading>
                              </AlertDialogHeader>
                              <AlertDialogBody>
                                   <Text>{catalogStatusMessage ? catalogStatusMessage : getTermFromDictionary(language, 'catalog_offline_message')}</Text>
                              </AlertDialogBody>
                              <AlertDialogFooter>
                                   <ButtonGroup space="md">
                                        <Button onPress={signOut} ref={cancelRef}>
                                             <ButtonText>{getTermFromDictionary(language, 'button_ok')}</ButtonText>
                                        </Button>
                                   </ButtonGroup>
                              </AlertDialogFooter>
                         </AlertDialogContent>
                    </AlertDialog>
               </Center>
          );
     }

     return null;
};
