import React from 'react';
import { Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import { resolveAlertColors } from './statusStyles';
import { useTheme } from '../../themes/theme';

// The real action is still forwarded to the underlying Toast (callers/tests read props.action off
// the rendered root), but variant is forced to gluestack's own 'solid' -- real status coloring is
// 100% inline (colors below), so gluestack's own action/variant-driven classes never switch per
// status; inline style always wins over them for the properties that matter.
export const ThemedToast = React.forwardRef(({ action, variant = 'solid', className, style, ...props }, ref) => {
     const { runtimeColors, resolvedUiColors } = useTheme();
     const colors = resolveAlertColors(action, runtimeColors, resolvedUiColors);
     const isAccent = variant === 'accent';
     const colorStyle = isAccent
          ? { backgroundColor: colors.bg, borderLeftColor: colors.icon }
          : { backgroundColor: colors.bg, borderColor: colors.bg };
     const structureClasses = isAccent ? 'border-0 border-l-4 shadow-soft-4' : null;

     return <Toast ref={ref} action={action} variant="solid" className={[structureClasses, className].filter(Boolean).join(' ')} style={[colorStyle, style]} {...props} />;
});

export const ThemedToastTitle = React.forwardRef(({ action, variant, className, style, ...props }, ref) => {
     const { runtimeColors, resolvedUiColors } = useTheme();
     const colors = resolveAlertColors(action, runtimeColors, resolvedUiColors);

     return <ToastTitle ref={ref} className={className} style={[{ color: colors.text }, style]} {...props} />;
});

export const ThemedToastDescription = React.forwardRef(({ className, ...props }, ref) => {
     return <ToastDescription ref={ref} className={className} {...props} />;
});

ThemedToast.displayName = 'ThemedToast';
ThemedToastTitle.displayName = 'ThemedToastTitle';
ThemedToastDescription.displayName = 'ThemedToastDescription';
