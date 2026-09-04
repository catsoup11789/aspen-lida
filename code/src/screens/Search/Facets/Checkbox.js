import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ThemedCheckbox as Checkbox, ThemedCheckboxIcon as CheckboxIcon, ThemedCheckboxIndicator as CheckboxIndicator, ThemedCheckboxLabel as CheckboxLabel } from '../../../components/themed/ThemedCheckbox';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { logDebugMessage } from '@/src/util/logging';
import { useTheme } from '@/src/themes/theme';

/**
 * Facet_Checkbox component that renders a checkbox for a given facet option. It handles the checked state and updates the parent component when the checkbox is toggled.
 * @param param0
 * @param param0.data
 * @param param0.category
 * @param param0.values
 * @param param0.updateCheckboxFacet
 * @returns {React.JSX.Element}
 * @constructor
 */
export const Facet_Checkbox = ({ data, category, values = [], updateCheckboxFacet }) => {
     const { textColor, runtimeColors } = useTheme();
     const isChecked = values.includes(data.value);
     const handleChange = (newValue) => {
          logDebugMessage("Clicked on " + data.value + " isChecked is " + isChecked + " newValue is " + newValue);
          updateCheckboxFacet(category, data.value, newValue);
     };

     return (
          <HStack style={{ alignItems: 'center', paddingHorizontal: 12, paddingVertical: 16 }}>
               <Checkbox
                    value={data.value}
                    accessibilityLabel={data.display}
                    isChecked={isChecked}
                    onChange={(value) => {
                         handleChange(value);
                    }}>
                    <CheckboxIndicator style={isChecked ? { borderColor: runtimeColors.primary[500], backgroundColor: runtimeColors.primary[500] } : undefined}>
                         {isChecked ? <CheckboxIcon as={MaterialIcons} style={{ color: runtimeColors.primary['500-text'] }} size="sm" /> : null}
                    </CheckboxIndicator>
                    <CheckboxLabel style={{ paddingLeft: 8 }}>
                         <Text style={{ color: textColor }}>
                              {data.display}
                              {data.count ? ` (${data.count})` : ''}
                         </Text>
                    </CheckboxLabel>
               </Checkbox>
          </HStack>
     );
};
