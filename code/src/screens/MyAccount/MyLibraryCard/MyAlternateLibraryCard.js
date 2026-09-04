import _ from 'lodash';
import { EyeOff, Eye } from 'lucide-react-native';
import React from 'react';
import { useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useQueryClient } from '@tanstack/react-query';
import { useRoute, useNavigation, CommonActions, StackActions } from '@react-navigation/native';
import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { LoadingSpinner } from '../../../components/loadingSpinner';
import { SystemMessagesContext } from '../../../context/initialContext';

// custom components and helper files
import { useUserState, useUpdateUserProfile } from '../../../hooks/useUserData';
import { DisplaySystemMessage } from '../../../components/Notifications';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import { refreshProfile, updateAlternateLibraryCard } from '../../../util/api/user';
import { decodeHTML } from '../../../helpers/helpers';
import { logDebugMessage, logWarnMessage, getErrorMessage } from '../../../util/logging';
import { useLibrary } from '../../../hooks/useLibrarySystemData';
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';

export const MyAlternateLibraryCard = () => {
     const navigation = useNavigation();
     const route = useRoute();
     const library = useLibrary();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();
     const queryClient = useQueryClient();
     const inputBorderColor = colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark;
     const { systemMessages, updateSystemMessages } = React.useContext(SystemMessagesContext);
     const { width } = useWindowDimensions();
     const [card, setCard] = React.useState(user?.alternateLibraryCard ?? '');
     const [password, setPassword] = React.useState(user?.alternateLibraryCardPassword ?? '');

     React.useEffect(() => {
          setCard(user?.alternateLibraryCard ?? '');
          setPassword(user?.alternateLibraryCardPassword ?? '');
     }, [user]);

     const [isLoading, setIsLoading] = React.useState(false);
     const [showPassword, setShowPassword] = React.useState(false);
     const toggleShowPassword = () => setShowPassword(!showPassword);

     const handleGoBack = () => {
          logDebugMessage("Handling go back");
          logDebugMessage(route?.params);
          if (route?.params?.prevRoute === 'AccountDrawer') {
               navigation.dispatch(CommonActions.setParams({ prevRoute: null }));
               navigation.dispatch(StackActions.replace('LibraryCard'));
          } else {
               navigation.goBack();
          }
     };

     let cardLabel = getTermFromDictionary(language, 'alternate_library_card');
     let passwordLabel = getTermFromDictionary(language, 'password');
     let formMessage = '';
     let showAlternateLibraryCardPassword = false;
     if (library?.alternateLibraryCardConfig?.alternateLibraryCardLabel) {
          cardLabel = library.alternateLibraryCardConfig.alternateLibraryCardLabel;
     }

     if (library?.alternateLibraryCardConfig?.alternateLibraryCardPasswordLabel) {
          passwordLabel = library.alternateLibraryCardConfig.alternateLibraryCardPasswordLabel;
     }

     if (library?.alternateLibraryCardConfig?.alternateLibraryCardFormMessage) {
          formMessage = decodeHTML(library.alternateLibraryCardConfig.alternateLibraryCardFormMessage);
     }

     if (library?.alternateLibraryCardConfig?.showAlternateLibraryCardPassword) {
          if (library.alternateLibraryCardConfig.showAlternateLibraryCardPassword === '1' || library.alternateLibraryCardConfig.showAlternateLibraryCardPassword === 1) {
               showAlternateLibraryCardPassword = true;
          }
     }

     const showSystemMessage = () => {
          if (_.isArray(systemMessages)) {
               return systemMessages.map((obj, index) => {
                    if (obj.showOn === '0' || obj.showOn === '1' || obj.showOn === '5') {
                         return <DisplaySystemMessage key={obj.id || index} style={obj.style} message={obj.message} dismissable={obj.dismissable} id={obj.id} all={systemMessages} url={library.baseUrl} updateSystemMessages={updateSystemMessages} queryClient={queryClient} />;
                    }
               });
          }
          return null;
     };

     const source = {
          baseUrl: library.baseUrl,
          html: formMessage };

     const tagsStyles = {
          body: {
               color: textColor },
          a: {
               color: textColor,
               textDecorationColor: textColor } };

     const deleteCard = async () => {
          await updateAlternateLibraryCard('', '', true, library.baseUrl, language);
          await refreshProfile(library.baseUrl).then(async (data) => {
               if(data.ok) {
                    await updateUserProfile(data.data.result.profile);
               } else {
                    logWarnMessage('Could not refresh profile after deleting alternate library card.');
                    logDebugMessage(data);
                    getErrorMessage(data.code ?? 0, data.problem);
               }
          });
     };

     const updateCard = async () => {
          await updateAlternateLibraryCard(card, password, false, library.baseUrl, language);
          await refreshProfile(library.baseUrl).then(async (data) => {
               if(data.ok) {
                    await updateUserProfile(data.data.result.profile);
               } else {
                    logWarnMessage('Could not refresh profile after updating alternate library card.');
                    logDebugMessage(data);
                    getErrorMessage(data.code ?? 0, data.problem);
               }
          });
     };

     return (
          <ScrollView>
               {isLoading ? (
                    <LoadingSpinner />
               ) : (
                    <Box style={{ padding: 20 }}>
                         {showSystemMessage()}
                         <Box>
                              {formMessage ? <RenderHtml contentWidth={width} source={source} tagsStyles={tagsStyles} /> : null}
                              <FormControl style={{ marginBottom: 8 }}>
                                   <FormControlLabel>
                                        <FormControlLabelText size="sm" style={{ color: textColor }}>
                                             {cardLabel}
                                        </FormControlLabelText>
                                   </FormControlLabel>
                                   <Input style={{ borderColor: inputBorderColor }}>
                                        <InputField textContentType="none" style={{ color: textColor }} name="card" value={card} accessibilityLabel={cardLabel} onChangeText={(value) => setCard(value)} />
                                   </Input>
                              </FormControl>
                              {showAlternateLibraryCardPassword ? (
                                   <FormControl style={{ marginBottom: 8 }}>
                                        <FormControlLabel>
                                             <FormControlLabelText size="sm" style={{ color: textColor }}>
                                                  {passwordLabel}
                                             </FormControlLabelText>
                                        </FormControlLabel>
                                        <Input style={{ borderColor: inputBorderColor }}>
                                             <InputField textContentType="none" type={showPassword ? 'text' : 'password'} style={{ color: textColor }} name="password" value={password} accessibilityLabel={passwordLabel} onChangeText={(value) => setPassword(value)} />
                                             <InputSlot onPress={toggleShowPassword}>
                                                  <InputIcon as={showPassword ? Eye : EyeOff} style={{ marginRight: 8, color: textColor }} />
                                             </InputSlot>
                                        </Input>
                                   </FormControl>
                              ) : null}
                              <ButtonGroup>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        onPress={() => {
                                             setIsLoading(true);
                                             updateCard().then(() => {
                                                  setIsLoading(false);
                                             });
                                        }}>
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>{getTermFromDictionary(language, 'update')}</ButtonText>
                                   </Button>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.ui.danger }}
                                        onPress={() => {
                                             setIsLoading(true);
                                             deleteCard().then(() => {
                                                  setIsLoading(false);
                                             });
                                        }}>
                                        <ButtonText style={{ color: theme.tokens.colors.ui.white }}>{getTermFromDictionary(language, 'delete')}</ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </Box>
                    </Box>
               )}
          </ScrollView>
     );
};
