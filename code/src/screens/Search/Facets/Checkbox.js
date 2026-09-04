import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { logDebugMessage } from '../../../util/logging.js';
import { useTheme } from '../../../themes/theme';


export const Facet_Checkbox = ({ data, category, values = [], updateCheckboxFacet }) => {
     const {theme, textColor } = useTheme();
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
                    <CheckboxIndicator style={isChecked ? { borderColor: theme.tokens.colors.primary['500'], backgroundColor: theme.tokens.colors.primary['500'] } : undefined}>
                         {isChecked ? <CheckboxIcon as={MaterialIcons} style={{ color: theme.tokens.colors.primary['500-text'] }} size="sm" /> : null}
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
