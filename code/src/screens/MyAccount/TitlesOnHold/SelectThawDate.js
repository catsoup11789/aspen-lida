import React from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { freezeHold, freezeHolds } from '../../../util/api/user';
import { getTermFromDictionary } from '../../../translations/TranslationService';
import {logDebugMessage, logWarnMessage} from "../../../util/logging";
import { useActiveLanguage } from '../../../hooks/useLanguageData';
import { useTheme } from '../../../themes/theme';
import { ActionsheetIcon, ActionsheetItem, ActionsheetItemText } from '@/components/ui/actionsheet';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Modal, ModalBackdrop, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader } from '@/components/ui/modal';

export const SelectThawDate = (props) => {
     const { freezingLabel, freezeLabel, label, libraryContext, onClose, freezeId, recordId, source, userId, resetGroup } = props;
     let data = props.data;
     const language = useActiveLanguage();
     const { theme, textColor, colorMode } = useTheme();
     const [loading, setLoading] = React.useState(false);
     const [isDatePickerVisible, setDatePickerVisibility] = React.useState(false);
     const [showIndefiniteWarning, setShowIndefiniteWarning] = React.useState(false);
     const [freezeIndefinite, setFreezeIndefinite] = React.useState(false);
     const modalBg = colorMode === 'light' ? theme.tokens.colors.ui.surface.light : theme.tokens.colors.ui.surface.dark;

     let actionLabel = freezeLabel;
     if (label) {
          actionLabel = label;
     }


     const today = new Date();
     const [date, setDate] = React.useState(today);
     const pickerThemeProps = Platform.OS === 'ios'
          ? {
               themeVariant: colorMode === 'dark' ? 'dark' : 'light',
               textColor: colorMode === 'dark' ? '#ffffff' : undefined,
          }
          : {};


     const showDatePicker = () => {
          if(libraryContext.reactivateDateNotRequired ?? false)
          {
               setShowIndefiniteWarning(true);
          }
          else
          {
               //setShowIndefiniteWarning(true);
               setDatePickerVisibility(true);
          }

     };

     const hideDatePicker = () => {
          setDatePickerVisibility(false);
          setShowIndefiniteWarning(false);
     };

     const onSelectDate = (date) => {
          hideDatePicker();
          setLoading(true);
          logWarnMessage('A date has been picked: ', date);
          setDate(date);
          onClose();
          if (data) {
               freezeHolds(data, libraryContext.baseUrl, date, language, libraryContext.reactivateDateNotRequired ?? false).then((result) => {
                    setLoading(false);
                    resetGroup();
                    hideDatePicker();
               });
          } else {
               freezeHold(freezeId, recordId, source, libraryContext.baseUrl, userId, date, language, libraryContext.reactivateDateNotRequired ?? false).then((result) => {
                    setLoading(false);
                    resetGroup();
                    hideDatePicker();
               });
          }
     };

     return (
          <>
               <ActionsheetItem onPress={showDatePicker}>
                    {data ? null : (
                         <ActionsheetIcon>
                              <Icon as={MaterialIcons} name="pause" size="md" style={{ marginRight: 4, color: textColor }} />
                         </ActionsheetIcon>
                    )}
                    <ActionsheetItemText style={{ color: textColor }}>{actionLabel}</ActionsheetItemText>
               </ActionsheetItem>

               {/* Moved avoidKeyboard to ModalContent where v1 tracks layouts */}
               <Modal isOpen={showIndefiniteWarning} onClose={hideDatePicker} size="full">
                    <ModalBackdrop />
                    <ModalContent
                        style={{ backgroundColor: modalBg, maxWidth: '95%' }}
                        avoidKeyboard
                    >
                         <ModalHeader>
                             <Heading size="sm" style={{ color: textColor }}>{actionLabel}</Heading>
                             <ModalCloseButton style={{ padding: 12 }} onPress={hideDatePicker}>
                                  <Icon as={CloseIcon} style={{ color: textColor }} />
                             </ModalCloseButton>
                         </ModalHeader>

                         <ModalBody>
                              <FormControl>
                                   <FormControlLabel>
                                        <FormControlLabelText style={{ color: textColor }}>
                                             {getTermFromDictionary("en", "freeze_indefinite_warning")}
                                        </FormControlLabelText>
                                   </FormControlLabel>

                                   <Checkbox
                                        isChecked={freezeIndefinite}
                                        onChange={(value) => setFreezeIndefinite(value)}
                                        aria-label={getTermFromDictionary("en", "freeze_indefinite_checkbox")}
                                        value="freeze-indefinite"
                                   >
                                        <CheckboxIndicator style={freezeIndefinite ? { borderColor: theme.tokens.colors.primary['500'], backgroundColor: theme.tokens.colors.primary['500'] } : undefined}>
                                             <CheckboxIcon
                                                  as={MaterialIcons}
                                                  name="check"
                                                  style={{ color: theme.tokens.colors.primary['500-text'] }}
                                                  size="sm"
                                             />
                                        </CheckboxIndicator>
                                        <CheckboxLabel style={{ paddingLeft: 8, color: textColor }}>
                                             {getTermFromDictionary("en", "freeze_indefinite_checkbox")}
                                        </CheckboxLabel>
                                   </Checkbox>
                              </FormControl>
                         </ModalBody>

                         <ModalFooter>
                              {/* Streamlined ButtonGroup for v1 (Removed the conflicting HStack component wrapper) */}
                              <ButtonGroup space="md" style={{ flexDirection: 'row' }}>
                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        onPress={hideDatePicker}
                                   >
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>
                                             {getTermFromDictionary("en", "cancel")}
                                        </ButtonText>
                                   </Button>

                                   <Button
                                        style={{ backgroundColor: theme.tokens.colors.primary['500'] }}
                                        onPress={() => {
                                             if (freezeIndefinite) {
                                                  onSelectDate();
                                             } else {
                                                  setDatePickerVisibility(true);
                                             }
                                        }}
                                   >
                                        <ButtonText style={{ color: theme.tokens.colors.primary['500-text'] }}>
                                             {freezeIndefinite
                                                  ? getTermFromDictionary("en", "freeze_hold_without_reactivation")
                                                  : getTermFromDictionary("en", "freeze_hold_choose_reactivation")}
                                        </ButtonText>
                                   </Button>
                              </ButtonGroup>
                         </ModalFooter>
                    </ModalContent>
               </Modal>

               <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    date={date}
                    mode="date"
                    onConfirm={onSelectDate}
                    onCancel={hideDatePicker}
                    isDarkModeEnabled={colorMode === "dark"}
                    minimumDate={today}
                    confirmTextIOS={loading ? freezingLabel : actionLabel}
                    {...pickerThemeProps}
               />
          </>
     );
};
