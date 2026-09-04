import React, { useState } from 'react';
import { Button, ButtonText, ButtonGroup } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';


import { useUserState, useUpdateUserProfile, useUpdateAccounts, useUpdateViewers } from '../../../hooks/useUserData';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { disableAccountLinking, refreshProfile, getLinkedAccounts, getViewerAccounts } from '../../../util/api/user';
import { formatLinkedAccounts } from '../../../util/api/userHelper';
import { toArray } from '../../../helpers/helpers';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { useLibrary } from '../../../hooks/useLibrarySystemData';

// custom components and helper files

const DisableAccountLinking = () => {
     const library = useLibrary();
     const language = useActiveLanguage();
     const { textColor, theme, colorMode } = useTheme();
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
               <Button onPress={toggle} style={{ backgroundColor: theme.tokens.colors.primary['500'] }}>
                    <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'disable_linked_accounts')}</ButtonText>
               </Button>
               <Modal isOpen={showModal} onClose={toggle} size="lg">
                    <ModalBackdrop />
                    <ModalContent style={{ backgroundColor: modalBg, maxWidth: '95%' }}>
                         <ModalHeader>
                              <Heading size="sm" style={{ color: textColor }}>{getTermFromDictionary(language, 'disable_linked_accounts_title')}</Heading>
                              <ModalCloseButton style={{ padding: 12 }} onPress={toggle}>
                                   <Icon as={CloseIcon} style={{ color: textColor }} />
                              </ModalCloseButton>
                         </ModalHeader>
                         <ModalBody>
                              <Text style={{ color: textColor }}>{getTermFromDictionary(language, 'disable_linked_accounts_body')}</Text>
                         </ModalBody>
                         <ModalFooter>
                              <ButtonGroup>
                                   <Button variant="link" onPress={toggle}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500'] }}>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                                   </Button>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        isLoading={loading}
                                        isLoadingText={getTermFromDictionary(language, 'updating', true)}
                                        onPress={async () => {
                                             setLoading(true);
                                             await disableAccountLinking(library.baseUrl).then(async (r) => {
                                                  await refreshLinkedAccounts();
                                                  toggle();
                                             });
                                        }}>
                                       <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'accept')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>
          </Center>
     );
};

export default DisableAccountLinking;
