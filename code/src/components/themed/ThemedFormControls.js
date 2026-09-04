import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { Icon as UIIcon, CloseIcon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { useTheme } from '../../themes/theme';

export const ThemedInput = React.forwardRef(({ style, ...props }, ref) => {
     const { uiColors, colorMode } = useTheme();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;

     return <Input ref={ref} style={[{ borderColor }, style]} {...props} />;
});

export const ThemedInputField = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <InputField ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

export const PasswordVisibilityToggle = ({ showPassword, onPress, style }) => {
     const { textColor } = useTheme();

     return (
          <InputSlot onPress={onPress}>
               <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color={textColor} style={[{ marginRight: 8 }, style]} />
          </InputSlot>
     );
};

export const ThemedIcon = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <UIIcon ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

export const ThemedCloseIcon = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <CloseIcon ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedInput.displayName = 'ThemedInput';
ThemedInputField.displayName = 'ThemedInputField';
ThemedIcon.displayName = 'ThemedIcon';
ThemedCloseIcon.displayName = 'ThemedCloseIcon';
