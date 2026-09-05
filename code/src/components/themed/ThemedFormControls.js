import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { FormControl } from '@/components/ui/form-control';
import { Icon as UIIcon, CloseIcon } from '@/components/ui/icon';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { useTheme } from '../../themes/theme';

// paddingBottom: 20 was already being passed manually at nearly every call site -- baked in
// here as a default, overridable via the caller's own style prop.
export const ThemedFormControl = React.forwardRef(({ style, ...props }, ref) => {
     return <FormControl ref={ref} style={[{ paddingBottom: 20 }, style]} {...props} />;
});

ThemedFormControl.displayName = 'ThemedFormControl';

// The v5 Input primitive has no size variant at all (fixed min-h-9/text-sm) and hardcodes
// context={{}}, so size can't propagate the way it does for Button/Radio. Track it in a local
// context instead, mirroring ThemedCheckbox's approach.
const InputSizeContext = React.createContext('md');

const INPUT_SIZE_STYLES = {
     sm: { height: 36, fontSize: 14 },
     md: { height: 40, fontSize: 16 },
     lg: { height: 44, fontSize: 18 },
     xl: { height: 48, fontSize: 20 },
};

export const ThemedInput = React.forwardRef(({ size = 'md', style, ...props }, ref) => {
     const { uiColors, colorMode } = useTheme();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const sizeStyle = INPUT_SIZE_STYLES[size] ?? INPUT_SIZE_STYLES.md;

     return (
          <InputSizeContext.Provider value={size}>
               <Input ref={ref} style={[{ borderColor, height: sizeStyle.height }, style]} {...props} />
          </InputSizeContext.Provider>
     );
});

export const ThemedInputField = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();
     const size = React.useContext(InputSizeContext);
     const sizeStyle = INPUT_SIZE_STYLES[size] ?? INPUT_SIZE_STYLES.md;

     return <InputField ref={ref} style={[{ color: textColor, fontSize: sizeStyle.fontSize }, style]} {...props} />;
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

     // CloseIcon is one of the individually-generated gluestack icons (created via createIcon()
     // without the base Icon component's size-variant handling), so its react-native-svg root
     // doesn't pick up a real width/height from the `size` prop/variant on its own — it renders
     // unconstrained (and grows to fill any available flex space) unless given an explicit numeric
     // width/height here.
     return <CloseIcon ref={ref} style={[{ color: textColor, width: 18, height: 18 }, style]} {...props} />;
});

ThemedInput.displayName = 'ThemedInput';
ThemedInputField.displayName = 'ThemedInputField';
ThemedIcon.displayName = 'ThemedIcon';
ThemedCloseIcon.displayName = 'ThemedCloseIcon';
