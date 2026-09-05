import React from 'react';
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert';
import { ThemedMaterialIcons as MaterialIcons } from './ThemedMaterialIcons';
import { normalizeStatusAction, resolveAlertColors } from './statusStyles';
import { useTheme } from '../../themes/theme';

const ALERT_ICON_NAMES = {
     default: 'info',
     error: 'error',
     warning: 'warning',
     success: 'check-circle',
     info: 'info',
     muted: 'info',
     none: 'info',
};

// variant is destructured (not used) only to keep it out of ...props -- otherwise it'd override
// the explicit variant="default" below via prop-spread order, changing Alert's own base classes.
export const ThemedAlert = React.forwardRef(({ action, variant, className, style, ...props }, ref) => {
     const { runtimeColors, resolvedUiColors } = useTheme();
     const colors = resolveAlertColors(action, runtimeColors, resolvedUiColors);

     return <Alert ref={ref} variant="default" className={className} style={[{ backgroundColor: colors.bg, borderColor: colors.border }, style]} {...props} />;
});

export const ThemedAlertText = React.forwardRef(({ action, variant, className, style, ...props }, ref) => {
     const { runtimeColors, resolvedUiColors } = useTheme();
     const colors = resolveAlertColors(action, runtimeColors, resolvedUiColors);

     return <AlertText ref={ref} className={className} style={[{ color: colors.text }, style]} {...props} />;
});

// Color goes through style, not the color prop -- gluestack's PrimitiveIcon (the thing that
// actually renders the `as` component) destructures color out and turns it into an SVG `stroke`
// prop instead of forwarding it, so a vector-icon `as` component like MaterialIcons never sees it.
// style passes through untouched, and the vendored icon merges style after its own color default,
// so this is the only path that actually reaches the rendered icon.
export const ThemedAlertIcon = React.forwardRef(({ action, variant, as, name, className, color, style, ...props }, ref) => {
     const normalizedAction = normalizeStatusAction(action);
     const { runtimeColors, resolvedUiColors } = useTheme();
     const colors = resolveAlertColors(action, runtimeColors, resolvedUiColors);

     return <AlertIcon ref={ref} as={as ?? MaterialIcons} name={name ?? ALERT_ICON_NAMES[normalizedAction]} style={[{ color: color ?? colors.icon }, style]} className={className} {...props} />;
});

ThemedAlert.displayName = 'ThemedAlert';
ThemedAlertText.displayName = 'ThemedAlertText';
ThemedAlertIcon.displayName = 'ThemedAlertIcon';
