import { useRoute, useNavigation } from '@react-navigation/native';
import React from 'react';
import { submitLocalIllRequestEmail } from '../../util/api/user';

import { useLibrary } from '../../hooks/useLibrarySystemData';
import { popAlert } from '../../components/feedback';
import { getTermFromDictionary } from '../../translations/TranslationService';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Textarea, TextareaInput } from '@/components/ui/textarea';
import { VStack } from '@/components/ui/vstack';

export const CreateLocalIllRequestEmail = () => {
     const route = useRoute();
     const id = route.params.id;
     const title = route.params.workTitle ?? null;
     const author = route.params.workAuthor ?? null;
     const volumeName = route.params.volumeName ?? null;
     const recordId = route.params.recordId ?? null;

     return <Request workId={id} workTitle={title} author={author} volumeName={volumeName} recordId={recordId}/>;
};

const Request = (payload) => {
     const navigation = useNavigation();
     const { workTitle, author, volumeName, recordId} = payload;
     const library = useLibrary();
     const language = useActiveLanguage();
     const {theme, textColor, colorMode} = useTheme();

     const [userVolumeName, setUserVolumeName] = React.useState(volumeName);
     const [userNote, setUserNote] = React.useState('');

     const [isSubmitting, setIsSubmitting] = React.useState(false);

     const handleSubmission = async () => {
          const request = {
               title: workTitle,
               author: author ?? null,
               volumeName: userVolumeName ?? null,
               note: userNote ?? null,
               recordId: recordId ?? null
          };
          //logDebugMessage("Submitting local ill request email");
          //logDebugMessage(request);
          await submitLocalIllRequestEmail(library.baseUrl, request).then(async (result) => {
               setIsSubmitting(false);
               //logDebugMessage("Result from submitting local ill request email");
               //logDebugMessage(result);
               if (result.success) {
                    navigation.goBack();
               } else {
                    popAlert(result.api.title, result.api.message, 'error');
               }
          });
     };

     return (
          <ScrollView>
               <VStack space="md" style={{ padding: 16 }}>
                    <FormControl style={{ marginVertical: 8 }}>
                         <FormControlLabel>
                              <FormControlLabelText size="sm" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'title')}
                              </FormControlLabelText>
                         </FormControlLabel>
                         <Input isReadOnly={true}>
                              <InputField
                                   id="title"
                                   size="$lg"
                                   value={workTitle}
                                   defaultValue={workTitle}
                                   isReadOnly={true}
                              />
                         </Input>
                    </FormControl>
                    <FormControl style={{ marginVertical: 8 }}>
                         <FormControlLabel>
                              <FormControlLabelText size="sm" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'author')}
                              </FormControlLabelText>
                         </FormControlLabel>
                         <Input isReadOnly={true}>
                              <InputField
                                   id="author"
                                   size="$lg"
                                   value={author}
                                   defaultValue={author}
                              />
                         </Input>
                    </FormControl>
                    <FormControl style={{ marginVertical: 8 }}>
                         <FormControlLabel>
                              <FormControlLabelText size="sm" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'volume')}
                              </FormControlLabelText>
                         </FormControlLabel>
                         <Input style={{ borderColor: colorMode === 'light' ? theme.tokens.colors.ui.border.light : theme.tokens.colors.ui.border.dark }}>
                              <InputField
                                   id="volume"
                                   size="$lg"
                                   value={userVolumeName}
                                   defaultValue={volumeName}
                                   onChangeText={(text) => {
                                        setUserVolumeName(text);
                                   }}
                              />
                         </Input>
                    </FormControl>
                    <FormControl style={{ marginVertical: 8 }}>
                         <FormControlLabel>
                              <FormControlLabelText size="sm" style={{ color: textColor }}>
                                   {getTermFromDictionary(language, 'note')}
                              </FormControlLabelText>
                         </FormControlLabel>
                         <Textarea
                              id="note"
                              size="$lg"
                         >
                              <TextareaInput
                                   style={{ color: textColor }}
                                   value={userNote}
                                   defaultValue={userNote}
                                   onChangeText={(text) => {
                                        setUserNote(text);
                                   }}
                              />
                         </Textarea>
                    </FormControl>
                    <ButtonGroup>
                         <Button
                              isLoading={isSubmitting}
                              isLoadingText={getTermFromDictionary(language, 'saving', true)}
                              onPress={() => {
                                   setIsSubmitting(true);
                                   handleSubmission();
                              }}>
                              <ButtonText>{getTermFromDictionary(language, 'submit')}</ButtonText>
                         </Button>
                         <Button
                              variant="outline"
                              onPress={() => {
                                   navigation.goBack()
                              }}>
                              <ButtonText>{getTermFromDictionary(language, 'close_window')}</ButtonText>
                         </Button>
                    </ButtonGroup>
               </VStack>
          </ScrollView>
     );
};
