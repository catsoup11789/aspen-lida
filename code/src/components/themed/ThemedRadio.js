import React from 'react';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { useTheme } from '../../themes/theme';

// Radio's current sm/md/lg indicator sizes (16/20/24px) already match gluestack v1 exactly.
// The one drift: v1's RadioIndicator used a flat 2px border regardless of size
// (packages/config/src/theme/RadioIndicator.ts), vs the current primitive's plain `border`
// (1px) default -- restoring that here. Everything else re-exports unchanged.
export const ThemedRadio = Radio;
export const ThemedRadioGroup = RadioGroup;
export const ThemedRadioIcon = RadioIcon;

// color: textColor was already being passed manually at nearly every call site -- baked in
// here as a default, overridable via the caller's own style prop.
export const ThemedRadioLabel = React.forwardRef(({ style, ...props }, ref) => {
     const { textColor } = useTheme();

     return <RadioLabel ref={ref} style={[{ color: textColor }, style]} {...props} />;
});

ThemedRadioLabel.displayName = 'ThemedRadioLabel';

export const ThemedRadioIndicator = React.forwardRef(({ className, ...props }, ref) => {
     return <RadioIndicator ref={ref} className={['border-2', className].filter(Boolean).join(' ')} {...props} />;
});

ThemedRadioIndicator.displayName = 'ThemedRadioIndicator';
