import React from 'react';
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
import { ThemedMaterialIcons as MaterialIcons } from './ThemedMaterialIcons';
import { useTheme } from '../../themes/theme';

// Checkbox's underlying gluestack v5 primitive has no size variant at all -- the indicator,
// icon, and label are all fixed (16px / 14px / text-sm) regardless of the size prop. Restoring
// gluestack v1's actual per-size values here (v1.0.48, packages/config/src/theme/Checkbox.ts
// + CheckboxIndicator.ts) via a local context, since the underlying primitive doesn't
// propagate size through context the way Button/Radio do.
const CHECKBOX_SIZE_STYLES = {
     sm: { indicator: 'w-4 h-4 border-2', icon: 'h-3 w-3', label: 'text-sm' },
     md: { indicator: 'w-5 h-5 border-2', icon: 'h-4 w-4', label: 'text-base' },
     lg: { indicator: 'w-6 h-6 border-[3px]', icon: 'h-[18px] w-[18px]', label: 'text-lg' },
};

function resolveCheckboxSizeStyle(size) {
     return CHECKBOX_SIZE_STYLES[size] ?? CHECKBOX_SIZE_STYLES.sm;
}

const CheckboxSizeContext = React.createContext('sm');
// Real checked state, threaded from the isChecked prop callers already pass to ThemedCheckbox --
// this is a plain (non-portal) tree so, unlike ThemedSelect, ordinary React Context works fine here.
const CheckboxCheckedContext = React.createContext(false);

export const ThemedCheckbox = React.forwardRef(({ size = 'sm', isChecked, ...props }, ref) => {
     return (
          <CheckboxSizeContext.Provider value={size}>
               <CheckboxCheckedContext.Provider value={!!isChecked}>
                    <Checkbox ref={ref} isChecked={isChecked} {...props} />
               </CheckboxCheckedContext.Provider>
          </CheckboxSizeContext.Provider>
     );
});

export const ThemedCheckboxIndicator = React.forwardRef(({ className, style, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const isChecked = React.useContext(CheckboxCheckedContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);
     const { runtimeColors, uiColors, colorMode } = useTheme();
     const borderColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const checkedStyle = isChecked ? { borderColor: runtimeColors.primary[500], backgroundColor: runtimeColors.primary[500] } : { borderColor };

     return <CheckboxIndicator ref={ref} className={[sizeStyle.indicator, className].filter(Boolean).join(' ')} style={[{ marginRight: 8 }, checkedStyle, style]} {...props} />;
});

export const ThemedCheckboxIcon = React.forwardRef(({ as, name, className, style, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);
     const { runtimeColors } = useTheme();

     return <CheckboxIcon ref={ref} as={as ?? MaterialIcons} name={name ?? 'check'} className={[sizeStyle.icon, className].filter(Boolean).join(' ')} style={[{ color: runtimeColors.primary['500-text'] }, style]} {...props} />;
});

export const ThemedCheckboxLabel = React.forwardRef(({ className, style, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);
     const { textColor } = useTheme();

     return <CheckboxLabel ref={ref} className={[sizeStyle.label, className].filter(Boolean).join(' ')} style={[{ color: textColor }, style]} {...props} />;
});

export const ThemedCheckboxGroup = CheckboxGroup;

ThemedCheckbox.displayName = 'ThemedCheckbox';
ThemedCheckboxIndicator.displayName = 'ThemedCheckboxIndicator';
ThemedCheckboxIcon.displayName = 'ThemedCheckboxIcon';
ThemedCheckboxLabel.displayName = 'ThemedCheckboxLabel';
