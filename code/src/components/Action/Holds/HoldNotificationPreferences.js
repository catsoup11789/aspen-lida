import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import _ from 'lodash';
import { getTermFromDictionary } from '@/src/translations/TranslationService';
import { useTranslationWithValues } from '@/src/hooks/useTranslationWithValues';
import { ThemedInput, ThemedInputField } from '../../themed/ThemedFormControls';
import { ThemedCheckbox as Checkbox, ThemedCheckboxIcon as CheckboxIcon, ThemedCheckboxIndicator as CheckboxIndicator, ThemedCheckboxLabel as CheckboxLabel } from '../../themed/ThemedCheckbox';
import { FormControl, FormControlHelper, FormControlHelperText, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { CheckIcon } from '@/components/ui/icon';
import { ThemedSelect as Select, ThemedSelectBackdrop as SelectBackdrop, ThemedSelectContent as SelectContent, ThemedSelectDragIndicator as SelectDragIndicator, ThemedSelectDragIndicatorWrapper as SelectDragIndicatorWrapper, ThemedSelectInput as SelectInput, ThemedSelectItem as SelectItem, ThemedSelectPortal as SelectPortal, ThemedSelectScrollView as SelectScrollView, ThemedSelectTrigger as SelectTrigger } from '../../themed/ThemedSelect';
import { Text } from '@/components/ui/text';

/**
 * HoldNotificationPreferences component for displaying notification preferences for holds.
 * @param props
 * @returns {React.JSX.Element}
 * @constructor
 */
export const HoldNotificationPreferences = (props) => {
     const { textColor, uiColors, runtimeColors, user, language, emailNotification, setEmailNotification, phoneNotification, setPhoneNotification, smsNotification, setSMSNotification, smsCarrier, setSMSCarrier, smsNumber, setSMSNumber, phoneNumber, setPhoneNumber, colorMode } = props;
     const insets = useSafeAreaInsets();

     const holdNotificationInfo = user.holdNotificationInfo;
     const smsCarriers = holdNotificationInfo.smsCarriers;

     const { text: emailNotificationLabel } = useTranslationWithValues(
          'hold_email_notification',
          user.email ?? null,
          { enabled: !!user.email, addToDictionary: true, initialValue: 'Yes, by email' }
     );

     return (
          <>
               <Text size="sm" style={{ color: textColor, marginBottom: 8 }}>
                    {getTermFromDictionary(language, 'hold_notify_for_pickup')}
               </Text>
               {user.email ? (
                    <FormControl style={{ marginBottom: 8 }}>
                         <Checkbox
                              size="sm"
                              name="emailNotification"
                              defaultIsChecked={emailNotification}
                              onChange={(value) => {
                                   setEmailNotification(value);
                              }}>
                              <CheckboxIndicator style={{ marginRight: 8 }}>
                                   <CheckboxIcon as={CheckIcon} />
                              </CheckboxIndicator>
                              <CheckboxLabel style={{ color: textColor }}>{emailNotificationLabel}</CheckboxLabel>
                         </Checkbox>
                    </FormControl>
               ) : null}
               <FormControl style={{ marginBottom: 8 }}>
                    <Checkbox
                         size="sm"
                         name="phoneNotification"
                         defaultIsChecked={phoneNotification}
                         onChange={(value) => {
                              setPhoneNotification(value);
                         }}>
                         <CheckboxIndicator style={{ marginRight: 8 }}>
                              <CheckboxIcon as={CheckIcon} />
                         </CheckboxIndicator>
                         <CheckboxLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'hold_phone_notification')}</CheckboxLabel>
                    </Checkbox>
               </FormControl>
               {phoneNotification ? (
                    <>
                         <FormControl style={{ marginBottom: 8 }}>
                              <FormControlLabel>
                                   <FormControlLabelText size="sm" style={{ color: textColor }}>
                                        {getTermFromDictionary(language, 'hold_phone_number')}
                                   </FormControlLabelText>
                              </FormControlLabel>
                              <ThemedInput>
                                   <ThemedInputField name="phoneNumber" defaultValue={phoneNumber} accessibilityLabel={getTermFromDictionary(language, 'hold_phone_number')} onChangeText={(value) => setPhoneNumber(value)} />
                              </ThemedInput>
                         </FormControl>
                    </>
               ) : null}
               {!_.isEmpty(smsCarriers) ? (
                    <>
                         <FormControl style={{ marginBottom: 4 }}>
                              <Checkbox
                                   size="sm"
                                   name="smsNotification"
                                   defaultIsChecked={smsNotification}
                                   onChange={(value) => {
                                        setSMSNotification(value);
                                   }}>
                                   <CheckboxIndicator style={{ marginRight: 8 }}>
                                        <CheckboxIcon as={CheckIcon} />
                                   </CheckboxIndicator>
                                   <CheckboxLabel style={{ color: textColor }}>{getTermFromDictionary(language, 'hold_sms_notification')}</CheckboxLabel>
                              </Checkbox>
                         </FormControl>
                         {smsNotification ? (
                              <>
                                   <FormControl style={{ marginBottom: 4 }}>
                                        <FormControlLabel>
                                             <FormControlLabelText size="sm" style={{ color: textColor }}>
                                                  {getTermFromDictionary(language, 'hold_sms_carrier')}
                                             </FormControlLabelText>
                                        </FormControlLabel>

                                        <Select name="smsCarrier" selectedValue={smsCarrier} accessibilityLabel={getTermFromDictionary(language, 'hold_sms_select_carrier')} onValueChange={(itemValue) => setSMSCarrier(itemValue)}>
                                             <SelectTrigger variant="outline" size="md">
                                                  {smsCarrier && smsCarrier !== -1 ? (
                                                       _.map(smsCarriers, function (carrier, selectedIndex, array) {
                                                            if (selectedIndex === smsCarrier) {
                                                                 return <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder="Select a Carrier" value={carrier} />;
                                                            }
                                                       })
                                                  ) : (
                                                       <SelectInput style={{ paddingVertical: 0, color: textColor }} placeholder="Select a Carrier" />
                                                  )}
                                             </SelectTrigger>
                                             <SelectPortal useRNModal={true}>
                                                  <SelectBackdrop />
                                                  <SelectContent style={{ backgroundColor: colorMode === 'light' ? uiColors.surface.light : uiColors.surface.dark, paddingBottom: Platform.OS === 'android' ? insets.bottom + 16 : 16 }}>
                                                       <SelectDragIndicatorWrapper>
                                                            <SelectDragIndicator />
                                                       </SelectDragIndicatorWrapper>
                                                       <SelectScrollView>
                                                            {_.map(smsCarriers, function (carrier, index, array) {
                                                                 if (index === smsCarrier) {
                                                                      return <SelectItem key={index} label={carrier} value={index} style={{ backgroundColor: runtimeColors.tertiary[300] }} textStyle={{ color: runtimeColors.tertiary['500-text'] }} />;
                                                                 }
                                                                 return <SelectItem key={index} label={carrier} value={index} style={{ backgroundColor: smsCarrier === index ? runtimeColors.tertiary[300] : 'transparent' }} textStyle={{ color: smsCarrier === index ? runtimeColors.tertiary['500-text'] : textColor }} />;
                                                            })}
                                                       </SelectScrollView>
                                                  </SelectContent>
                                             </SelectPortal>
                                        </Select>
                                        <FormControlHelper style={{ marginBottom: 8 }}>
                                             <FormControlHelperText size="xs" style={{ color: textColor }}>
                                                  {getTermFromDictionary(language, 'hold_sms_charges')}
                                             </FormControlHelperText>
                                        </FormControlHelper>
                                   </FormControl>
                                   <FormControl>
                                        <FormControlLabel>
                                             <FormControlLabelText size="sm" style={{ color: textColor }}>
                                                  {getTermFromDictionary(language, 'hold_sms_number')}
                                             </FormControlLabelText>
                                        </FormControlLabel>
                                        <ThemedInput>
                                             <ThemedInputField name="smsNumber" defaultValue={smsNumber} accessibilityLabel={getTermFromDictionary(language, 'hold_sms_number')} onChangeText={(value) => setSMSNumber(value)} />
                                        </ThemedInput>
                                        <FormControlHelper style={{ marginBottom: 8 }}>
                                             <FormControlHelperText size="xs" style={{ color: textColor }}>
                                                  {getTermFromDictionary(language, 'hold_sms_format')}
                                             </FormControlHelperText>
                                        </FormControlHelper>
                                   </FormControl>
                              </>
                         ) : null}
                    </>
               ) : null}
          </>
     );
};
