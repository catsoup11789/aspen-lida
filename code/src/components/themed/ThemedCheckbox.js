import React from 'react';
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from '@/components/ui/checkbox';

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
     return CHECKBOX_SIZE_STYLES[size] ?? CHECKBOX_SIZE_STYLES.md;
}

const CheckboxSizeContext = React.createContext('md');

export const ThemedCheckbox = React.forwardRef(({ size = 'md', ...props }, ref) => {
     return (
          <CheckboxSizeContext.Provider value={size}>
               <Checkbox ref={ref} {...props} />
          </CheckboxSizeContext.Provider>
     );
});

export const ThemedCheckboxIndicator = React.forwardRef(({ className, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);

     return <CheckboxIndicator ref={ref} className={[sizeStyle.indicator, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedCheckboxIcon = React.forwardRef(({ className, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);

     return <CheckboxIcon ref={ref} className={[sizeStyle.icon, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedCheckboxLabel = React.forwardRef(({ className, ...props }, ref) => {
     const size = React.useContext(CheckboxSizeContext);
     const sizeStyle = resolveCheckboxSizeStyle(size);

     return <CheckboxLabel ref={ref} className={[sizeStyle.label, className].filter(Boolean).join(' ')} {...props} />;
});

export const ThemedCheckboxGroup = CheckboxGroup;

ThemedCheckbox.displayName = 'ThemedCheckbox';
ThemedCheckboxIndicator.displayName = 'ThemedCheckboxIndicator';
ThemedCheckboxIcon.displayName = 'ThemedCheckboxIcon';
ThemedCheckboxLabel.displayName = 'ThemedCheckboxLabel';
