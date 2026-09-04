import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { loadingSpinner } from '../../components/loadingSpinner';
import { refreshProfile, submitLocalIllRequest } from '../../util/api/user';
import { useLibraryLocation } from '../../hooks/useLibraryBranchData';
import { useLibrary } from '../../hooks/useLibrarySystemData';
import { useUserState, useUpdateUserProfile } from '../../hooks/useUserData';
import { loadError } from '../../components/loadError';
import { getLocalIllForm } from '../../util/api/system';
import { logDebugMessage, logErrorMessage, logInfoMessage, getErrorMessage } from '../../util/logging';
import { stripHTML } from '../../helpers/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useActiveLanguage } from '../../hooks/useLanguageData';
import { useTheme } from '../../themes/theme';
import { ThemedAlert, ThemedAlertText } from '../../components/themed/ThemedAlert';
import { Box } from '@/components/ui/box';
import { ThemedButton as Button, ThemedButtonSpinner as ButtonSpinner, ThemedButtonText as ButtonText } from '../../components/themed/ThemedButton';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { HStack } from '@/components/ui/hstack';
import { CheckIcon, ChevronDownIcon, Icon } from '@/components/ui/icon';
import { Input, InputField } from '@/components/ui/input';
import { ScrollView } from '@/components/ui/scroll-view';
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectInput, SelectItem, SelectPortal, SelectScrollView, SelectTrigger } from '@/components/ui/select';
import { Text } from '@/components/ui/text';
import { Textarea, TextareaInput } from '@/components/ui/textarea';

/**
 * CreateLocalIllRequest component that fetches the local ILL form configuration and renders a request form for users to submit local ILL requests. It handles form submission, error handling, and user profile updates.
 * @returns {React.JSX.Element}
 * @constructor
 */
export const CreateLocalIllRequest = () => {
     const [formConfig, setFormConfig] = React.useState([]);
      const [hasError, setHasError] = React.useState(false);
     const library = useLibrary();
     const location = useLibraryLocation();
     const route = useRoute();

     const id = route.params.id;
     const title = route.params.workTitle ?? null;
     const volumeId = route.params.volumeId ?? null;
     const volumeName = route.params.volumeName ?? null;

     if (String(location.localIllFormId) === '-1' || location.localIllFormId === null) {
          return loadError('The ILL System is not setup properly, please contact your library to place a request', '');
     }

     logInfoMessage("Local ILL Form Id " + location.localIllFormId);
     logInfoMessage("ID " + route.params.id);
     logInfoMessage("Volume ID " + volumeId);
     logInfoMessage("Volume Name " + volumeName);

     const { status, data, error, isFetching, refetch } = useQuery({
          queryKey: ['localIllForm', location.localIllFormId, library.baseUrl],
          queryFn: () => getLocalIllForm(library.baseUrl, location.localIllFormId),
          onSuccess: (data) => {
               try {
                    if (data.ok) {
                         setFormConfig(data.data.result);
                    }
               } catch (e) {
                    setHasError(true);
                    logDebugMessage('Error fetching local ILL form configuration');
                    logDebugMessage(data);
                    getErrorMessage(data.code, data.data.result);
               }
          },
          onError: (error) => {
               logDebugMessage('Error fetching local ILL form configuration');
               logErrorMessage(error);
          } });

     useFocusEffect(
          React.useCallback(() => {
               try {
                    if (data.ok) {
                         setFormConfig(data.data.result);
                    }
               } catch (e) {
                    refetch();
               }
          }, [])
     );

     return <>{status === 'loading' || isFetching ? loadingSpinner() : (hasError || status === 'error') ? loadError('The ILL System is not setup properly, please contact your library to place a request', '') : <Request config={formConfig} workId={id} workTitle={title} volumeId={volumeId} volumeName={volumeName} />}</>;
};

/**
 * Request component that renders the form for creating a local interlibrary loan (ILL) request. It manages the state of the form fields and handles the submission of the request.
 * @param payload
 * @returns {React.JSX.Element}
 * @constructor
 */
const Request = (payload) => {
     const [title, setTitle] = React.useState('');
     const [note, setNote] = React.useState('');
     const [acceptFee, setAcceptFee] = React.useState(false);
     const [pickupLocation, setPickupLocation] = React.useState();
      const [isSubmitting, setIsSubmitting] = React.useState(false);
     const [errorMessage, setErrorMessage] = React.useState('');
     const library = useLibrary();
     const { data: userState } = useUserState();
     const user = userState?.user ?? {};
     const updateUserProfile = useUpdateUserProfile();
     const language = useActiveLanguage();
     const { colorMode, textColor, runtimeColors, uiColors } = useTheme();
     const navigation = useNavigation();
     const queryClient = useQueryClient();
     const insets = useSafeAreaInsets();

     const { config, workId, workTitle, volumeId, volumeName } = payload;

     const refreshAndSaveUserProfile = React.useCallback(async () => {
          const profileResponse = await refreshProfile(library.baseUrl);
          if (profileResponse?.ok && profileResponse?.data?.result?.profile) {
               await updateUserProfile(profileResponse.data.result.profile);
          }
     }, [library.baseUrl, updateUserProfile]);

     // Make sure we have a valid config object before trying to render the form
     if (!config || !config.fields || typeof config.fields !== 'object') {
          logDebugMessage('Local ILL Form configuration is invalid');
          logDebugMessage(config);
          return loadError('The ILL System is not setup properly, please contact your library to place a request', '');
     }

     const handleSubmission = async () => {
          const request = {
               title: title ?? workTitle,
               acceptFee: acceptFee,
               note: note ?? null,
               catalogKey: workId ?? null,
               pickupLocation: pickupLocation ?? null,
               volumeId: volumeId };
          await submitLocalIllRequest(library.baseUrl, request).then(async (result) => {
               setIsSubmitting(false);
               if (result.success) {
                    setErrorMessage('');
                    navigation.goBack();
                    queryClient.invalidateQueries({ queryKey: ['holds', user.id, library.baseUrl, language] });
                    await refreshAndSaveUserProfile();
               } else {
                    setErrorMessage(result.message);
               }
          });
     };

     const getIntroText = () => {
          const field = config.fields.introText;
          if (field.display === 'show') {
               return (
                    <Text size="sm" style={{ paddingBottom: 12, color: textColor }}>
                         {stripHTML(field.label)}
                    </Text>
               );
          }
          return null;
     };

     const getTitleField = () => {
          const field = config.fields.title;
          if (field.display === 'show') {
               let fullTitle = workTitle;
               if (volumeName !== undefined) {
                    fullTitle += " " + volumeName;
               }
               return (
                    <FormControl style={{ marginVertical: 8 }} isRequired={field.required}>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{field.label}</FormControlLabelText>
                         </FormControlLabel>
                         <Input>
                              <InputField
                                   name={field.property}
                                   defaultValue={fullTitle}
                                   accessibilityLabel={field.description ?? field.label}
                                   onChangeText={(value) => {
                                        setTitle(value);
                                   }}
                              />
                         </Input>
                    </FormControl>
               );
          }
          return null;
     };

     const getFeeInformation = () => {
          const field = config.fields.feeInformationText;
          if (field.display === 'show' && field.label && field.label.trim() !== '') {
               return (
                    <Text bold style={{ color: textColor }}>
                         {stripHTML(field.label)}
                    </Text>
               );
          }
          return null;
     };

     const getAcceptFeeCheckbox = () => {
          const field = config.fields.acceptFee;
          if (field.display === 'show') {
               return (
                    <FormControl style={{ marginVertical: 8, maxWidth: '90%' }} isRequired={field.required}>
                         <Checkbox
                              value="accept"
                              accessibilityLabel={field.description ?? field.label}
                              onChange={(value) => {
                                   setAcceptFee(value);
                              }}>
                              <CheckboxIndicator style={{ marginRight: 8 }}>
                                   <CheckboxIcon>
                                        <CheckIcon />
                                   </CheckboxIcon>
                              </CheckboxIndicator>
                              <CheckboxLabel>
                                   <Text style={{ color: textColor }}>{field.label}</Text>
                              </CheckboxLabel>
                         </Checkbox>
                    </FormControl>
               );
          }
          return null;
     };

     const getNoteField = () => {
          const field = config.fields.note;
          if (field.display === 'show') {
               return (
                    <FormControl style={{ marginVertical: 8 }} isRequired={field.required}>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{field.label}</FormControlLabelText>
                         </FormControlLabel>
                         <Textarea>
                              <TextareaInput
                                   name={field.property}
                                   value={note}
                                   accessibilityLabel={field.description ?? field.label}
                                   onChangeText={(text) => {
                                        setNote(text);
                                   }}
                              />
                         </Textarea>
                    </FormControl>
               );
          }
          return null;
     };

     const getPickupLocations = () => {
          const field = config.fields.pickupLocation;
          if (field.display === 'show' && Array.isArray(field.options)) {
               const locations = field.options;
               return (
                    <FormControl style={{ marginVertical: 8 }} isRequired={field.required}>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{field.label}</FormControlLabelText>
                         </FormControlLabel>
                         <Select
                              selectedValue={pickupLocation}
                              onValueChange={(itemValue) => {
                                   setPickupLocation(itemValue);
                              }}>
                              <SelectTrigger variant="outline" size="md">
                                   {pickupLocation ? (
                                        locations.map((location, index) => {
                                             if (location.code === pickupLocation) {
                                                  return <SelectInput style={{ paddingVertical: 0, color: textColor }} key={index} value={location.displayName} />;
                                             }
                                        })
                                   ) : (
                                        <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder="Select a pickup location" />
                                   )}
                                   <Icon as={ChevronDownIcon} style={{ marginRight: 12, color: textColor }} />
                              </SelectTrigger>
                              <SelectPortal>
                                   <SelectBackdrop />
                                   <SelectContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                        <SelectDragIndicatorWrapper>
                                             <SelectDragIndicator />
                                        </SelectDragIndicatorWrapper>
                                        <SelectScrollView>
                                             {locations.map((location, index) => {
                                                  return <SelectItem key={index} label={location.displayName} value={location.code} style={{ backgroundColor: pickupLocation === location.code ? runtimeColors.tertiary[300] : 'transparent' }} textStyle={{ color: pickupLocation === location.code ? runtimeColors.tertiary['500-text'] : textColor }} />;
                                             })}
                                        </SelectScrollView>
                                   </SelectContent>
                              </SelectPortal>
                         </Select>
                    </FormControl>
               );
          }
          return null;
     };

     const getCatalogKeyField = () => {
          const field = config.fields.catalogKey;
          if (field.display === 'show') {
               return (
                    <FormControl style={{ marginVertical: 8 }} isDisabled isRequired={field.required}>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{field.label}</FormControlLabelText>
                         </FormControlLabel>
                         <Input>
                              <InputField name={field.property} defaultValue={catalogKey} accessibilityLabel={field.description ?? field.label} />
                         </Input>
                    </FormControl>
               );
          }
          return null;
     };

     const getVolumeIdField = () => {
          const field = config.fields.volumeId;
          if (field.display === 'show') {
               return (
                    <FormControl style={{ marginVertical: 8 }} isDisabled isRequired={field.required}>
                         <FormControlLabel>
                              <FormControlLabelText style={{ color: textColor }}>{field.label}</FormControlLabelText>
                         </FormControlLabel>
                         <Input>
                              <InputField name={field.property} defaultValue={volumeId} accessibilityLabel={field.description ?? field.label} />
                         </Input>
                    </FormControl>
               );
          }
          return null;
     };

     const getActions = () => {
          return (
               <HStack space="md" style={{ paddingTop: 12 }}>
                    <Button
                         style={{ backgroundColor: runtimeColors.secondary[500] }}
                         isDisabled={isSubmitting}
                         onPress={() => {
                              setIsSubmitting(true);
                              handleSubmission();
                         }}>
                        <ButtonText style={{ color: runtimeColors.secondary['500-text'] }}>
                              {isSubmitting ? (
                                   <>
                                        <ButtonSpinner style={{ marginRight: 8 }} />
                                        {config.buttonLabelProcessing}
                                   </>
                              ) : (
                                   config.buttonLabel
                              )}
                         </ButtonText>
                    </Button>
                    <Button variant="outline" onPress={() => navigation.goBack()} style={{ borderColor: colorMode === 'light' ? uiColors.border.light : uiColors.border.dark }}>
                         <ButtonText style={{ color: colorMode === 'light' ? uiColors.text.light : uiColors.text.dark }}>Cancel</ButtonText>
                    </Button>
               </HStack>
          );
     };

     const getErrorMessage = () => {
          if (errorMessage) {
               return (
                    <ThemedAlert style={{ width: '100%' }} action="warning" variant="solid">
                         <ThemedAlertText action="warning" variant="solid" size="xs" bold>
                              {errorMessage}
                         </ThemedAlertText>
                    </ThemedAlert>
               );
          }
          return null;
     };

     return (
          <ScrollView>
               <Box style={{ padding: 20 }}>
                    {errorMessage ? getErrorMessage() : null}
                    {getIntroText()}
                    {getTitleField()}
                    {getNoteField()}
                    {getFeeInformation()}
                    {getAcceptFeeCheckbox()}
                    {getPickupLocations()}
                    {getCatalogKeyField()}
                    {getVolumeIdField()}
                    {getActions()}
               </Box>
          </ScrollView>
     );
};
