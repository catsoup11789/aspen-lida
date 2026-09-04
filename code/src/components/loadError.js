import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button, ButtonGroup, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

// custom components and helper files
import { getTermFromDictionary } from '../translations/TranslationHelper';

import { useActiveLanguage } from '../hooks/useLanguageData';
import { useTheme } from '../themes/theme';

/**
 * Catch an error and display it to the user
 * <ul>
 *     <li>error - The error array that contains title and message objects</li>
 *     <li>reloadAction - The name of the component that would result in a reload of the screen (optional)</li>
 * </ul>
 * @param {string} error
 * @param {string} reloadAction
 **/
export const LoadError = (props) => {
     const { error, reloadAction } = props;
     const { theme, textColor } = useTheme();

     return (
          <Center style={{ flex: 1 }}>
               <HStack>
                    <MaterialIcons name="error" size={18} color={theme.tokens.colors.ui.danger} style={{ marginRight: 4 }} />
                    <Heading style={{ color: theme.tokens.colors.ui.danger, marginBottom: 8 }}>
                         {getTermFromDictionary('en', 'error')}
                    </Heading>
               </HStack>
               <Text bold style={{ width: '75%', textAlign: 'center', color: textColor }}>
                    {getTermFromDictionary('en', 'error_loading_results')}
               </Text>
               {reloadAction ? (
                   <Button onPress={reloadAction} style={{ marginTop: 20, backgroundColor: theme.tokens.colors.primary['500'] }}>
                         <ButtonIcon>
                              <MaterialIcons name="refresh" size={16} color={theme.tokens.colors.primary['500-text']} />
                         </ButtonIcon>
                         <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary('en', 'button_reload')}</ButtonText>
                    </Button>
               ) : null}
               <Text size="xs" style={{ width: '75%', marginTop: 20, color: theme.tokens.colors.ui.iconMuted.dark, textAlign: 'center' }}>
                    ERROR: {error}
               </Text>
          </Center>
     );
}

export function loadError(error, reloadAction = '') {
     return <LoadError error={error} reloadAction={reloadAction} />;
}


export const DisplayErrorAlertDialog = (props) => {
     const { title, message } = props;
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();
     const [isOpen, setIsOpen] = React.useState(true);
     const onClose = () => setIsOpen(false);
     const cancelRef = React.useRef(null);

     return (
          <Center>
               <AlertDialog leastDestructiveRef={cancelRef} isOpen={isOpen} onClose={onClose}>
                    <AlertDialogBackdrop />
                    <AlertDialogContent style={{ backgroundColor: colorMode === 'light' ? theme.tokens.colors.ui.surfaceSoft.light : theme.tokens.colors.ui.surfaceSoft.dark }}>
                    <AlertDialogHeader>
                        <Heading style={{ color: textColor }}>{title}</Heading>
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        <Text style={{ color: textColor }}>{message}</Text>
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <ButtonGroup space="md">
                            <Button onPress={onClose} style={{ backgroundColor: theme.tokens.colors.primary['500'] }} ref={cancelRef}>
                                <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                            </Button>
                        </ButtonGroup>
                    </AlertDialogFooter>
                    </AlertDialogContent>
               </AlertDialog>
          </Center>
     );
}
