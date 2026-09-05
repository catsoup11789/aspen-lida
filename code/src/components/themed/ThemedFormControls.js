import React from 'react';
import { ThemedMaterialIcons as MaterialIcons } from './ThemedMaterialIcons';
import { FormControl, FormControlLabelText } from '@/components/ui/form-control';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { useTheme } from '../../themes/theme';

// paddingBottom: 20 was already being passed manually at nearly every call site -- baked in
// here as a default, overridable via the caller's own style prop. Merged into one flat object
// (not a [default, caller] array) since a caller-provided style array here ends up nested inside
// Uniwind's own className-derived style array one layer up, and the override doesn't reliably
// win once that happens -- a flat object sidesteps the ambiguity entirely.
export const ThemedFormControl = React.forwardRef(({ style, ...props }, ref) => {
     const mergedStyle = Array.isArray(style)
          ? Object.assign({ paddingBottom: 20 }, ...style.filter(Boolean))
          : { paddingBottom: 20, ...style };

     return <FormControl ref={ref} style={mergedStyle} {...props} />;
});

ThemedFormControl.displayName = 'ThemedFormControl';

// color: textColor was already being passed manually at nearly every call site -- baked in
// here as a default, overridable via the caller's own style prop.
export const ThemedFormControlLabelText = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <FormControlLabelText ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedFormControlLabelText.displayName = 'ThemedFormControlLabelText';

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
     const { resolvedUiColors } = useTheme();
     const borderColor = resolvedUiColors.border;
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
     return (
          <InputSlot onPress={onPress}>
               <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} style={[{ marginRight: 8 }, style]} />
          </InputSlot>
     );
};

// MaterialIcons "close" replaces gluestack's own CloseIcon -- unlike that one (an
// individually-generated gluestack icon without the base Icon component's size-variant
// handling, whose react-native-svg root didn't pick up a real width/height from the `size`
// prop on its own), MaterialIcons' `size` prop just works.
export const ThemedCloseIcon = React.forwardRef(({ size = 18, ...props }, ref) => {
     return <MaterialIcons ref={ref} name="close" size={size} {...props} />;
});

ThemedInput.displayName = 'ThemedInput';
ThemedInputField.displayName = 'ThemedInputField';
ThemedCloseIcon.displayName = 'ThemedCloseIcon';
