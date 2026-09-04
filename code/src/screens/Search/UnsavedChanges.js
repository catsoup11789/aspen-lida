import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { CloseIcon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { SearchGlobal } from '../../util/globals';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { useTheme } from '../../themes/theme';

/**
 * UnsavedChangesExit component that displays a confirmation dialog when the user attempts to exit with unsaved changes. It provides options to save changes, discard changes, or cancel the exit action.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const UnsavedChangesExit = (props) => {
     const { updateSearch, discardChanges, language, hasPendingChanges } = props;
     const { theme, runtimeColors, colorMode, textColor } = useTheme();
     const navigation = useNavigation();
     const [isOpen, setIsOpen] = React.useState(false);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);

     const closeModal = () => {
          navigation.getParent()?.goBack();
     };

     function getStatus() {
          const pendingChanges = typeof hasPendingChanges === 'function' ? hasPendingChanges() : SearchGlobal.hasPendingChanges;
          if (pendingChanges) {
               // if pending changes found, pop alert to confirm close
               setIsOpen(true);
          } else {
               // if no pending changes, just close it
               closeModal();
          }
     }

     // update parameters, then go to search results screen
     const updateClose = () => {
          updateSearch(false);
          SearchGlobal.hasPendingChanges = false;
          setIsOpen(false);
     };

     // remove pending parameters, then go back to original search results screen
     const forceClose = () => {
          discardChanges();
          setIsOpen(false);
          SearchGlobal.hasPendingChanges = false;
          closeModal();
     };

     return (
          <Center>
               <Pressable onPress={() => getStatus()}>
                    <CloseIcon size="lg" style={{ color: textColor }} />
               </Pressable>
               <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose} useRNModal={true}>
                    <AlertDialogBackdrop/>
                    <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.surfaceSoft.light : theme.tokens.colors.ui.surfaceSoft.dark }}>
                         <AlertDialogHeader>
                              <Heading style={{ color: textColor }}>{getTermFromDictionary(language, 'discard_changes')}</Heading>
                         </AlertDialogHeader>
                         <AlertDialogBody>
                              <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'unsaved_changes_warning')}</Text>
                         </AlertDialogBody>
                         <AlertDialogFooter>
                              <ButtonGroup space="sm">
                                   <Button style={{ backgroundColor: runtimeColors.primary[500] }} onPress={updateClose} ref={cancelRef}>
                                        <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'save')}</ButtonText>
                                   </Button>
                                   <Button variant="link" onPress={forceClose}>
                                        <ButtonText style={{ color: theme.tokens.colors.ui.danger }}>{getTermFromDictionary(language, 'discard')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
};
