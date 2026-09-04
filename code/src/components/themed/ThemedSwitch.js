import React from 'react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '../../themes/theme';

// The v5 Switch primitive only sizes the track/thumb via a scale transform -- it sets no
// trackColor/thumbColor at all, so every switch in the app currently falls back to the OS default
// (green on iOS) instead of the library's brand color. v1.0.48 drove this via real RN Switch props
// (trackColor/ios_backgroundColor), so restore that here using runtimeColors.primary.
export const ThemedSwitch = React.forwardRef(({ trackColor, ...props }, ref) => {
     const { runtimeColors, uiColors, colorMode } = useTheme();
     const offColor = colorMode === 'light' ? uiColors.border.light : uiColors.border.dark;
     const resolvedTrackColor = trackColor ?? { false: offColor, true: runtimeColors.primary[500] };

     return <Switch ref={ref} trackColor={resolvedTrackColor} ios_backgroundColor={resolvedTrackColor.false} {...props} />;
});

ThemedSwitch.displayName = 'ThemedSwitch';
