import React, { useState } from 'react';
import { Button, ButtonText, ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { useUserState, useUpdateUserProfile, useUpdateAccounts, useUpdateViewers } from '@/src/hooks/useUserData';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { disableAccountLinking, refreshProfile, getLinkedAccounts, getViewerAccounts } from '@/src/util/api/user';
import { formatLinkedAccounts } from '@/src/util/api/userHelper';
import { toArray } from '@/src/helpers/helpers';
import { useActiveLanguage } from '@/src/hooks/useLanguageData';
import { useTheme } from '@/src/themes/theme';
import { useLibrary } from '@/src/hooks/useLibrarySystemData';
import { ThemedCloseIcon } from '@/src/components/themed/ThemedFormControls';

/**
 * DisableAccountLinking component that allows users to disable account linking. It displays a button that opens a modal where users can confirm disabling account linking. The component handles API calls to disable account linking and refreshes the linked accounts, viewer accounts, and user profile upon successful completion.
 * @returns {React.JSX.Element}
 * @constructor
 */
const DisableAccountLinking = () => {
     const library = useLibrary();
     const language = useActiveLanguage();
     const { textColor, theme, runtimeColors, colorMode } = useTheme();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const updateAccounts = useUpdateAccounts();
     const updateViewers = useUpdateViewers();
     const [loading, setLoading] = useState(false);
     const [showModal, setShowModal] = useState(false);
     const modalBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

     const toggle = () => {
          setShowModal(!showModal);
          setLoading(false);
     };

     const refreshLinkedAccounts = async () => {
          const linkedResponse = await getLinkedAccounts(library.baseUrl, language);
          if (linkedResponse?.ok) {
               const formatted = formatLinkedAccounts(user, [], library.barcodeStyle, linkedResponse.data.result.linkedAccounts);
               await updateAccounts(formatted.accounts);
          }

          const viewerResponse = await getViewerAccounts(library.baseUrl, language);
          if (viewerResponse?.ok) {
               const viewerList = toArray(viewerResponse.data?.result?.viewers ?? []);
               await updateViewers(viewerList);
          }

          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     };

     return (
          <Center>
               <Button onPress={toggle} style={{ backgroundColor: runtimeColors.primary[500] }}>
                    <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'disable_linked_accounts')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="lg">
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: modalBg, maxWidth: '95%' }}>
                         <ModalHeader>
                              <Heading size="sm" style={{ color: textColor }}>{getTermFromDictionary(language, 'disable_linked_accounts_title')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <ThemedCloseIcon />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'disable_linked_accounts_body')}</Text>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="link" onPress={toggle}>
                                       <ButtonText style={{ color: runtimeColors.primary[500] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                   <Button
                                       style={{ backgroundColor: runtimeColors.primary[500] }}
                                        isLoading={loading}
                                        isLoadingText={getTermFromDictionary(language, 'updating', true)}
                                        onPress={async () => {
                                             setLoading(true);
                                             await disableAccountLinking(library.baseUrl).then(async (r) => {
                                                  await refreshLinkedAccounts();
                                                  toggle();
                                             });
                                        }}>
                                      <ButtonText style={{ color: runtimeColors.primary['500-text'] }}>{getTermFromDictionary(language, 'accept')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
};

export default DisableAccountLinking;
