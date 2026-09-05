import React from 'react';
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';
// gluestack's own checked-state source of truth (also used internally by its CheckboxIcon
// visibility wrapper) -- not part of the package's public entry, but it's the only thing that
// correctly reflects isChecked for EVERY control mode (controlled isChecked, uncontrolled
// defaultIsChecked, and CheckboxGroup value-membership), unlike a prop-driven context of our own.
import { useCheckbox } from '@gluestack-ui/core/lib/esm/checkbox/creator/CheckboxProvider';
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

export const ThemedCheckbox = React.forwardRef(({ size = 'sm', isChecked, ...props }, ref) => {
     return (
          <CheckboxSizeContext.Provider value={size}>
               <Checkbox ref={ref} isChecked={isChecked} {...props} />
          </CheckboxSizeContext.Provider>
     );
});

// gluestack's own checkboxIndicatorStyle bakes in color classes at two levels: an unconditional
// border-input/dark:bg-input/30 (governs the unchecked state) and data-[checked=true]:bg-primary/
// border-primary (governs checked) -- both use ITS generic theme --primary/--input, not ours, and
// both win over our inline checkedStyle below. Neutralizing all of them via matching-shape
// transparent classes so our style-based runtimeColors is the only thing actually setting color.
const CHECKED_COLOR_NEUTRALIZER =
     'border-transparent dark:bg-transparent ' +
     'data-[checked=true]:bg-transparent data-[checked=true]:border-transparent dark:data-[checked=true]:bg-transparent dark:data-[checked=true]:border-transparent';

export const ThemedCheckboxIndicator = React.forwardRef(({ className, style, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const { isChecked } = useCheckbox('CheckboxContext');
     const sizeStyle = resolveCheckboxSizeStyle(size);
     const { runtimeColors } = useTheme();
     const checkedStyle = isChecked
          ? { borderColor: runtimeColors.primary[500], backgroundColor: runtimeColors.primary[500] }
          : { borderColor: runtimeColors.primary[500] };

     return <CheckboxIndicator ref={ref} className={[sizeStyle.indicator, CHECKED_COLOR_NEUTRALIZER, className].filter(Boolean).join(' ')} style={[{ marginRight: 8 }, checkedStyle, style]} {...props} />;
});

// Same issue as the indicator -- checkboxIconStyle bakes in text-primary-foreground (gluestack's
// generic theme color, not ours), so it's neutralized the same way and the real color comes
// entirely from style below.
export const ThemedCheckboxIcon = React.forwardRef(({ as, name, className, style, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);
     const { runtimeColors } = useTheme();

     return <CheckboxIcon ref={ref} as={as ?? MaterialIcons} name={name ?? 'check'} className={[sizeStyle.icon, 'text-transparent', className].filter(Boolean).join(' ')} style={[{ color: runtimeColors.primary['500-text'] }, style]} {...props} />;
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
